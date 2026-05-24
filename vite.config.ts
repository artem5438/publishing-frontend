import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'

const isTauriBuild = process.env.VITE_TAURI_BUILD === 'true' || Boolean(process.env.TAURI_ENV_PLATFORM)
const appProfile = process.env.VITE_APP_PROFILE ?? (isTauriBuild ? 'tauri-guest' : 'local-api')
const isGuestProfile = appProfile === 'pages-guest' || appProfile === 'tauri-guest'
const isTauriProfile = appProfile === 'tauri-guest' || appProfile === 'tauri-api'
const isDebug = process.env.VITE_DEBUG === 'true'
const basePath = isTauriProfile ? './' : (process.env.VITE_BASE_PATH ?? '/')
const enableHttps = process.env.VITE_DEV_HTTPS === 'true'
const httpsKeyPath = process.env.VITE_HTTPS_KEY_PATH
const httpsCertPath = process.env.VITE_HTTPS_CERT_PATH

const httpsOptions =
  enableHttps && httpsKeyPath && httpsCertPath
    ? {
        key: fs.readFileSync(httpsKeyPath),
        cert: fs.readFileSync(httpsCertPath),
      }
    : undefined

const pwaPlugin = VitePWA({
  disable: isTauriProfile,
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'icons.svg', 'pwa-192.svg', 'pwa-512.svg'],
  workbox: {
    maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
  },
  manifest: {
    name: 'Folio Publishing',
    short_name: 'Folio',
    description: 'Каталог издательских услуг',
    theme_color: '#1C1C1C',
    background_color: '#F5F5F5',
    display: 'standalone',
    start_url: basePath,
    scope: basePath,
    icons: [
      {
        src: 'pwa-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: 'pwa-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  },
})

export default defineConfig({
  base: basePath,
  plugins: [react(), pwaPlugin],
  define: {
    __APP_PROFILE__: JSON.stringify(appProfile),
    __APP_IS_GUEST__: JSON.stringify(isGuestProfile),
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  build: {
    target: 'esnext',
    sourcemap: isDebug ? 'inline' : false,
  },
  server: {
    host: true,
    https: httpsOptions,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
