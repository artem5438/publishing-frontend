import type { Work } from '../types'

const STORAGE_KEY = 'works:list:default'
export const STATUS_STORAGE_KEY = 'works:cache:status'

export interface WorksListFilters {
  search: string
  minPrice: string
  maxPrice: string
  workType: string
}

export type ClientCacheResult = 'hit' | 'miss'
export type ServerCacheResult = 'HIT' | 'MISS' | 'BYPASS' | null

const TTL_MS = 3 * 60 * 1000

interface CachedWorksPayload {
  data: Work[]
  savedAt: number
}

export interface CacheStatusPayload {
  client: ClientCacheResult
  server: ServerCacheResult
  at: number
}

export const hasActiveWorksFilters = (filters: WorksListFilters): boolean =>
  Boolean(filters.search || filters.minPrice || filters.maxPrice || filters.workType)

export function saveWorksCacheStatus(client: ClientCacheResult, server: ServerCacheResult): void {
  try {
    const payload: CacheStatusPayload = { client, server, at: Date.now() }
    sessionStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(payload))
    console.info('[cache]', {
      cache_key: STATUS_STORAGE_KEY,
      client,
      server: server ?? 'none',
      result: client === 'hit' ? 'hit' : server === 'HIT' ? 'hit' : 'miss',
    })
  } catch (error) {
    console.error('[cache]', { cache_key: STATUS_STORAGE_KEY, result: 'error', error })
  }
}

export function getWorksFromClientCache(): Work[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      console.info('[cache]', { cache_key: STORAGE_KEY, result: 'miss', reason: 'empty' })
      return null
    }

    const parsed = JSON.parse(raw) as CachedWorksPayload
    if (Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      console.info('[cache]', { cache_key: STORAGE_KEY, result: 'miss', reason: 'expired' })
      return null
    }

    console.info('[cache]', { cache_key: STORAGE_KEY, result: 'hit' })
    return parsed.data
  } catch (error) {
    console.error('[cache]', { cache_key: STORAGE_KEY, result: 'error', error })
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setWorksClientCache(data: Work[]): void {
  try {
    const payload: CachedWorksPayload = { data, savedAt: Date.now() }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    console.info('[cache]', { cache_key: STORAGE_KEY, result: 'set' })
  } catch (error) {
    console.error('[cache]', { cache_key: STORAGE_KEY, result: 'error', error })
  }
}

export function invalidateWorksClientCache(): void {
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STATUS_STORAGE_KEY)
  console.info('[cache]', { cache_key: STORAGE_KEY, result: 'invalidate' })
}
