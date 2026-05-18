import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import uiReducer from './uiSlice'
import worksReducer from './worksSlice'
import orderReducer from './orderSlice'
import userOrdersReducer from './userOrdersSlice'
import moderatorReducer from './moderatorSlice'
import worksAdminReducer from './worksAdminSlice'
// Создаем store для Redux
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    works: worksReducer,
    order: orderReducer,
    userOrders: userOrdersReducer,
    moderator: moderatorReducer,
    worksAdmin: worksAdminReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
