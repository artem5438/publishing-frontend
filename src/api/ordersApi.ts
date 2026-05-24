import axios from 'axios'
import { OpenAPI } from './generated'
import type { Order } from '../types'

export async function copyRejectedOrder(orderId: number): Promise<Order> {
  const response = await axios.post<Order>(
    `${OpenAPI.BASE}/publishing-orders/${orderId}/copy`,
    {},
    { withCredentials: OpenAPI.WITH_CREDENTIALS },
  )
  return response.data
}
