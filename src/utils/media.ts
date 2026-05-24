import { MEDIA_BASE_URL } from '../config/env'
import type { Order, OrderWork, Work } from '../types'

const fallbackBase = import.meta.env.BASE_URL || '/'
export const IMAGE_FALLBACK = `${fallbackBase}mock-media/work-cover.svg`

const MEDIA_PREFIX = '/publishing-media/'

const isMixedContent = (url: string) =>
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  url.startsWith('http://')

const joinMediaBase = (objectKey: string): string => {
  const base = MEDIA_BASE_URL.replace(/\/+$/, '')
  const key = objectKey.replace(/^\/+/, '').split('?')[0]?.split('#')[0] ?? ''
  if (!key) return base
  return `${base}/${key}`
}

/** Extract MinIO object key from any publishing-media URL variant. */
export const extractPublishingMediaKey = (url: string): string | null => {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith(MEDIA_PREFIX)) {
    const key = trimmed.slice(MEDIA_PREFIX.length).split('?')[0]?.split('#')[0]
    return key || null
  }

  try {
    const parsed =
      trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')
        ? new URL(trimmed)
        : new URL(trimmed, 'http://local.invalid')
    const idx = parsed.pathname.indexOf(MEDIA_PREFIX)
    if (idx >= 0) {
      const key = parsed.pathname.slice(idx + MEDIA_PREFIX.length)
      return key || null
    }
  } catch {
    return null
  }

  return null
}

/**
 * Rewrite API/Redis media URLs to VITE_MEDIA_BASE_URL for the current profile
 * (Docker nginx, Tauri LAN IP, GitHub Pages HTTPS tunnel, etc.).
 */
export const normalizeMediaUrl = (url?: string): string | undefined => {
  if (!url) return undefined

  const key = extractPublishingMediaKey(url)
  if (key) return joinMediaBase(key)

  return url
}

export const resolveSafeImageUrl = (url?: string): string => {
  const normalized = normalizeMediaUrl(url)
  if (!normalized) return IMAGE_FALLBACK
  if (isMixedContent(normalized)) return IMAGE_FALLBACK
  return normalized
}

export const resolveSafeVideoUrl = (url?: string): string | undefined => {
  const normalized = normalizeMediaUrl(url)
  if (!normalized) return undefined
  if (isMixedContent(normalized)) return undefined
  return normalized
}

export const withNormalizedMedia = <T extends { image_url?: string; video_url?: string }>(item: T): T => ({
  ...item,
  image_url: item.image_url ? normalizeMediaUrl(item.image_url) : item.image_url,
  video_url: item.video_url ? normalizeMediaUrl(item.video_url) : item.video_url,
})

export const normalizeWork = (work: Work): Work => withNormalizedMedia(work)

export const normalizeOrderWork = (item: OrderWork): OrderWork => withNormalizedMedia(item)

export const normalizeOrder = (order: Order): Order => ({
  ...order,
  works: order.works?.map(normalizeOrderWork),
})

export const normalizeWorks = (items: Work[]): Work[] => items.map(normalizeWork)
