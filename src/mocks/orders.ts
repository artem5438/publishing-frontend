import type { Order } from '../types'

export const mockCart: Order = {
  id: 17,
  status: 'draft',
  creator_login: 'artem',
  book_title: '',
  circulation: 0,
  created_at: '2026-04-07T08:34:35Z',
  filled_works_count: 0,
  works: [
    {
      work_id: 4,
      work_name: 'Твёрдый переплёт',
      price_rub: 2500,
      quantity: 1,
      comment: '',
      image_key: 'hard-cover.jpg',
    },
    {
      work_id: 3,
      work_name: 'Мягкий переплёт',
      price_rub: 800,
      quantity: 1,
      comment: '',
      image_key: 'soft-cover.jpg',
    },
  ],
}

export const mockOrders: Order[] = [
  {
    id: 15,
    status: 'completed',
    creator_login: 'artem',
    book_title: 'Моя дипломная работа',
    circulation: 100,
    total_price: 5000000,
    created_at: '2026-03-27T08:59:26Z',
    formed_at: '2026-03-27T09:09:20Z',
    completed_at: '2026-03-27T09:11:05Z',
    filled_works_count: 2,
    works: [
      {
        work_id: 1,
        work_name: 'Цифровая печать',
        price_rub: 5000,
        quantity: 1,
        comment: '',
        image_key: 'print-digital.jpg',
      },
      {
        work_id: 2,
        work_name: 'Офсетная печать',
        price_rub: 15000,
        quantity: 3,
        comment: 'срочный заказ',
        image_key: 'print-offset.jpg',
      },
    ],
  },
]