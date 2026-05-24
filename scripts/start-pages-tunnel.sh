#!/usr/bin/env bash
# Start a quick HTTPS tunnel to local MinIO for GitHub Pages media.
# Keep this terminal open while demoing https://artem5438.github.io/publishing-frontend/

set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/../../publishing-backend" && pwd)"

echo "==> Ensuring MinIO is up (${BACKEND_DIR})"
(cd "${BACKEND_DIR}" && docker compose up -d minio minio-init)

echo ""
echo "==> Starting Cloudflare quick tunnel to http://127.0.0.1:9000"
echo "    After the URL appears, set GitHub secret VITE_MEDIA_BASE_URL to:"
echo "    https://<host>/publishing-media"
echo "    Then re-run Actions: Deploy Frontend To GitHub Pages"
echo ""

exec cloudflared tunnel --url http://127.0.0.1:9000
