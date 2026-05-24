const fallbackBase = import.meta.env.BASE_URL || '/'
export const IMAGE_FALLBACK = `${fallbackBase}mock-media/work-cover.svg`

const isMixedContent = (url: string) =>
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  url.startsWith('http://')

export const resolveSafeImageUrl = (url?: string): string => {
  if (!url) return IMAGE_FALLBACK
  if (isMixedContent(url)) return IMAGE_FALLBACK
  return url
}

export const resolveSafeVideoUrl = (url?: string): string | undefined => {
  if (!url) return undefined
  if (isMixedContent(url)) return undefined
  return url
}
