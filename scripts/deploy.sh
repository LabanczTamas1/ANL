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
git fetch origin main
git checkout main
git reset --hard origin/main
log "✅ Code updated to $(git rev-parse --short HEAD)"

# ── Rebuild and restart containers ──────────────────────────────────────────
cd $COMPOSE_DIR

# Store current image ID for rollback
PREV_IMAGE=$(docker compose images -q backend 2>/dev/null || echo "")

log "🔨 Building new image..."
docker compose build backend

log "♻️  Restarting services..."
docker compose up -d --remove-orphans

# ── Health check ────────────────────────────────────────────────────────────
log "⏳ Waiting for backend to be healthy..."
ELAPSED=0
until curl -sf $HEALTH_URL > /dev/null 2>&1; do
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    log "❌ Health check failed after ${MAX_WAIT}s — rolling back!"
    docker compose down
    docker compose up -d
    exit 1
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

log "✅ Deployment complete! Backend healthy at $HEALTH_URL"
log "📦 Containers running:"
docker compose ps --format "table {{.Name}}\t{{.Status}}"
