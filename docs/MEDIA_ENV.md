# Media URL matrix (Folio)

API and mocks return **relative** paths: `/publishing-media/<object-key>`.  
The React app rewrites them at runtime with `VITE_MEDIA_BASE_URL` ([`src/utils/media.ts`](../src/utils/media.ts)).

## Environment → `VITE_MEDIA_BASE_URL` / `MINIO_PUBLIC_URL`

| Environment | Frontend `VITE_MEDIA_BASE_URL` | Backend `MINIO_PUBLIC_URL` | Notes |
|-------------|-------------------------------|----------------------------|--------|
| Docker Compose (`localhost:80`) | `http://localhost/publishing-media` | `/publishing-media` (API JSON) | nginx proxies `/publishing-media/` → MinIO |
| Vite dev `local-api` | `http://localhost:9000/publishing-media` or `/publishing-media` with proxy | `/publishing-media` | Use Vite proxy or direct :9000 |
| Kind Ingress | `http://folio.local:8088/publishing-media` | `http://folio.local:8088/publishing-media` in `etc/app.env.k8s` | Same host for API + media |
| Tauri guest (LAN) | `http://<LAN-IP>:9000/publishing-media` | N/A (mock catalog) | MinIO on Mac, port 9000 |
| Tauri guest + Kind | `http://<LAN-IP>:8088/publishing-media` | `/publishing-media` | Ingress on 8088 |
| GitHub Pages | GitHub secret `https://<stable-host>/publishing-media` | N/A (mock) | HTTPS required; see [GITHUB_PAGES_MINIO.md](./GITHUB_PAGES_MINIO.md) |

## Rules

1. Never put `host.docker.internal` in API responses — browsers cannot reach it.
2. Pages secret is baked at **CI build**; changing the secret requires re-running the deploy workflow.
3. Prefer a **named Cloudflare tunnel** for Pages so the secret stays valid across reboots.

## Smoke checks

```bash
# Compose
curl -sI "http://localhost/publishing-media/print-digital.jpg" | head -1

# Kind (after phase 2)
curl -sI "http://folio.local:8088/publishing-media/print-digital.jpg" | head -1
```
