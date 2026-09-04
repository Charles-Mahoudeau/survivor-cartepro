#!/usr/bin/env sh
set -e
echo "Loading images into docker..."
docker load < docker-images.tar.gz

# The API refuses to boot without a signing secret, and a committed one would
# ship the same key to every demonstration. Generated once, then kept in .env so
# restarting does not invalidate the sessions already open.
if ! grep -q '^BETTER_AUTH_SECRET=' .env 2>/dev/null; then
  echo "Generating BETTER_AUTH_SECRET..."
  secret=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  echo "BETTER_AUTH_SECRET=$secret" >> .env
fi

echo "Starting containers..."
docker compose up -d
echo "App ready on: http://cartepro.localhost"
