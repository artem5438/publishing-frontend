import axios from 'axios'
import { OpenAPI } from './generated'
import type { Work } from '../types'

export type ServerCacheStatus = 'HIT' | 'MISS' | 'BYPASS'

export interface FetchWorksResult {
  items: Work[]
  serverCache: ServerCacheStatus | null
}

export async function fetchWorksWithCacheMeta(
  query?: string,
  minPrice?: number,
  maxPrice?: number,
  workType?: string,
): Promise<FetchWorksResult> {
  const response = await axios.get<Work[]>(`${OpenAPI.BASE}/works`, {
    params: {
      query,
      minPrice,
      maxPrice,
      workType,
    },
    withCredentials: OpenAPI.WITH_CREDENTIALS,
  })

  const header = response.headers['x-cache']
  const serverCache =
    typeof header === 'string' ? (header.toUpperCase() as ServerCacheStatus) : null

  if (serverCache) {
    console.info('[cache]', { cache_key: 'api:works:all', result: serverCache.toLowerCase() })
  }

  return { items: response.data, serverCache }
}
