import axios from 'axios'
import { ApiError } from '../api/generated'
import { requestFinished, requestStarted } from './uiSlice'

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { error?: string; message?: string } | undefined
    if (body?.error) return body.error
    if (body?.message) return body.message
    if (error.message) return error.message
    return fallback
  }
  if (error instanceof ApiError) {
    const body = error.body as { error?: string; message?: string } | undefined
    if (body?.error) return body.error
    if (body?.message) return body.message
    return error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

const USER_FACING_ERROR_MAP: Record<string, string> = {
  'укажите название книги (book_title)': 'Укажите название книги',
  'укажите тираж (circulation > 0)': 'Укажите тираж (минимум 1)',
  'quantity должен быть >= 1': 'Количество должно быть не меньше 1',
  'поле work_id обязательно': 'Не выбрана услуга',
}

export function formatUserFacingError(msg: string): string {
  const trimmed = msg.trim()
  const mapped = USER_FACING_ERROR_MAP[trimmed.toLowerCase()]
  if (mapped) return mapped

  const withoutFieldSuffix = trimmed.replace(/\s*\([a-z_][a-z0-9_]*\)\s*$/i, '').trim()
  if (withoutFieldSuffix !== trimmed) {
    const firstChar = withoutFieldSuffix.charAt(0)
    return firstChar ? firstChar.toUpperCase() + withoutFieldSuffix.slice(1) : withoutFieldSuffix
  }

  return trimmed
}

export const ALREADY_IN_DRAFT = 'ALREADY_IN_DRAFT'

export function isAlreadyInDraftError(error: unknown): boolean {
  if (axios.isAxiosError(error) && error.response?.status === 409) return true
  const msg = getApiErrorMessage(error, '').toLowerCase()
  return msg.includes('уже добавлена')
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
