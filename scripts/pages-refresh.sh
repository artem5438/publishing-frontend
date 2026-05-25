#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$(cd "${ROOT}/../publishing-backend" && pwd)"
LOG="/tmp/cloudflared-pages.log"
(cd "${BACKEND_DIR}" && docker compose up -d minio minio-init)
if ! pgrep -f "cloudflared tunnel --url http://127.0.0.1:9000" >/dev/null; then
  : > "${LOG}"
  cloudflared tunnel --url http://127.0.0.1:9000 >>"${LOG}" 2>&1 &
  sleep 8
fi
HOST="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "${LOG}" | head -1)"
MEDIA="${HOST}/publishing-media"
echo "${MEDIA}" > "${ROOT}/.pages-media-url.local"
echo "VITE_MEDIA_BASE_URL=${MEDIA}"
curl -sI "${MEDIA}/print-digital.jpg" | head -1
echo "Update GitHub secret, then Run workflow: Deploy Frontend To GitHub Pages"
