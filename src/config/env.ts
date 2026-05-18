const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const mediaBaseRaw = import.meta.env.VITE_MEDIA_BASE_URL ?? 'http://localhost:9000/publishing-media'
const apiBaseRaw = import.meta.env.VITE_API_BASE ?? '/api'

export const MEDIA_BASE_URL = trimTrailingSlash(mediaBaseRaw)
export const API_BASE_URL = apiBaseRaw
