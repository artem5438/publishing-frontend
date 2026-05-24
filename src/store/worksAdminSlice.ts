import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { WorksService } from '../api/generated'
import { createWorkMultipart, deleteWorkById, updateWorkMultipart } from '../api/worksApi'
import { invalidateWorksClientCache } from '../cache/worksCache'
import type { Work } from '../types'
import { normalizeWork, normalizeWorks } from '../utils/media'
import { getApiErrorMessage, withUiRequest } from './thunkUtils'
import type { RootState } from './store'
import { logoutThunk } from './authSlice'

interface WorksAdminState {
  works: Work[]
  loading: boolean
  mutating: boolean
  error: string
}

const initialState: WorksAdminState = {
  works: [],
  loading: false,
  mutating: false,
  error: '',
}

export const fetchAdminWorksThunk = createAsyncThunk<Work[], void, { rejectValue: string; state: RootState }>(
  'worksAdmin/fetch',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await withUiRequest(dispatch, () => WorksService.getWorks())
      return normalizeWorks(data as Work[])
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось загрузить услуги'))
    }
  },
)

export const createWorkThunk = createAsyncThunk<Work, FormData, { rejectValue: string; state: RootState }>(
  'worksAdmin/create',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const work = await withUiRequest(dispatch, () => createWorkMultipart(formData))
      return normalizeWork(work)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось создать услугу'))
    }
  },
)

export const updateWorkThunk = createAsyncThunk<
  Work,
  { id: number; formData: FormData },
  { rejectValue: string; state: RootState }
>('worksAdmin/update', async ({ id, formData }, { dispatch, rejectWithValue }) => {
  try {
    const work = await withUiRequest(dispatch, () => updateWorkMultipart(id, formData))
    return normalizeWork(work)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Не удалось обновить услугу'))
  }
})

export const deleteWorkThunk = createAsyncThunk<number, number, { rejectValue: string; state: RootState }>(
  'worksAdmin/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await withUiRequest(dispatch, () => deleteWorkById(id))
      return id
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось удалить услугу'))
    }
  },
)

const worksAdminSlice = createSlice({
  name: 'worksAdmin',
  initialState,
  reducers: {
    clearWorksAdminError(state) {
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminWorksThunk.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchAdminWorksThunk.fulfilled, (state, action) => {
        state.loading = false
        state.works = action.payload
      })
      .addCase(fetchAdminWorksThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ошибка загрузки услуг'
      })
      .addCase(createWorkThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(createWorkThunk.fulfilled, (state, action) => {
        state.mutating = false
        state.works = [...state.works, action.payload]
        invalidateWorksClientCache()
      })
      .addCase(createWorkThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка создания услуги'
      })
      .addCase(updateWorkThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(updateWorkThunk.fulfilled, (state, action) => {
        state.mutating = false
        state.works = state.works.map((w) => (w.id === action.payload.id ? action.payload : w))
        invalidateWorksClientCache()
      })
      .addCase(updateWorkThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка обновления услуги'
      })
      .addCase(deleteWorkThunk.pending, (state) => {
        state.mutating = true
        state.error = ''
      })
      .addCase(deleteWorkThunk.fulfilled, (state, action) => {
        state.mutating = false
        state.works = state.works.filter((w) => w.id !== action.payload)
        invalidateWorksClientCache()
      })
      .addCase(deleteWorkThunk.rejected, (state, action) => {
        state.mutating = false
        state.error = action.payload ?? 'Ошибка удаления услуги'
      })
      .addCase(logoutThunk.fulfilled, () => initialState)
  },
})

export const { clearWorksAdminError } = worksAdminSlice.actions
export default worksAdminSlice.reducer
