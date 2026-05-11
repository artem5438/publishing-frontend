import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { OrderWorksService, OrdersService } from '../api/generated'
import type { Order } from '../types'
import { getApiErrorMessage, withUiRequest } from './thunkUtils'
import type { RootState } from './store'
import { logoutThunk } from './authSlice'

interface OrderState {
  draftOrder: Order | null
  selectedOrder: Order | null
  loadingCart: boolean
  loadingOrder: boolean
  mutating: boolean
  error: string
}

const initialState: OrderState = {
  draftOrder: null,
  selectedOrder: null,
  loadingCart: false,
  loadingOrder: false,
  mutating: false,
  error: '',
}

export const fetchCartThunk = createAsyncThunk<Order | null, void, { rejectValue: string; state: RootState }>(
  'order/fetchCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = (await withUiRequest(dispatch, () => OrdersService.getPublishingOrdersCart())) as Order
      const orderId = result.order_id
      if (!orderId && !result.id) return null
      return result
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось загрузить черновик'))
    }
  },
)

export const fetchOrderByIdThunk = createAsyncThunk<Order, number, { rejectValue: string; state: RootState }>(
  'order/fetchById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const result = await withUiRequest(dispatch, () => OrdersService.getPublishingOrders1(id))
      return result as Order
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось загрузить заявку'))
    }
  },
)

export const addWorkToDraftThunk = createAsyncThunk<
  Order | null,
  number,
  { rejectValue: string; state: RootState }
>('order/addWorkToDraft', async (workId, { dispatch, rejectWithValue }) => {
  try {
    await withUiRequest(dispatch, () => OrderWorksService.postPublishingOrdersCartWorks({ work_id: workId }))
    const cart = (await withUiRequest(dispatch, () => OrdersService.getPublishingOrdersCart())) as Order
    return cart
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось добавить услугу в заявку'))
  }
})

export const updateOrderMetaThunk = createAsyncThunk<
  Order,
  { orderId: number; bookTitle: string; circulation: number },
  { rejectValue: string; state: RootState }
>('order/updateMeta', async ({ orderId, bookTitle, circulation }, { dispatch, rejectWithValue }) => {
  try {
    const updated = await withUiRequest(dispatch, () =>
      OrdersService.putPublishingOrders(orderId, {
        book_title: bookTitle,
        circulation,
      }),
    )
    return updated as Order
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось обновить заявку'))
  }
})

export const submitOrderThunk = createAsyncThunk<Order, number, { rejectValue: string; state: RootState }>(
  'order/submit',
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      const submitted = await withUiRequest(dispatch, () => OrdersService.putPublishingOrdersSubmit(orderId))
      return submitted as Order
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось сформировать заявку'))
    }
  },
)

export const deleteOrderThunk = createAsyncThunk<number, number, { rejectValue: string; state: RootState }>(
  'order/delete',
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      await withUiRequest(dispatch, () => OrdersService.deletePublishingOrders(orderId))
      return orderId
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось удалить заявку'))
    }
  },
)

export const updateOrderWorkThunk = createAsyncThunk<
  void,
  { orderId: number; workId: number; quantity: number; comment: string },
  { rejectValue: string; state: RootState }
>('order/updateWork', async ({ orderId, workId, quantity, comment }, { dispatch, rejectWithValue }) => {
  try {
    await withUiRequest(dispatch, () =>
      OrderWorksService.putPublishingOrdersWorks(orderId, workId, { quantity, comment }),
    )
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось обновить позицию'))
  }
})

export const removeOrderWorkThunk = createAsyncThunk<
  void,
  { orderId: number; workId: number },
  { rejectValue: string; state: RootState }
>('order/removeWork', async ({ orderId, workId }, { dispatch, rejectWithValue }) => {
  try {
    await withUiRequest(dispatch, () => OrderWorksService.deletePublishingOrdersWorks(orderId, workId))
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось удалить услугу'))
  }
})

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState() {
      return initialState
    },
    clearOrderError(state) {
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.loadingCart = true
        state.error = ''
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.loadingCart = false
        state.draftOrder = action.payload
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loadingCart = false
        state.error = action.payload ?? 'Ошибка загрузки черновика'
      })
      .addCase(fetchOrderByIdThunk.pending, (state) => {
        state.loadingOrder = true
        state.error = ''
      })
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
        state.loadingOrder = false
        state.selectedOrder = action.payload
        if (action.payload.status === 'draft') {
          state.draftOrder = action.payload
        }
      })
      .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
        state.loadingOrder = false
        state.error = action.payload ?? 'Ошибка загрузки заявки'
      })
      .addCase(addWorkToDraftThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(addWorkToDraftThunk.fulfilled, (state, action) => {
        state.mutating = false
        state.draftOrder = action.payload
      })
      .addCase(addWorkToDraftThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка добавления услуги'
      })
      .addCase(updateOrderMetaThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(updateOrderMetaThunk.fulfilled, (state, action) => {
        state.mutating = false
        state.selectedOrder = action.payload
        if (action.payload.status === 'draft') {
          state.draftOrder = action.payload
        }
      })
      .addCase(updateOrderMetaThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка обновления заявки'
      })
      .addCase(submitOrderThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(submitOrderThunk.fulfilled, (state, action) => {
        state.mutating = false
        state.selectedOrder = action.payload
        state.draftOrder = null
      })
      .addCase(submitOrderThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка отправки заявки'
      })
      .addCase(deleteOrderThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(deleteOrderThunk.fulfilled, (state) => {
        state.mutating = false
        state.selectedOrder = null
        state.draftOrder = null
      })
      .addCase(deleteOrderThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка удаления заявки'
      })
      .addCase(updateOrderWorkThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(updateOrderWorkThunk.fulfilled, (state) => {
        state.mutating = false
      })
      .addCase(updateOrderWorkThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка обновления позиции'
      })
      .addCase(removeOrderWorkThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(removeOrderWorkThunk.fulfilled, (state) => {
        state.mutating = false
      })
      .addCase(removeOrderWorkThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка удаления позиции'
      })
      .addCase(logoutThunk.fulfilled, () => initialState)
  },
})

export const { resetOrderState, clearOrderError } = orderSlice.actions
export default orderSlice.reducer
