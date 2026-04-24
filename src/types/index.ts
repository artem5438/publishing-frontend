export interface Work {
  id: number
  name: string
  description: string
  price_rub: number
  work_type: string
  unit: string
  image_url?: string       
  video_url?: string       
  tags?: string[]
  param_deadline?: string
  param_quantity?: string
  param_unit?: string
  param_format?: string
}

export interface OrderWork {
  work_id: number
  work_name: string
  price_rub: number
  quantity: number
  comment: string
  image_url?: string
}

export type OrderStatus = 'draft' | 'deleted' | 'formed' | 'completed' | 'rejected'

export interface Order {
  id: number
  status: OrderStatus
  creator_login: string
  book_title: string
  circulation: number
  total_price?: number
  created_at: string
  formed_at?: string
  completed_at?: string
  works?: OrderWork[]
  filled_works_count: number
  user_role?: string
}