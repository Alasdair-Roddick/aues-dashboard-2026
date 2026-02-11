#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Blue-Green Deployment Script for AUES Dashboard
# Runs on the AUES PC (VPS). Called by GitHub Actions via SSH.
#
# Usage: ./deploy.sh <image:tag>
# Example: ./deploy.sh ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
# ============================================================

IMAGE="${1:?Usage: deploy.sh <image:tag>}"

# --- Configuration ---
APP_NAME="aues-dashboard"
ENV_FILE="/opt/aues-dashboard/.env"
NGINX_UPSTREAM="/etc/nginx/conf.d/aues-dashboard-upstream.conf"
UPLOADS_VOLUME="aues-uploads"
BLUE_PORT=5055
GREEN_PORT=5056
HEALTH_PATH="/api/health"
HEALTH_RETRIES=30
HEALTH_INTERVAL=2

log() { echo "[deploy $(date '+%H:%M:%S')] $*"; }
die() { log "ERROR: $*"; exit 1; }

# --- Determine current live color ---
get_running_color() {
    if docker ps --filter "name=${APP_NAME}-blue" --filter "status=running" -q | grep -q .; then
        echo "blue"
    elif docker ps --filter "name=${APP_NAME}-green" --filter "status=running" -q | grep -q .; then
        echo "green"
    else
        echo ""
    fi
}

OLD_COLOR=$(get_running_color)

if [ "$OLD_COLOR" = "blue" ]; then
    NEW_COLOR="green"
    NEW_PORT=$GREEN_PORT
    OLD_PORT=$BLUE_PORT
elif [ "$OLD_COLOR" = "green" ]; then
    NEW_COLOR="blue"
    NEW_PORT=$BLUE_PORT
    OLD_PORT=$GREEN_PORT
else
    log "First deployment -- no running container found"
    NEW_COLOR="blue"
    NEW_PORT=$BLUE_PORT
    OLD_PORT=""
fi

log "Strategy: ${OLD_COLOR:-none} -> ${NEW_COLOR} (port ${NEW_PORT})"

# --- Pull new image ---
log "Pulling ${IMAGE}..."
docker pull "${IMAGE}" || die "Failed to pull image"

# --- Clean up any stale container for the target color ---
if docker ps -a --filter "name=${APP_NAME}-${NEW_COLOR}" -q | grep -q .; then
    log "Removing stale ${NEW_COLOR} container..."
    docker rm -f "${APP_NAME}-${NEW_COLOR}" 2>/dev/null || true
fi

# --- Start new container ---
log "Starting ${APP_NAME}-${NEW_COLOR} on host port ${NEW_PORT}..."
docker run -d \
    --name "${APP_NAME}-${NEW_COLOR}" \
    --env-file "${ENV_FILE}" \
    -e PORT=5055 \
    -e NODE_ENV=production \
    -e AUTH_TRUST_HOST=true \
    -e AUTH_URL=https://dashboard.aues.com.au \
    -p "${NEW_PORT}:5055" \
    -v "${UPLOADS_VOLUME}:/app/public/uploads" \
    --restart unless-stopped \
    "${IMAGE}" || die "Failed to start container"

# --- Health check ---
log "Running health checks (max ${HEALTH_RETRIES} attempts)..."
HEALTHY=false
for i in $(seq 1 "${HEALTH_RETRIES}"); do
    if curl -sf --max-time 5 "http://localhost:${NEW_PORT}${HEALTH_PATH}" > /dev/null 2>&1; then
        HEALTHY=true
        log "Health check passed (attempt ${i}/${HEALTH_RETRIES})"
        break
    fi
    if [ "$i" -lt "$HEALTH_RETRIES" ]; then
        sleep "${HEALTH_INTERVAL}"
    fi
done

if [ "$HEALTHY" = false ]; then
    log "Health check failed after ${HEALTH_RETRIES} attempts"
    log "Container logs:"
    docker logs --tail 50 "${APP_NAME}-${NEW_COLOR}" 2>&1 || true
    log "Removing failed container..."
    docker rm -f "${APP_NAME}-${NEW_COLOR}" 2>/dev/null || true
    if [ -n "$OLD_COLOR" ]; then
        log "Old container (${OLD_COLOR}) remains live"
    fi
    die "Deployment aborted due to failed health check"
fi

# --- Swap nginx upstream ---
log "Updating nginx upstream -> 127.0.0.1:${NEW_PORT}"
sudo tee "${NGINX_UPSTREAM}" > /dev/null <<EOF
# Managed by deploy.sh -- do not edit manually
# Active: ${NEW_COLOR} (port ${NEW_PORT})
# Deployed: $(date -u '+%Y-%m-%dT%H:%M:%SZ')
upstream aues_dashboard {
    server 127.0.0.1:${NEW_PORT};
}
EOF

# Validate nginx config before reloading
if ! sudo nginx -t 2>&1; then
    log "Nginx config test FAILED -- reverting upstream"
    if [ -n "$OLD_PORT" ]; then
        sudo tee "${NGINX_UPSTREAM}" > /dev/null <<EOF2
upstream aues_dashboard {
    server 127.0.0.1:${OLD_PORT};
}
EOF2
    fi
    docker rm -f "${APP_NAME}-${NEW_COLOR}" 2>/dev/null || true
    die "Nginx config invalid. Rolled back."
fi

sudo nginx -s reload
log "Nginx reloaded"

# --- Drain and remove old container ---
if [ -n "$OLD_COLOR" ]; then
    log "Draining old ${OLD_COLOR} container (5s grace period)..."
    sleep 5
    docker rm -f "${APP_NAME}-${OLD_COLOR}" 2>/dev/null || true
    log "Old ${OLD_COLOR} container removed"
fi

# --- Image cleanup ---
log "Pruning dangling images..."
docker image prune -f 2>/dev/null || true

log "===================================="
log "Deployment complete!"
log "Live: ${NEW_COLOR} on port ${NEW_PORT}"
log "===================================="
