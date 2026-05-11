import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { WorksService } from '../api/generated'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'
import { withUiRequest } from './thunkUtils'
import type { RootState } from './store'

export interface WorksFilters {
  search: string
  minPrice: string
  maxPrice: string
  workType: string
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
  Work[],
  WorksFilters,
  { rejectValue: string; state: RootState }
>('works/fetchList', async (filters, { dispatch }) => {
  try {
    const result = await withUiRequest(dispatch, () =>
      WorksService.getWorks(
        filters.search || undefined,
        filters.minPrice ? Number(filters.minPrice) : undefined,
        filters.maxPrice ? Number(filters.maxPrice) : undefined,
        filters.workType || undefined,
      ),
    )
    return result as Work[]
  } catch {
    const mocked = applyMockFilters(filters)
    return mocked
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
        state.items = action.payload
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
  },
})

export const { setWorksFilters, resetWorksFilters, clearCurrentWork } = worksSlice.actions
export default worksSlice.reducer
