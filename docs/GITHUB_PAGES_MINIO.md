# GitHub Pages + media

Photos and videos on Pages load from **`public/publishing-media/`** (same origin as the site). No MinIO tunnel or GitHub secret required.

Profile: `VITE_APP_PROFILE=pages-guest` (mock catalog in [`src/mocks/works.ts`](../src/mocks/works.ts)).

Mock paths stay `/publishing-media/<file>`; CI sets `VITE_MEDIA_BASE_URL` to:

```text
https://<owner>.github.io/<repo>/publishing-media
```

See also [MEDIA_ENV.md](./MEDIA_ENV.md).

## Add or update media

1. Put JPEG/MP4 files in [`public/publishing-media/`](../public/publishing-media/) (names must match [`src/mocks/works.ts`](../src/mocks/works.ts) and [`HomePage.tsx`](../src/pages/HomePage.tsx)).
2. Push to `main` or **Actions → Deploy Frontend To GitHub Pages → Run workflow**.
3. Open `https://<owner>.github.io/<repo>/works` → DevTools → Network → images **200** from `github.io`.

Local preview (same as Pages):

```bash
npm run dev:guest
```

## Verify after deploy

- `https://artem5438.github.io/publishing-frontend/publishing-media/print-digital.jpg` — JPEG in browser
- Hard refresh: **Cmd+Shift+R**

## Optional: MinIO tunnel (legacy)

If you need live MinIO instead of static files, use `./scripts/start-pages-named-tunnel.sh` and set secret `VITE_MEDIA_BASE_URL` — you must also change [deploy-pages.yml](../.github/workflows/deploy-pages.yml) to pass the secret again. The default workflow uses static `public/publishing-media/` only.
