#!/bin/zsh

# Backend deployment script
# Usage: ./deploy.sh

# ── Config ────────────────────────────────────────────────────────────────────
SERVER_DIR="/home/todoapi.fullstack.cat"
PM2_APP="todoapi-app"
GIT_BRANCH="master"
# ─────────────────────────────────────────────────────────────────────────────

echo "=== DEPLOYING BACKEND: $PM2_APP ==="

echo "Changing into server directory"
cd $SERVER_DIR

echo "Syncing repository"
git pull origin $GIT_BRANCH

echo "Syncing dependencies"
npm ci

echo "Building application"
npm run build

echo "Restarting PM2"
pm2 restart $PM2_APP
pm2 logs $PM2_APP --lines 20 --nostream

echo "✓ Backend deployment complete! Check the site."
