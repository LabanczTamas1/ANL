#!/bin/bash
set -e

APP_DIR="/opt/anl"
COMPOSE_DIR="/opt/anl/backend"
HEALTH_URL="http://localhost:3001/health"
MAX_WAIT=60

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }

log "🚀 Starting deployment..."

# ── Pull latest code ────────────────────────────────────────────────────────
cd $APP_DIR

# Preserve .env.docker before reset
cp $COMPOSE_DIR/.env.docker /tmp/.env.docker.bak 2>/dev/null || true

git fetch origin main
git checkout main
git reset --hard origin/main

# Restore .env.docker after reset
cp /tmp/.env.docker.bak $COMPOSE_DIR/.env.docker 2>/dev/null || true

log "✅ Code updated to $(git rev-parse --short HEAD)"

# ── Rebuild and restart containers ──────────────────────────────────────────
cd $COMPOSE_DIR

# Store current image ID for rollback
PREV_IMAGE=$(docker compose images -q backend 2>/dev/null || echo "")

log "🔨 Building new image (no cache)..."
docker compose build --no-cache backend

log "♻️  Restarting services..."
docker compose rm -sf backend 2>/dev/null || true
docker compose up -d --remove-orphans

# ── Health check ────────────────────────────────────────────────────────────
# ── Prepare Hetzner volume directory ───────────────────────────────────────
HETZNER_VOL="/mnt/HC_Volume_105365621"
if mountpoint -q "$HETZNER_VOL"; then
  mkdir -p "$HETZNER_VOL/postgres"
  log "✅ Hetzner volume ready at $HETZNER_VOL"
else
  log "⚠️  WARNING: $HETZNER_VOL is not mounted — postgres data will not persist!"
  log "   Mount the Hetzner volume and re-deploy."
fi

log "⏳ Waiting for backend to be healthy..."
ELAPSED=0
until curl -sf $HEALTH_URL > /dev/null 2>&1; do
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    log "❌ Health check failed after ${MAX_WAIT}s"
    log "📋 Backend logs:"
    docker compose logs backend --tail=30
    exit 1
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

log "✅ Deployment complete! Backend healthy at $HEALTH_URL"
log "📦 Containers running:"
docker compose ps --format "table {{.Name}}\t{{.Status}}"
