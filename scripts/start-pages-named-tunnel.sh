#!/usr/bin/env bash
# Stable HTTPS tunnel for GitHub Pages → local MinIO (named Cloudflare Tunnel).
# Quick tunnel (start-pages-tunnel.sh) still works but changes URL every restart.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$(cd "${ROOT}/../publishing-backend" && pwd)"
CONFIG="${CLOUDFLARE_TUNNEL_CONFIG:-${ROOT}/cloudflared/config.yml}"

echo "==> Ensuring MinIO is up (${BACKEND_DIR})"
(cd "${BACKEND_DIR}" && docker compose up -d minio minio-init)

if [[ ! -f "${CONFIG}" ]]; then
  echo "Missing ${CONFIG}"
  echo "Copy cloudflared/config.example.yml → cloudflared/config.yml and complete Cloudflare setup."
  echo "Or use quick tunnel: ./scripts/start-pages-tunnel.sh"
  exit 1
fi

HOSTNAME="$(grep -E '^\s+hostname:' "${CONFIG}" | head -1 | awk '{print $2}')"
if [[ -z "${HOSTNAME}" || "${HOSTNAME}" == "media.yourdomain.example.com" ]]; then
  echo "Set a real hostname in ${CONFIG} (ingress.hostname)."
  exit 1
fi

export VITE_MEDIA_BASE_URL="https://${HOSTNAME}/publishing-media"
echo ""
echo "Stable media base (set once in GitHub secret VITE_MEDIA_BASE_URL):"
echo "  ${VITE_MEDIA_BASE_URL}"
echo ""
echo "Test: curl -sI \"${VITE_MEDIA_BASE_URL}/print-digital.jpg\" | head -1"
echo "Keep this process running during Pages demo."
echo ""

exec cloudflared tunnel --config "${CONFIG}" run
