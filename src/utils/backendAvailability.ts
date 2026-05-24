import axios from 'axios'
import { ApiError } from '../api/generated'

function isUnavailableStatus(status: number): boolean {
  return status === 0 || (status >= 502 && status <= 504)
}

/** Бэкенд недоступен (упал, сеть, шлюз) — можно показать моки. */
export function isBackendUnavailable(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    if (!error.response) return true
    return isUnavailableStatus(error.response.status)
  }
  if (error instanceof ApiError) {
    return isUnavailableStatus(error.status)
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: string }).code)
    if (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
      return true
    }
  }
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) return true
  }
  return false
}
