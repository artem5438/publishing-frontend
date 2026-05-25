#!/usr/bin/env bash
# Build Tauri guest app with LAN MinIO base URL.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LAN_IP="$("${ROOT}/scripts/detect-lan-ip.sh")"
export VITE_APP_PROFILE=tauri-guest
export VITE_MEDIA_BASE_URL="http://${LAN_IP}:9000/publishing-media"

echo "VITE_MEDIA_BASE_URL=${VITE_MEDIA_BASE_URL}"
echo "Ensure MinIO is up: cd ../publishing-backend && docker compose up -d minio minio-init"

cd "${ROOT}"
npm run build:tauri-guest-ui
npm run build:tauri
echo "Done: src-tauri/target/release/bundle/macos/Folio Guest.app"
