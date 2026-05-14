import { ApiError } from '../api/generated'
import { requestFinished, requestStarted } from './uiSlice'

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    const body = error.body as { error?: string; message?: string } | undefined
    if (body?.error) return body.error
    if (body?.message) return body.message
    return error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

// Функция для выполнения запроса с отображением индикатора загрузки
export const withUiRequest = async <T>(
  dispatch: (action: unknown) => unknown,
  action: () => Promise<T>,
): Promise<T> => {
  dispatch(requestStarted())
  try {
    return await action()
  } finally {
    dispatch(requestFinished())
  }
}
