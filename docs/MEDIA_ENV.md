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
| GitHub Pages | `https://<owner>.github.io/<repo>/publishing-media` (CI, from `public/publishing-media/`) | N/A (mock) | No tunnel; see [GITHUB_PAGES_MINIO.md](./GITHUB_PAGES_MINIO.md) |

## Rules

1. Never put `host.docker.internal` in API responses — browsers cannot reach it.
2. Pages media URL is baked at **CI build** from repo name; add files under `public/publishing-media/` and redeploy.
3. MinIO tunnel for Pages is optional legacy only (default is static files on github.io).

## Smoke checks

```bash
# Compose
curl -sI "http://localhost/publishing-media/print-digital.jpg" | head -1

# Kind (after phase 2)
curl -sI "http://folio.local:8088/publishing-media/print-digital.jpg" | head -1
```
