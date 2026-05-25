#!/usr/bin/env bash
# Smoke-check media endpoints for phase 1 checklist.
set -euo pipefail

MEDIA_BASE="${1:-http://localhost/publishing-media}"
SAMPLE="${MEDIA_BASE%/}/print-digital.jpg"

echo "Checking ${SAMPLE}"
code="$(curl -sS -o /dev/null -w '%{http_code}' "${SAMPLE}" || echo "000")"
if [[ "${code}" == "200" ]]; then
  echo "OK (${code})"
  exit 0
fi

echo "FAIL (HTTP ${code}). Start MinIO: cd publishing-backend && docker compose up -d minio minio-init"
echo "Upload mock files if bucket is empty (see scripts/seed-mock-media.sh)."
exit 1
