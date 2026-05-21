import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { OrdersService } from '../api/generated'
import type { Order } from '../types'
import { getApiErrorMessage, withUiRequest } from './thunkUtils'
import type { RootState } from './store'
import { logoutThunk } from './authSlice'

export interface UserOrdersFilters {
  status: string
  dateFrom: string
  dateTo: string
}

interface UserOrdersState {
  items: Order[]
  loading: boolean
  error: string
  filters: UserOrdersFilters
}

const initialFilters: UserOrdersFilters = {
  status: '',
  dateFrom: '',
  dateTo: '',
}

const initialState: UserOrdersState = {
  items: [],
  loading: false,
  error: '',
  filters: initialFilters,
}

export const fetchUserOrdersThunk = createAsyncThunk<
  Order[],
  UserOrdersFilters,
  { rejectValue: string; state: RootState }
>('userOrders/fetch', async (filters, { dispatch, rejectWithValue }) => {
  try {
    const data = await withUiRequest(dispatch, () =>
      OrdersService.getPublishingOrders(
        filters.status || undefined,
        filters.dateFrom || undefined,
        filters.dateTo || undefined,
      ),
    )
    return data as Order[]
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось загрузить список заявок'))
  }
})

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {
    setUserOrdersFilters(state, action: { payload: UserOrdersFilters }) {
      state.filters = action.payload
    },
    resetUserOrdersFilters(state) {
      state.filters = initialFilters
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrdersThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchUserOrdersThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUserOrdersThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка загрузки заявок'
      })
      .addCase(logoutThunk.fulfilled, () => initialState)
  },
})

export const { setUserOrdersFilters, resetUserOrdersFilters } = userOrdersSlice.actions
export default userOrdersSlice.reducer
