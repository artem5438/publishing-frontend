#!/usr/bin/env bash
# Print LAN IP for Tauri / Kind demos (macOS).
set -euo pipefail
for iface in en0 en1; do
  ip="$(ipconfig getifaddr "${iface}" 2>/dev/null || true)"
  if [[ -n "${ip}" ]]; then
    echo "${ip}"
    exit 0
  fi
done
echo "127.0.0.1"
