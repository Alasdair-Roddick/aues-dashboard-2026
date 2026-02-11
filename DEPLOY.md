# Deployment Guide

**AUES Dashboard 2026 — Automated CI/CD with Blue-Green Deploys**

## Architecture

```
Push to main
    |
    v
GitHub Actions (self-hosted runner on homelab)
    |-- Build Docker image
    |-- Push to ghcr.io/alasdair-roddick/aues-dashboard-2026
    |
    v
SSH into AUES PC
    |-- Pull new image
    |-- Blue-green swap (deploy.sh)
    |-- Nginx reload (zero downtime)
```

- **Homelab** = build machine (GitHub Actions self-hosted runner)
- **AUES PC** = runtime machine (Docker + nginx)
- **GHCR** = private image registry
- **Neon** = PostgreSQL database (runtime only, never in image)

## How It Works

1. Code is pushed or merged to `main`
2. GitHub Actions triggers on the homelab self-hosted runner
3. Docker image is built and pushed to GHCR with `latest` + `sha-<commit>` tags
4. CI SSHs into the AUES PC and runs `deploy.sh`
5. `deploy.sh` does a blue-green swap:
   - Detects current live container (blue on :5055 or green on :5056)
   - Starts the OTHER color with the new image
   - Health checks `/api/health` with retries
   - Swaps nginx upstream and reloads
   - Removes the old container after a 5s drain

If the health check fails, the new container is killed and the old one stays live.

---

## One-Time Setup

### GitHub Repo Secrets

Go to **Settings > Secrets and variables > Actions** and add:

| Secret           | Value                                 |
| ---------------- | ------------------------------------- |
| `DEPLOY_HOST`    | IP or hostname of the AUES PC         |
| `DEPLOY_USER`    | SSH username on the AUES PC           |
| `DEPLOY_SSH_KEY` | Private SSH key (ed25519 recommended) |

`GITHUB_TOKEN` is automatic and has `packages:write` for GHCR.

### Homelab (Build Machine)

1. **Install the GitHub Actions self-hosted runner:**

```bash
# Go to: github.com/alasdair-roddick/aues-dashboard-2026/settings/actions/runners/new
# Follow the instructions for Linux
# Install as a systemd service:
sudo ./svc.sh install
sudo ./svc.sh start
```

2. **Ensure Docker is installed** and the runner user is in the `docker` group:

```bash
sudo usermod -aG docker $USER
```

### AUES PC (Runtime Machine)

1. **Create deployment directory and copy the deploy script:**

```bash
sudo mkdir -p /opt/aues-dashboard/deploy
# Copy deploy/deploy.sh from this repo to /opt/aues-dashboard/deploy/
chmod +x /opt/aues-dashboard/deploy/deploy.sh
```

2. **Create the `.env` file:**

```bash
sudo nano /opt/aues-dashboard/.env
```

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-xxxx.neon.tech/neondb?sslmode=require
AUTH_URL=https://dashboard.aues.com.au
AUTH_SECRET=<your-auth-secret>
ENCRYPTION_KEY=<your-encryption-key>
```

3. **Create the shared uploads volume:**

```bash
docker volume create aues-uploads
```

4. **Login to GHCR:**

```bash
docker login ghcr.io -u alasdair-roddick
# Use a PAT with read:packages scope
```

5. **Set up SSH access for the deploy user:**

```bash
# Add the deploy user's public key to ~/.ssh/authorized_keys
# Grant docker permissions:
sudo usermod -aG docker <deploy-user>
```

6. **Grant passwordless nginx access to the deploy user:**

```bash
# Add to /etc/sudoers.d/deploy:
echo '<deploy-user> ALL=(ALL) NOPASSWD: /usr/sbin/nginx' | sudo tee /etc/sudoers.d/deploy
sudo chmod 440 /etc/sudoers.d/deploy
```

7. **Install nginx config:**

```bash
# Copy deploy/nginx-app.conf to /etc/nginx/sites-available/dashboard.aues.com.au
sudo ln -s /etc/nginx/sites-available/dashboard.aues.com.au /etc/nginx/sites-enabled/

# Create initial upstream file:
echo 'upstream aues_dashboard { server 127.0.0.1:5055; }' \
  | sudo tee /etc/nginx/conf.d/aues-dashboard-upstream.conf

# Get SSL certificate:
sudo certbot --nginx -d dashboard.aues.com.au

# Test and reload:
sudo nginx -t && sudo nginx -s reload
```

---

## Manual Deploy (Emergency)

If CI is down, you can deploy manually:

**On homelab:**

```bash
docker login ghcr.io -u alasdair-roddick
docker build -t ghcr.io/alasdair-roddick/aues-dashboard-2026:latest .
docker push ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
```

**On AUES PC:**

```bash
cd /opt/aues-dashboard
./deploy/deploy.sh ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
```

## Rollback

Every image is tagged with `sha-<commit>`. To rollback:

```bash
# On AUES PC:
cd /opt/aues-dashboard
./deploy/deploy.sh ghcr.io/alasdair-roddick/aues-dashboard-2026:sha-abc1234
```

---

## Debugging

```bash
# Check which container is live:
docker ps --filter "name=aues-dashboard"

# View container logs:
docker logs -f aues-dashboard-blue   # or aues-dashboard-green

# Check current nginx upstream:
cat /etc/nginx/conf.d/aues-dashboard-upstream.conf

# Health check:
curl http://localhost:5055/api/health
curl http://localhost:5056/api/health

# Check env inside container:
docker exec aues-dashboard-blue printenv AUTH_URL
```

---

## Security Rules

- Never put `DATABASE_URL` or secrets in the Dockerfile
- Database credentials are runtime-only (injected via `.env`)
- Keep GHCR image private
- SSH key for deploys should be dedicated and rotatable
- Rotate Neon password if leaked
