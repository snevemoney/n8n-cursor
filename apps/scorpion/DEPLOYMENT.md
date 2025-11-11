# 🦂 Scorpion Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Access to GitHub Container Registry (ghcr.io)
- Production environment variables configured

## Local Build & Test

### Build Docker Image

```bash
# From workspace root
./scripts/build-scorpion.sh

# Or manually:
docker build -t scorpion:local -f apps/scorpion/Dockerfile .
```

### Test Locally

```bash
# Run with volume mounts for data persistence
docker run -p 3003:3003 \
  -v $(pwd)/apps/scorpion/data/scorpion:/app/data/scorpion \
  -v $(pwd)/apps/scorpion/backups:/app/backups/scorpion \
  -e SCORPION_STORAGE_AUTO_DETECT=false \
  -e SCORPION_SSD_PATH=/app/data/scorpion \
  -e N8N_API_URL=http://host.docker.internal:5678 \
  scorpion:local
```

### Test with Docker Compose

```bash
# Start just Scorpion (requires other services running)
docker compose -f infra/docker/docker-compose.prod.yml up scorpion

# Or start full stack
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

## Production Deployment

### 1. Build and Push to Registry

**Note:** CI/CD workflow needs to be updated to include Scorpion. For now, manual build:

```bash
# Build
docker build -t ghcr.io/YOUR_ORG/scorpion:prod -f apps/scorpion/Dockerfile .

# Login to GitHub Container Registry
echo "$GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Push
docker push ghcr.io/YOUR_ORG/scorpion:prod
```

### 2. Update CI/CD Workflow

When ready to deploy, update `.github/workflows/deploy-prod.yml`:

```yaml
# In build-push job, add scorpion to the build loop:
for s in landing web ops api worker scorpion; do
  if [ "$s" = "scorpion" ]; then
    docker build -t ghcr.io/${{ github.repository }}/scorpion:prod -f apps/scorpion/Dockerfile .
  else
    docker build -t ghcr.io/${{ github.repository }}/lfai-$s:prod apps/$s
  fi
done

# In deploy-green job, add:
docker pull ghcr.io/${{ github.repository }}/scorpion:prod
```

### 3. Environment Variables

Ensure `.env.production` includes:

```bash
# Scorpion Configuration
SCORPION_STORAGE_AUTO_DETECT=false
SCORPION_SSD_PATH=/app/data/scorpion
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
SCORPION_MODEL_SOURCE=ollama
N8N_API_URL=http://n8n:5678
N8N_API_KEY=${N8N_API_KEY}
```

### 4. Caddy Configuration

Add to your Caddyfile:

```caddyfile
scorpion.yourdomain.com {
    reverse_proxy 127.0.0.1:3003
    log {
        output file /var/log/caddy/scorpion.log
        format json
    }
}
```

### 5. Deploy

```bash
# Pull latest image
docker pull ghcr.io/YOUR_ORG/scorpion:prod

# Start service
docker compose -f infra/docker/docker-compose.prod.yml up -d scorpion

# Check health
curl http://localhost:3003/healthz
curl http://localhost:3003/api/health
```

## Monitoring

- Health check: `http://localhost:3003/healthz`
- Metrics: `http://localhost:3003/api/metrics`
- Prometheus scraping: Configured in `monitoring/prometheus/prometheus.yml`

## Troubleshooting

### Build Fails - Workspace Dependencies

If build fails due to missing workspace packages, ensure:
- `pnpm-lock.yaml` exists at workspace root
- All workspace packages are present
- Build context is workspace root (not `apps/scorpion`)

### Container Won't Start

Check logs:
```bash
docker logs <container-id>
docker compose -f infra/docker/docker-compose.prod.yml logs scorpion
```

### Data Not Persisting

Verify volumes are mounted:
```bash
docker inspect <container-id> | grep -A 10 Mounts
```

Ensure data directory exists and has correct permissions:
```bash
mkdir -p data/scorpion
chmod 755 data/scorpion
```

## Resource Limits

Current production limits (adjust as needed):
- CPU: 2 cores
- Memory: 2GB
- PIDs: 400

Monitor usage and adjust in `docker-compose.prod.yml` if needed.

