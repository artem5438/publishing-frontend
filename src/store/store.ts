import { configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
  type Storage,
} from 'redux-persist'
import createWebStorage from 'redux-persist/es/storage/createWebStorage'
import authReducer from './authSlice'
import uiReducer from './uiSlice'
import worksReducer from './worksSlice'
import orderReducer from './orderSlice'
import userOrdersReducer from './userOrdersSlice'
import moderatorReducer from './moderatorSlice'
import worksAdminReducer from './worksAdminSlice'

const createNoopStorage = (): Storage => ({
  getItem() {
    return Promise.resolve(null)
  },
  setItem(_key, value) {
    return Promise.resolve(value)
  },
  removeItem() {
    return Promise.resolve()
  },
})

const storage: Storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

const worksPersistConfig = {
  key: 'works-filters',
  storage,
  whitelist: ['filters'],
}

const persistedWorksReducer = persistReducer(worksPersistConfig, worksReducer)
// Создаем store для Redux
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    works: persistedWorksReducer,
    order: orderReducer,
    userOrders: userOrdersReducer,
    moderator: moderatorReducer,
    worksAdmin: worksAdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
