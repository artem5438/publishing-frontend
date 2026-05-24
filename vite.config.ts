import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'

const basePath = process.env.VITE_BASE_PATH ?? '/'
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

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({ // описываем PWA
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'pwa-192.svg', 'pwa-512.svg'],
      workbox: { // настраиваем workbox
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
      },
      manifest: { // описываем manifest
        name: 'Folio Publishing',
        short_name: 'Folio',
        description: 'Каталог издательских услуг',
        theme_color: '#1C1C1C',
        background_color: '#F5F5F5',
        display: 'standalone',
        start_url: basePath,
        scope: basePath,
        icons: [ // описываем icons
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
    }),
  ],
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  build: {
    target: 'esnext',
  },
  // Проксируем запросы к API на backend
  server: {
    host: true,
    https: httpsOptions,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})