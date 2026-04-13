import type { Order } from '../types'

export const mockCart: Order = {
  id: 17,
  status: 'draft',
  creatorlogin: 'artem',
  booktitle: '',
  circulation: 0,
  createdat: '2026-04-07T08:34:35Z',
  filledworkscount: 0,
  works: [
    {
      workid: 4,
      workname: 'Твёрдый переплёт',
      pricerub: 2500,
      quantity: 1,
      comment: '',
      imageurl: 'http://localhost:9000/publishing-media/hard-cover.jpg',
    },
    {
      workid: 3,
      workname: 'Мягкий переплёт',
      pricerub: 800,
      quantity: 1,
      comment: '',
      imageurl: 'http://localhost:9000/publishing-media/soft-cover.jpg',
    },
  ],
}

export const mockOrders: Order[] = [
  {
    id: 15,
    status: 'completed',
    creatorlogin: 'artem',
    booktitle: 'Моя дипломная работа',
    circulation: 100,
    totalprice: 5000000,
    createdat: '2026-03-27T08:59:26Z',
    formedat: '2026-03-27T09:09:20Z',
    completedat: '2026-03-27T09:11:05Z',
    filledworkscount: 2,
    works: [
      {
        workid: 1,
        workname: 'Цифровая печать',
        pricerub: 5000,
        quantity: 1,
        comment: '',
        imageurl: 'http://localhost:9000/publishing-media/print-digital.jpg',
      },
      {
        workid: 2,
        workname: 'Офсетная печать',
        pricerub: 15000,
        quantity: 3,
        comment: 'срочный заказ',
        imageurl: 'http://localhost:9000/publishing-media/print-offset.jpg',
      },
    ],
  },
]