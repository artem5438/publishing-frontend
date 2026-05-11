import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AuthService } from '../api/generated'
import type { AuthUser } from '../types'
import { getApiErrorMessage, withUiRequest } from './thunkUtils'
import type { RootState } from './store'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string
}

interface AuthResponse {
  user?: AuthUser
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: '',
}

export const loginThunk = createAsyncThunk<
  AuthUser,
  { login: string; password: string },
  { rejectValue: string; state: RootState }
>('auth/login', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const data = await withUiRequest(dispatch, () => AuthService.postAuthLogin(payload))
    const user = (data as AuthResponse).user
    if (!user?.login) {
      return rejectWithValue('Сервер не вернул данные пользователя')
    }
    return user
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Ошибка авторизации'))
  }
})

export const registerThunk = createAsyncThunk<
  void,
  { login: string; password: string; name: string; role?: string },
  { rejectValue: string; state: RootState }
>('auth/register', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await withUiRequest(dispatch, () => AuthService.postAuthRegister(payload))
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Ошибка регистрации'))
  }
})

export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string; state: RootState }>(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await withUiRequest(dispatch, () => AuthService.postAuthLogout())
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка выхода'))
    }
  },
)

export const updateProfileThunk = createAsyncThunk<
  AuthUser,
  { name?: string; password?: string },
  { rejectValue: string; state: RootState }
>('auth/updateProfile', async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const data = await withUiRequest(dispatch, () => AuthService.putAuthProfile(payload))
    const currentUser = getState().auth.user
    const nextUser: AuthUser = {
      id: (data as AuthUser).id ?? currentUser?.id,
      login: (data as AuthUser).login ?? currentUser?.login ?? '',
      role: (data as AuthUser).role ?? currentUser?.role ?? 'creator',
      name: (data as AuthUser).name ?? currentUser?.name,
    }
    return nextUser
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось обновить профиль'))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = ''
    },
    resetAuthState() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка авторизации'
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка регистрации'
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка выхода'
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка обновления профиля'
      })
  },
})

export const { clearAuthError, resetAuthState } = authSlice.actions
export default authSlice.reducer
