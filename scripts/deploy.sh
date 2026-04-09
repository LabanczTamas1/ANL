#!/bin/bash
set -e

APP_DIR="/opt/anl"
COMPOSE_DIR="/opt/anl/backend"

echo "🚀 Deploying..."

cd $APP_DIR
git checkout main
git pull origin main

cd $COMPOSE_DIR
docker compose down
docker compose up -d --build

echo "✅ Done!"
