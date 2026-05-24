import { WorksService } from '../api/generated'
import { fetchWorksWithCacheMeta, type ServerCacheStatus } from '../api/worksApi'
import { APP_PROFILE, IS_GUEST_MODE } from '../config/env'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'
import type { WorksListFilters } from '../cache/worksCache'
import { normalizeWork, normalizeWorks } from '../utils/media'

export type WorksDataSource = 'api' | 'mock'

export interface WorksRepositoryListResult {
  items: Work[]
  serverCache: ServerCacheStatus | null
  source: WorksDataSource
}

const applyMockFilters = (filters: WorksListFilters): Work[] =>
  mockWorks.filter((work) => {
    const matchSearch = !filters.search || work.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchMin = !filters.minPrice || work.price_rub >= Number(filters.minPrice)
    const matchMax = !filters.maxPrice || work.price_rub <= Number(filters.maxPrice)
    const matchType = !filters.workType || work.work_type === filters.workType
    return matchSearch && matchMin && matchMax && matchType
  })

export function getMockWorks(filters: WorksListFilters): Work[] {
  return applyMockFilters(filters)
}

export async function fetchWorksByProfile(filters: WorksListFilters): Promise<WorksRepositoryListResult> {
  if (IS_GUEST_MODE) {
    return { items: applyMockFilters(filters).map(normalizeWork), serverCache: null, source: 'mock' }
  }

  const { items, serverCache } = await fetchWorksWithCacheMeta(
    filters.search || undefined,
    filters.minPrice ? Number(filters.minPrice) : undefined,
    filters.maxPrice ? Number(filters.maxPrice) : undefined,
    filters.workType || undefined,
  )

  return { items: normalizeWorks(items), serverCache, source: 'api' }
}

export async function fetchWorkByIdProfile(id: number): Promise<Work> {
  if (IS_GUEST_MODE) {
    const fromMock = mockWorks.find((work) => work.id === id)
    if (fromMock) return normalizeWork(fromMock)
    throw new Error('Услуга не найдена')
  }

  return normalizeWork((await WorksService.getWorks1(id)) as Work)
}

export const allowMockFallbackOnError = (): boolean => APP_PROFILE === 'local-api'
