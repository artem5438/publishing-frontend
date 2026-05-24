import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import './api/httpClient'
import { persistor, store } from './store/store'
import { IS_DEBUG, IS_TAURI_PROFILE } from './config/env'

if (!IS_TAURI_PROFILE) {
  registerSW({ immediate: true })
}

const showFatalOverlay = (title: string, details: string) => {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; padding: 24px; line-height: 1.5;">
      <h2 style="margin: 0 0 12px; color: #b00020;">${title}</h2>
      <p style="margin: 0 0 8px;">Приложение упало при запуске.</p>
      <pre style="white-space: pre-wrap; background: #f7f7f7; border: 1px solid #ddd; border-radius: 8px; padding: 12px;">${details}</pre>
    </div>
  `
}

if (IS_DEBUG) {
  window.addEventListener('error', (event) => {
    const error = event.error as unknown
    const details = [
      `message: ${event.message ?? 'n/a'}`,
      error instanceof Error ? `name: ${error.name}` : `name: ${typeof error}`,
      error instanceof Error ? `error.message: ${error.message}` : `error: ${String(error)}`,
      error instanceof Error && error.stack ? `stack: ${error.stack}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
    showFatalOverlay('Runtime error', details)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as unknown
    const details = [
      reason instanceof Error ? `name: ${reason.name}` : `name: ${typeof reason}`,
      reason instanceof Error ? `message: ${reason.message}` : `reason: ${String(reason)}`,
      reason instanceof Error && reason.stack ? `stack: ${reason.stack}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
    showFatalOverlay('Unhandled promise rejection', details)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
