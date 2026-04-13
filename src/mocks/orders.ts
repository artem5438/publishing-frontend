import type { Order } from '../types'

const MINIO_URL = 'http://localhost:9000/publishing-media'

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
      image_url: `${MINIO_URL}/hard-cover.jpg`,
    },
    {
      work_id: 3,
      work_name: 'Мягкий переплёт',
      price_rub: 800,
      quantity: 1,
      comment: '',
      image_url: `${MINIO_URL}/soft-cover.jpg`,
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
        image_url: `${MINIO_URL}/print-digital.jpg`,
      },
      {
        work_id: 2,
        work_name: 'Офсетная печать',
        price_rub: 15000,
        quantity: 3,
        comment: 'срочный заказ',
        image_url: `${MINIO_URL}/print-offset.jpg`,
      },
    ],
  },
]