import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchWorksWithCacheMeta } from '../api/worksApi'
import { WorksService } from '../api/generated'
import {
  getWorksFromClientCache,
  hasActiveWorksFilters,
  invalidateWorksClientCache,
  saveWorksCacheStatus,
  setWorksClientCache,
  type WorksListFilters,
} from '../cache/worksCache'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'
import { withUiRequest } from './thunkUtils'
import type { RootState } from './store'
import { logoutThunk } from './authSlice'

export type WorksFilters = WorksListFilters

export type ClientCacheStatus = 'hit' | 'miss'
export type ServerCacheStatus = 'HIT' | 'MISS' | 'BYPASS' | null

export interface WorksFetchResult {
  items: Work[]
  clientCache: ClientCacheStatus
  serverCache: ServerCacheStatus
}

interface WorksState {
  items: Work[]
  currentWork: Work | null
  loading: boolean
  detailsLoading: boolean
  error: string
  filters: WorksFilters
}

const emptyFilters: WorksFilters = {
  search: '',
  minPrice: '',
  maxPrice: '',
  workType: '',
}

const initialState: WorksState = {
  items: [],
  currentWork: null,
  loading: true,
  detailsLoading: false,
  error: '',
  filters: emptyFilters,
}

const applyMockFilters = (filters: WorksFilters): Work[] =>
  mockWorks.filter((work) => {
    const matchSearch = !filters.search || work.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchMin = !filters.minPrice || work.price_rub >= Number(filters.minPrice)
    const matchMax = !filters.maxPrice || work.price_rub <= Number(filters.maxPrice)
    const matchType = !filters.workType || work.work_type === filters.workType
    return matchSearch && matchMin && matchMax && matchType
  })

export const fetchWorksThunk = createAsyncThunk<
  WorksFetchResult,
  WorksFilters,
  { rejectValue: string; state: RootState }
>('works/fetchList', async (filters, { dispatch }) => {
  const useClientCache = !hasActiveWorksFilters(filters)

  if (useClientCache) {
    const cached = getWorksFromClientCache()
    if (cached) {
      saveWorksCacheStatus('hit', null)
      return { items: cached, clientCache: 'hit', serverCache: null }
    }
  }

  try {
    const { items, serverCache } = await withUiRequest(dispatch, () =>
      fetchWorksWithCacheMeta(
        filters.search || undefined,
        filters.minPrice ? Number(filters.minPrice) : undefined,
        filters.maxPrice ? Number(filters.maxPrice) : undefined,
        filters.workType || undefined,
      ),
    )

    const server = serverCache ?? null
    if (useClientCache) {
      setWorksClientCache(items)
      saveWorksCacheStatus('miss', server)
    } else {
      saveWorksCacheStatus('miss', server === null ? 'BYPASS' : server)
    }

    return {
      items,
      clientCache: 'miss',
      serverCache: server,
    }
  } catch {
    const mocked = applyMockFilters(filters)
    saveWorksCacheStatus('miss', useClientCache ? null : 'BYPASS')
    return { items: mocked, clientCache: 'miss', serverCache: null }
  }
})

export const fetchWorkByIdThunk = createAsyncThunk<
  Work,
  number,
  { rejectValue: string; state: RootState }
>('works/fetchById', async (id, { dispatch, rejectWithValue }) => {
  try {
    const result = await withUiRequest(dispatch, () => WorksService.getWorks1(id))
    return result as Work
  } catch {
    const fromMock = mockWorks.find((work) => work.id === id)
    if (fromMock) return fromMock
    return rejectWithValue('Услуга не найдена')
  }
})

const worksSlice = createSlice({
  name: 'works',
  initialState,
  reducers: {
    setWorksFilters(state, action: { payload: WorksFilters }) {
      if (hasActiveWorksFilters(action.payload)) {
        invalidateWorksClientCache()
      }
      state.filters = action.payload
    },
    resetWorksFilters(state) {
      state.filters = emptyFilters
    },
    clearCurrentWork(state) {
      state.currentWork = null
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorksThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchWorksThunk.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.loading = false
      })
      .addCase(fetchWorksThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка загрузки услуг'
      })
      .addCase(fetchWorkByIdThunk.pending, (state) => {
        state.detailsLoading = true
        state.error = ''
      })
      .addCase(fetchWorkByIdThunk.fulfilled, (state, action) => {
        state.currentWork = action.payload
        state.detailsLoading = false
      })
      .addCase(fetchWorkByIdThunk.rejected, (state, action) => {
        state.detailsLoading = false
        state.error = action.payload ?? 'Услуга не найдена'
      })
      .addCase(logoutThunk.fulfilled, () => {
        invalidateWorksClientCache()
      })
  },
})

export const { setWorksFilters, resetWorksFilters, clearCurrentWork } = worksSlice.actions
export default worksSlice.reducer
