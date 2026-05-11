import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  activeRequests: number
}

const initialState: UiState = {
  activeRequests: 0,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    requestStarted(state) {
      state.activeRequests += 1
    },
    requestFinished(state) {
      state.activeRequests = Math.max(0, state.activeRequests - 1)
    },
    resetUiState() {
      return initialState
    },
  },
})

export const { requestStarted, requestFinished, resetUiState } = uiSlice.actions
export default uiSlice.reducer
