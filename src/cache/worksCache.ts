import type { Work } from '../types'
// Константы для работы с клиентским кэшем
const STORAGE_KEY = 'works:list:default'
export const STATUS_STORAGE_KEY = 'works:cache:status'

export interface WorksListFilters {
  search: string
  minPrice: string
  maxPrice: string
  workType: string
}

// Типы для результатов кэша
export type ClientCacheResult = 'hit' | 'miss'
export type ServerCacheResult = 'HIT' | 'MISS' | 'BYPASS' | null

// TTL для клиентского кэша
const TTL_MS = 3 * 60 * 1000

// Тип для данных в клиентском кэше
interface CachedWorksPayload {
  data: Work[]
  savedAt: number
}

// Тип для статуса кэша
export interface CacheStatusPayload {
  client: ClientCacheResult
  server: ServerCacheResult
  at: number
}

// Функция для проверки активных фильтров
export const hasActiveWorksFilters = (filters: WorksListFilters): boolean =>
  Boolean(filters.search || filters.minPrice || filters.maxPrice || filters.workType)

// Функция для сохранения статуса кэша
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

// Функция для получения данных из клиентского кэша
export function getWorksFromClientCache(): Work[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      console.info('[cache]', { cache_key: STORAGE_KEY, result: 'miss', reason: 'empty' })
      return null
    }

    const parsed = JSON.parse(raw) as CachedWorksPayload
    if (!Array.isArray(parsed.data)) {
      sessionStorage.removeItem(STORAGE_KEY)
      console.info('[cache]', { cache_key: STORAGE_KEY, result: 'miss', reason: 'invalid-payload' })
      return null
    }
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

// Функция для сохранения данных в клиентском кэше
export function setWorksClientCache(data: Work[]): void {
  try {
    const payload: CachedWorksPayload = { data, savedAt: Date.now() }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    console.info('[cache]', { cache_key: STORAGE_KEY, result: 'set' })
  } catch (error) {
    console.error('[cache]', { cache_key: STORAGE_KEY, result: 'error', error })
  }
}

// Функция для удаления данных из клиентского кэша
export function invalidateWorksClientCache(): void {
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STATUS_STORAGE_KEY)
  console.info('[cache]', { cache_key: STORAGE_KEY, result: 'invalidate' })
}
