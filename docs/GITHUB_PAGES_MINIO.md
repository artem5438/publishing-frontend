# GitHub Pages + MinIO media

Photos and videos on Pages load from MinIO (`VITE_MEDIA_BASE_URL`), not from `public/`.

Profile: `VITE_APP_PROFILE=pages-guest` (mock catalog in [`src/mocks/works.ts`](../src/mocks/works.ts)).

Mock catalog uses relative paths `/publishing-media/<file>`; the UI rewrites them to `VITE_MEDIA_BASE_URL` at runtime. The secret is still required at **CI build** (Vite inlines `MEDIA_BASE_URL`).

See also [MEDIA_ENV.md](./MEDIA_ENV.md).

## Stable tunnel (recommended)

Use a **named Cloudflare Tunnel** so the GitHub secret does not change after every reboot:

1. `cp cloudflared/config.example.yml cloudflared/config.yml` — set `tunnel`, `credentials-file`, and `hostname`
2. One-time: `cloudflared tunnel create folio-minio` and DNS route (see [Cloudflare docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/))
3. `./scripts/start-pages-named-tunnel.sh` — prints fixed `https://<hostname>/publishing-media`
4. Set GitHub secret **once**, run **Deploy Frontend To GitHub Pages** once

## Quick checklist (before demo)

1. On Mac: `docker compose up -d minio minio-init` in `publishing-backend` (and `scripts/seed-mock-media.sh` if images 404)
2. Tunnel: `./scripts/start-pages-named-tunnel.sh` **or** `./scripts/start-pages-tunnel.sh` (quick — URL changes each run)
3. Copy `VITE_MEDIA_BASE_URL` into GitHub → **Settings → Secrets → Actions**
4. GitHub → **Actions** → **Deploy Frontend To GitHub Pages** → **Run workflow**
5. Open https://artem5438.github.io/publishing-frontend/works → DevTools → Network → images **200**

**Quick tunnel only:** URL changes every restart → update secret + re-run workflow (steps 2–4).

## 1. MinIO bucket

```bash
cd publishing-backend
docker compose up -d minio minio-init
```

Bucket `publishing-media` is public read. CORS allows `https://artem5438.github.io`.

## 2. HTTPS tunnel (required)

GitHub Pages is HTTPS. Browsers block `http://` media (mixed content).

```bash
cd publishing-frontend
./scripts/start-pages-tunnel.sh
```

Or manually:

```bash
cloudflared tunnel --url http://localhost:9000
```

Use the printed host:

```text
VITE_MEDIA_BASE_URL=https://xxxx.trycloudflare.com/publishing-media
```

Test in browser (tunnel running):

```text
https://xxxx.trycloudflare.com/publishing-media/print-digital.jpg
```

Expect JPEG, not 404.

## 3. GitHub repository secret

Repository → **Settings** → **Secrets and variables** → **Actions** → `VITE_MEDIA_BASE_URL`

| Rule | Example |
|------|---------|
| HTTPS only | `https://abc.trycloudflare.com/publishing-media` |
| Ends with `/publishing-media` | not `.../publishing-media/` extra slash issues — no trailing path after bucket name except as shown |
| No `localhost`, no `http://` | |

CI fails the build if the secret is missing or invalid (see [deploy-pages.yml](../.github/workflows/deploy-pages.yml)).

## 4. Deploy

- **Settings → Pages → Source:** GitHub Actions
- Push to `main` or **Run workflow** on **Deploy Frontend To GitHub Pages**

## 5. Verify live site

- https://artem5438.github.io/publishing-frontend/works
- Network: requests to your **current** tunnel host → **200**
- `blocked:mixed-content` → secret uses `http://`
- Placeholder “Folio Publishing Service” → secret empty at build or dead tunnel URL in old bundle

Hard refresh: **Cmd+Shift+R**.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Old tunnel in bundle | Update secret + re-run workflow |
| 404 on images | Start `cloudflared`, match secret URL |
| CI fails on secret | Set `VITE_MEDIA_BASE_URL` to valid HTTPS URL |
| Works on Mac, not Pages | Pages cannot use `localhost:9000` — tunnel required |
