import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import './api/httpClient'
import { persistor, store } from './store/store'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
