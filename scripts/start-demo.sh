#!/usr/bin/env bash
# Cold start: Docker + Cloudflare quick tunnel + auto .env + rebuild → print demo URLs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="${BACKEND_DIR:-${ROOT}/../publishing-backend}"
LOG="/tmp/cloudflared-fullstack.log"
ENV_EXAMPLE="${BACKEND}/.env.tunnel.example"
ENV_FILE="${BACKEND}/.env"
CF_PID=""

cleanup() {
  if [[ -n "${CF_PID}" ]]; then
    kill "${CF_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing: $1"
    case "$1" in
      cloudflared) echo "Install: brew install cloudflared" ;;
      docker) echo "Start Docker Desktop first." ;;
    esac
    exit 1
  fi
}

write_tunnel_env() {
  local host="$1"
  if [[ ! -f "${ENV_EXAMPLE}" ]]; then
    echo "Missing ${ENV_EXAMPLE}"
    exit 1
  fi
  # HOST is the full tunnel hostname (e.g. foo-bar.trycloudflare.com).
  sed "s/HOST/${host}/g" "${ENV_EXAMPLE}" > "${ENV_FILE}"
  if grep -q '\.trycloudflare\.com\.trycloudflare\.com' "${ENV_FILE}"; then
    echo "ERROR: malformed ${ENV_FILE} (double trycloudflare.com)"
    exit 1
  fi
  echo "    Wrote ${ENV_FILE} (HOST=${host})"
}

wait_for_tunnel_url() {
  local url=""
  local i
  for i in $(seq 1 60); do
    url="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "${LOG}" 2>/dev/null | head -1 || true)"
    if [[ -n "${url}" ]]; then
      echo "${url}"
      return 0
    fi
    sleep 1
  done
  return 1
}

require_cmd docker
require_cmd cloudflared

if [[ ! -d "${BACKEND}" ]]; then
  echo "Backend dir not found: ${BACKEND}"
  exit 1
fi

echo "==> Docker Compose (${BACKEND})"
(cd "${BACKEND}" && docker compose up -d --build)

if curl -sf -o /dev/null "http://127.0.0.1/login"; then
  echo "    Local OK: http://localhost/login"
else
  echo "    WARN: http://127.0.0.1/login failed — check: cd ${BACKEND} && docker compose ps"
fi

pkill -f "cloudflared tunnel --url http://127.0.0.1:80" 2>/dev/null || true
sleep 1

echo ""
echo "==> Cloudflare quick tunnel → http://127.0.0.1:80"
: > "${LOG}"
cloudflared tunnel --url http://127.0.0.1:80 >>"${LOG}" 2>&1 &
CF_PID=$!

TUNNEL_URL="$(wait_for_tunnel_url)" || {
  echo "Timeout waiting for tunnel URL (60s). Log: ${LOG}"
  tail -20 "${LOG}" 2>/dev/null || true
  exit 1
}

HOST="${TUNNEL_URL#https://}"
HOST="${HOST%%/*}"

echo "    Tunnel URL: ${TUNNEL_URL}"
write_tunnel_env "${HOST}"

echo ""
echo "==> Rebuild backend + frontend with tunnel env"
(cd "${BACKEND}" && docker compose up -d --build backend frontend)

echo ""
echo "==> Waiting for public HTTPS (optional)"
REMOTE_OK=0
for _ in $(seq 1 15); do
  if curl -sf -o /dev/null "${TUNNEL_URL}/login" && curl -sf -o /dev/null "${TUNNEL_URL}/works"; then
    REMOTE_OK=1
    break
  fi
  sleep 2
done
if [[ "${REMOTE_OK}" -eq 0 ]]; then
  echo "    WARN: ${TUNNEL_URL} not ready yet — wait a few seconds and retry"
  echo "    If the page is blank: keep this terminal open (tunnel dies on Ctrl+C)"
  echo "    and hard-refresh / open in a private window after rebuild."
fi

echo ""
echo "========================================"
echo "  Готово — Folio demo"
echo "========================================"
echo "  Вход:    ${TUNNEL_URL}/login"
echo "  Каталог: ${TUNNEL_URL}/works"
echo "  Локально: http://localhost/login"
echo ""
echo "  Log: ${LOG}"
echo "  Не закрывайте этот терминал — туннель живёт, пока открыт процесс."
echo "  Ctrl+C — остановить туннель."
echo "========================================"
echo ""

# Keep tunnel running; disable EXIT kill on successful wait path — trap still runs on Ctrl+C
wait "${CF_PID}"
