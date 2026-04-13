export interface Work {
  id: number
  name: string
  description: string
  pricerub: number
  worktype: string
  unit: string
  imageurl?: string
  videourl?: string
  tags: string[]
  paramdeadline: string
  paramquantity: string
  paramunit: string
  paramformat: string
}

export interface OrderWork {
  workid: number
  workname: string
  pricerub: number
  quantity: number
  comment: string
  imageurl?: string
}

export type OrderStatus = 'draft' | 'deleted' | 'formed' | 'completed' | 'rejected'

export interface Order {
  id: number
  status: OrderStatus
  creatorlogin: string
  booktitle: string
  circulation: number
  totalprice?: number
  createdat: string
  formedat?: string
  completedat?: string
  works?: OrderWork[]
  filledworkscount: number
}