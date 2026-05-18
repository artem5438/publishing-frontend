import axios from 'axios'
import { OpenAPI } from './generated'
import type { Work } from '../types'

export type ServerCacheStatus = 'HIT' | 'MISS' | 'BYPASS'

export interface FetchWorksResult {
  items: Work[]
  serverCache: ServerCacheStatus | null
}
// Функция для получения данных из сервера с кэш метаданными
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

const multipartConfig = {
  withCredentials: OpenAPI.WITH_CREDENTIALS,
}

export async function createWorkMultipart(formData: FormData): Promise<Work> {
  const response = await axios.post<Work>(`${OpenAPI.BASE}/works`, formData, multipartConfig)
  return response.data
}

export async function updateWorkMultipart(id: number, formData: FormData): Promise<Work> {
  const response = await axios.put<Work>(`${OpenAPI.BASE}/works/${id}`, formData, multipartConfig)
  return response.data
}

export async function deleteWorkById(id: number): Promise<void> {
  await axios.delete(`${OpenAPI.BASE}/works/${id}`, {
    withCredentials: OpenAPI.WITH_CREDENTIALS,
  })
}
