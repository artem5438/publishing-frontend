# Tauri macOS profiles

## 1) Guest app (stable catalog mock)

```bash
cd publishing-frontend
./scripts/build-tauri-guest.sh
```

Скрипт подставляет LAN IP (`detect-lan-ip.sh`) в `VITE_MEDIA_BASE_URL`.  
Каталог — mock; фото/видео — MinIO (`/publishing-media/<file>` → ваш base).  
Перед сборкой: `cd ../publishing-backend && docker compose up -d minio minio-init` (и `scripts/seed-mock-media.sh` при 404).

`npm run build:tauri` по умолчанию собирает профиль `tauri-guest` без авто-LAN IP.

## 2) API app (LAN backend)

Backend должен быть поднят с Tauri в `CORS_ORIGIN` (в `docker-compose.yml` по умолчанию есть `tauri://localhost`).

```bash
cd publishing-frontend
# IP без угловых скобок: ipconfig getifaddr en0
export VITE_APP_PROFILE=tauri-api
export VITE_API_BASE=http://192.168.1.118:8080/api
export VITE_MEDIA_BASE_URL=http://192.168.1.118:9000/publishing-media
npm run build:tauri-api-ui && npm run build:tauri
```

На том же Mac можно `127.0.0.1` вместо LAN IP. Альтернатива: скопировать `.env.tauri-api.example` → `.env.production.local` с вашим IP.

## Артефакт

```text
src-tauri/target/release/bundle/macos/Folio Guest.app
```

Перетащите `.app` в `Applications`.

## Матрица режимов

| Profile | Router | Data source | Auth/Orders | Use case |
|---|---|---|---|---|
| `tauri-guest` | HashRouter | mock | off | защита/демо без backend |
| `tauri-api` | HashRouter | API-first | on | LAN-демо с backend |

## Если белый экран

```bash
rm -rf dist
npm run build:tauri
```

Проверка: в `dist/index.html` должен быть `./assets/...`.
