#!/usr/bin/env bash
# Deprecated wrapper — use start-demo.sh (auto .env + rebuild + demo URLs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "${ROOT}/scripts/start-demo.sh" "$@"
