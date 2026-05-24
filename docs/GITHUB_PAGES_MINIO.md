# GitHub Pages + MinIO media

Photos and videos on Pages are loaded from MinIO (`VITE_MEDIA_BASE_URL`), not from `public/`.

Pages build profile: `VITE_APP_PROFILE=pages-guest`.

## 1. MinIO bucket

```bash
cd publishing-backend
docker compose up -d minio minio-init
```

This creates bucket `publishing-media`, enables public read, and sets CORS for `https://artem5438.github.io`.

## 2. HTTPS URL for MinIO (required)

GitHub Pages is served over HTTPS. Browsers block `http://` media (mixed content).

Choose one:

### A. Tunnel to MinIO (port 9000)

```bash
# example: cloudflared tunnel --url http://localhost:9000
```

Secret value:

```text
VITE_MEDIA_BASE_URL=https://<tunnel-host>/publishing-media
```

### B. Tunnel to nginx HTTPS (port 443)

```bash
cd publishing-backend
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d
# tunnel to https://localhost:443 — nginx proxies /publishing-media/ → MinIO
```

Secret value:

```text
VITE_MEDIA_BASE_URL=https://<tunnel-host>/publishing-media
```

## 3. GitHub repository secret

Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Example |
|------|---------|
| `VITE_MEDIA_BASE_URL` | `https://abc.trycloudflare.com/publishing-media` |

Set the same URL in backend `MINIO_PUBLIC_URL`.

## 4. GitHub Pages settings

- **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**
- Site URL: `https://artem5438.github.io/publishing-frontend/`

Push to `main` to deploy.

## 5. Verify

- Open Pages URL — no 404 on `/works`
- DevTools → Network — images return **200** from MinIO host
- Hero video on Home plays
- Guest UI only (no auth/cart buttons)
