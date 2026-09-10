#!/usr/bin/env sh
set -e
echo "Loading images into docker..."
docker load < docker-images.tar.gz

echo "Starting containers..."
docker compose up -d
echo "App ready on: https://cartepro.localhost"
