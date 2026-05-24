const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export type AppProfile = 'pages-guest' | 'tauri-guest' | 'local-api' | 'tauri-api'

const mediaBaseRaw = import.meta.env.VITE_MEDIA_BASE_URL ?? 'http://localhost:9000/publishing-media'
const apiBaseRaw = import.meta.env.VITE_API_BASE ?? '/api'
const legacyGuestModeRaw = import.meta.env.VITE_GUEST_MODE ?? 'false'
const profileRaw = import.meta.env.VITE_APP_PROFILE

const knownProfiles: AppProfile[] = ['pages-guest', 'tauri-guest', 'local-api', 'tauri-api']
const fallbackProfile: AppProfile =
  String(legacyGuestModeRaw).toLowerCase() === 'true' ? 'tauri-guest' : 'local-api'

export const APP_PROFILE: AppProfile =
  typeof profileRaw === 'string' && knownProfiles.includes(profileRaw as AppProfile)
    ? (profileRaw as AppProfile)
    : fallbackProfile

export const IS_GUEST_MODE = APP_PROFILE === 'pages-guest' || APP_PROFILE === 'tauri-guest'
export const IS_TAURI_PROFILE = APP_PROFILE === 'tauri-guest' || APP_PROFILE === 'tauri-api'
export const IS_DEBUG = import.meta.env.DEV || String(import.meta.env.VITE_DEBUG ?? 'false').toLowerCase() === 'true'

export const MEDIA_BASE_URL = trimTrailingSlash(mediaBaseRaw)
export const API_BASE_URL = apiBaseRaw
