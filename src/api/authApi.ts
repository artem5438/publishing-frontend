import axios from 'axios'
import { OpenAPI } from './generated'
import type { AuthUser } from '../types'

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await axios.get<AuthUser>(`${OpenAPI.BASE}/auth/me`, {
      withCredentials: OpenAPI.WITH_CREDENTIALS,
    })
    const user = response.data
    if (!user?.login) return null
    return user
  } catch {
    return null
  }
}
