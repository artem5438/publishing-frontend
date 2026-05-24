import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getWorksFromClientCache,
  hasActiveWorksFilters,
  invalidateWorksClientCache,
  saveWorksCacheStatus,
  setWorksClientCache,
  type WorksListFilters,
} from '../cache/worksCache'
import type { Work } from '../types'
import { isBackendUnavailable } from '../utils/backendAvailability'
import { APP_PROFILE } from '../config/env'
import {
  allowMockFallbackOnError,
  fetchWorkByIdProfile,
  fetchWorksByProfile,
  getMockWorks,
  type WorksDataSource,
} from '../data/worksRepository'
import { getApiErrorMessage, withUiRequest } from './thunkUtils'
import type { RootState } from './store'
import { logoutThunk } from './authSlice'

export type WorksFilters = WorksListFilters

export type ClientCacheStatus = 'hit' | 'miss'
export type ServerCacheStatus = 'HIT' | 'MISS' | 'BYPASS' | null

export interface WorksFetchResult {
  items: Work[]
  clientCache: ClientCacheStatus
  serverCache: ServerCacheStatus
  source: WorksDataSource
}

interface WorksState {
  items: Work[]
  currentWork: Work | null
  loading: boolean
  detailsLoading: boolean
  error: string
  filters: WorksFilters
  source: WorksDataSource
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
  source: 'api',
}

// Функция для получения данных из сервера с кэш метаданными
export const fetchWorksThunk = createAsyncThunk<
  WorksFetchResult,
  WorksFilters,
  { rejectValue: string; state: RootState }
>('works/fetchList', async (filters, { dispatch, rejectWithValue }) => {
  if (APP_PROFILE === 'pages-guest' || APP_PROFILE === 'tauri-guest') {
    return { items: getMockWorks(filters), clientCache: 'miss', serverCache: null, source: 'mock' }
  }

  const useClientCache = !hasActiveWorksFilters(filters)

  if (useClientCache) {
    const cached = getWorksFromClientCache()
    if (cached) {
      saveWorksCacheStatus('hit', null)
      return { items: cached, clientCache: 'hit', serverCache: null, source: 'api' }
    }
  }

  try {
    const { items, serverCache, source } = await withUiRequest(dispatch, () => fetchWorksByProfile(filters))

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
      source,
    }
  } catch (error) {
    if (allowMockFallbackOnError() && isBackendUnavailable(error)) {
      const mocked = getMockWorks(filters)
      saveWorksCacheStatus('miss', useClientCache ? null : 'BYPASS')
      return { items: mocked, clientCache: 'miss', serverCache: null, source: 'mock' }
    }
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось загрузить каталог услуг'))
  }
})

export const fetchWorkByIdThunk = createAsyncThunk<
  Work,
  number,
  { rejectValue: string; state: RootState }
>('works/fetchById', async (id, { dispatch, rejectWithValue }) => {
  try {
    return await withUiRequest(dispatch, () => fetchWorkByIdProfile(id))
  } catch (error) {
    if (allowMockFallbackOnError() && isBackendUnavailable(error)) {
      const fromMock = getMockWorks(emptyFilters).find((work) => work.id === id)
      if (fromMock) return fromMock
    }
    return rejectWithValue(getApiErrorMessage(error, 'Услуга не найдена'))
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
        state.items = Array.isArray(action.payload.items) ? action.payload.items : []
        state.loading = false
        state.source = action.payload.source
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
