Here’s a clean, repo-ready **`DEPLOYMENT.md`** you can drop straight into your project.

You can copy-paste this exactly into a file called `DEPLOYMENT.md`.

---

````md
# Deployment Guide  
**AUES Dashboard 2026 — Homelab → GHCR → AUES PC**

This project is deployed using a two-machine workflow:

- **Homelab** = build machine  
- **AUES PC (VPS)** = runtime machine  
- **GitHub Container Registry (GHCR)** = image store  
- **Neon** = database (runtime only)

The VPS never builds. It only pulls pre-built images.

---

## 🧱 Assumptions

- Dockerfile builds without `DATABASE_URL`
- Image is private on GHCR
- Database credentials are injected at runtime
- Docker and Docker Compose are installed on both machines

---

# 🖥️ PART 1 — Homelab (Build + Push)

## 1. Login to GHCR (once)

```bash
docker login ghcr.io -u alasdair-roddick
````

Password = GitHub Personal Access Token with **write packages** permission.

---

## 2. Build the image

From the project directory:

```bash
docker build -t ghcr.io/alasdair-roddick/aues-dashboard-2026:latest .
```

Verify:

```bash
docker images | grep aues-dashboard
```

---

## 3. Push the image

```bash
docker push ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
```

Image now exists at:

GitHub → Repo → Packages → `aues-dashboard-2026`

(Keep it private.)

---

# 🖥️ PART 2 — AUES PC (Pull + Run)

## 1. Login to GHCR (once)

```bash
docker login ghcr.io -u alasdair-roddick
```

Password = GitHub Personal Access Token with **read packages** permission.

---

## 2. Create `.env` file (on AUES PC)

```bash
nano .env
```

Example:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-xxxx.neon.tech/neondb?sslmode=require
AUTH_URL=https://dashboard.aues.org.au
```

---

## 3. `docker-compose.yml`

Example:

```yaml
services:
  app:
    image: ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
    container_name: aues-dashboard-app
    ports:
      - "5055:5055"
    env_file:
      - .env
    restart: unless-stopped
```

---

## 4. Pull the image

```bash
docker pull ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
```

---

## 5. Run the container

```bash
docker compose up -d
```

---

## 6. Check logs

```bash
docker logs -f aues-dashboard-app
```

Expected output:

```text
Ready in XXXms
```

---

# 🔁 Update / Redeploy Flow

## On Homelab

```bash
git pull
docker build -t ghcr.io/alasdair-roddick/aues-dashboard-2026:latest .
docker push ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
```

---

## On AUES PC

```bash
docker pull ghcr.io/alasdair-roddick/aues-dashboard-2026:latest
docker compose up -d
```

No rebuilds on the VPS.

---

# 🔐 Security Rules

* Never put `DATABASE_URL` in Dockerfile
* Never bake secrets into images
* Database is runtime-only
* Keep GHCR image private
* Rotate Neon password if leaked
* VPS logs in to GHCR once only

---

# 🧪 Debugging

## Check env inside container

```bash
docker inspect aues-dashboard-app | grep DATABASE_URL
```

---

## Test DB manually

```bash
psql "$DATABASE_URL"
```

---

## List running containers

```bash
docker ps
```

---

# 🧠 Architecture Model

```text
Homelab:   build → push
GHCR:      store image
AUES PC:   pull → run
DB:        runtime only
```

---