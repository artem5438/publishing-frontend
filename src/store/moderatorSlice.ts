import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { OrdersService } from '../api/generated'
import type { Order } from '../types'
import { getApiErrorMessage, withUiRequest } from './thunkUtils'
import type { RootState } from './store'
import { logoutThunk } from './authSlice'

export interface ModeratorFilters {
  status: string
  dateFrom: string
  dateTo: string
  creatorLogin: string
}

interface ModeratorState {
  items: Order[]
  loading: boolean
  moderating: boolean
  error: string
  filters: ModeratorFilters
}

const initialFilters: ModeratorFilters = {
  status: '',
  dateFrom: '',
  dateTo: '',
  creatorLogin: '',
}

const initialState: ModeratorState = {
  items: [],
  loading: false,
  moderating: false,
  error: '',
  filters: initialFilters,
}

export const fetchModeratorOrdersThunk = createAsyncThunk<
  Order[],
  Omit<ModeratorFilters, 'creatorLogin'>,
  { rejectValue: string; state: RootState }
>('moderator/fetch', async ({ status, dateFrom, dateTo }, { dispatch, rejectWithValue }) => {
  try {
    const data = await withUiRequest(dispatch, () =>
      OrdersService.getPublishingOrders(status || undefined, dateFrom || undefined, dateTo || undefined),
    )
    return data as Order[]
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось загрузить заявки модератора'))
  }
})

export const moderateOrderThunk = createAsyncThunk<
  Order,
  { orderId: number; action: 'complete' | 'reject' },
  { rejectValue: string; state: RootState }
>('moderator/moderate', async ({ orderId, action }, { dispatch, rejectWithValue }) => {
  try {
    const updated = await withUiRequest(dispatch, () =>
      OrdersService.putPublishingOrdersModerate(orderId, { action }),
    )
    return updated as Order
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось изменить статус заявки'))
  }
})

const moderatorSlice = createSlice({
  name: 'moderator',
  initialState,
  reducers: {
    setModeratorFilters(state, action: { payload: ModeratorFilters }) {
      state.filters = action.payload
    },
    resetModeratorFilters(state) {
      state.filters = initialFilters
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModeratorOrdersThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchModeratorOrdersThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchModeratorOrdersThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка загрузки заявок'
      })
      .addCase(moderateOrderThunk.pending, (state) => {
        state.moderating = true
        state.error = ''
      })
      .addCase(moderateOrderThunk.fulfilled, (state, action) => {
        state.moderating = false
        state.items = state.items.map((order) => (order.id === action.payload.id ? action.payload : order))
      })
      .addCase(moderateOrderThunk.rejected, (state, action) => {
        state.moderating = false
        state.error = action.payload ?? 'Ошибка модерации'
      })
      .addCase(logoutThunk.fulfilled, () => initialState)
  },
})

export const { setModeratorFilters, resetModeratorFilters } = moderatorSlice.actions
export default moderatorSlice.reducer
