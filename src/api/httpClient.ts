import { OpenAPI } from './generated'
import { API_BASE_URL } from '../config/env'
// Настраиваем базовый URL для API
OpenAPI.BASE = API_BASE_URL
OpenAPI.WITH_CREDENTIALS = true
OpenAPI.CREDENTIALS = 'include'
