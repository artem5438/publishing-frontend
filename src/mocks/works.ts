import type { Work } from '../types'

/** Relative paths; runtime rewrite via normalizeMediaUrl + VITE_MEDIA_BASE_URL */
const MEDIA_PREFIX = '/publishing-media'

const resolveImageUrl = (fileName?: string): string | undefined => {
  if (!fileName) return undefined
  return `${MEDIA_PREFIX}/${fileName}`
}

const resolveVideoUrl = (fileName?: string): string | undefined => {
  if (!fileName) return undefined
  return `${MEDIA_PREFIX}/${fileName}`
}

export const mockWorks: Work[] = [
  {
    id: 1, name: 'Цифровая печать',
    description: 'Оперативная печать тиражом от 1 до 500 экземпляров на профессиональном оборудовании с разрешением 1200 dpi.',
    price_rub: 5000, work_type: 'Печать', unit: 'экз.',
    image_url: resolveImageUrl('print-digital.jpg'),
    video_url: resolveVideoUrl('print-process.mp4'),
    tags: ['Быстрый срок', 'Малый тираж', 'Высокое разрешение'],
    param_deadline: 'от 2 дней', param_quantity: '1–500 экз.', param_unit: 'за экземпляр', param_format: 'A4, A5, A6',
  },
  {
    id: 2, name: 'Офсетная печать',
    description: 'Высококачественная печать больших тиражей от 1000 экземпляров.',
    price_rub: 15000, work_type: 'Печать', unit: 'экз.',
    image_url: resolveImageUrl('print-offset.jpg'),
    video_url: resolveVideoUrl('print-process.mp4'),
    tags: ['Крупный тираж', 'Низкая цена за экз.', 'Стабильный цвет'],
    param_deadline: 'от 10 дней', param_quantity: 'от 1000 экз.', param_unit: 'за тираж', param_format: 'A4, A5, 70×100',
  },
  {
    id: 3, name: 'Мягкий переплёт',
    description: 'Скрепление блока книги на термоклей или скобу с мягкой обложкой.',
    price_rub: 800, work_type: 'Переплёт', unit: 'экз.',
    image_url: resolveImageUrl('soft-cover.jpg'),
    video_url:  undefined,
    tags: ['Экономично', 'Лёгкий вес', 'Быстро'],
    param_deadline: 'от 1 дня', param_quantity: 'от 10 экз.', param_unit: 'за экземпляр', param_format: 'A4, A5, A6',
  },
  {
    id: 4, name: 'Твёрдый переплёт',
    description: 'Переплёт в твёрдую обложку с тиснением фольгой или УФ-лаком.',
    price_rub: 2500, work_type: 'Переплёт', unit: 'экз.',
    image_url: resolveImageUrl('hard-cover.jpg'),
    video_url:  undefined,
    tags: ['Долговечность', 'Премиум вид', 'Тиснение'],
    param_deadline: 'от 5 дней', param_quantity: 'от 50 экз.', param_unit: 'за экземпляр', param_format: 'A4, A5, 60×84',
  },
  {
    id: 5, name: 'Вёрстка',
    description: 'Профессиональная вёрстка текста и иллюстраций в Adobe InDesign.',
    price_rub: 3000, work_type: 'Допечать', unit: 'стр.',
    image_url: resolveImageUrl('layout.jpg'),
    video_url: resolveVideoUrl('layout-demo.mp4'),
    tags: ['InDesign', 'PDF для печати', 'По ГОСТ'],
    param_deadline: 'от 3 дней', param_quantity: 'любой объём', param_unit: 'за полосу', param_format: 'любой',
  },
  {
    id: 6, name: 'Корректура',
    description: 'Вычитка текста на орфографию, пунктуацию и стилистику.',
    price_rub: 1500, work_type: 'Допечать', unit: 'стр.',
    image_url: resolveImageUrl('proofreading.jpg'),
    video_url:  undefined,
    tags: ['Орфография', 'Пунктуация', 'Стилистика'],
    param_deadline: 'от 2 дней', param_quantity: 'любой объём', param_unit: 'за 1000 знаков', param_format: 'Word / PDF',
  },
  {
    id: 7, name: 'Дизайн обложки',
    description: 'Разработка уникального дизайна обложки с учётом жанра.',
    price_rub: 4000, work_type: 'Дизайн', unit: 'шт.',
    image_url: resolveImageUrl('cover-design.jpg'),
    video_url: resolveVideoUrl('layout-demo.mp4'),
    tags: ['3 концепции', 'CMYK', 'Уникальный стиль'],
    param_deadline: 'от 5 дней', param_quantity: '1 обложка', param_unit: 'за проект', param_format: 'любой формат',
  },
  {
    id: 8, name: 'Присвоение ISBN',
    description: 'Оформление и присвоение международного стандартного книжного номера.',
    price_rub: 1000, work_type: 'Оформление', unit: 'шт.',
    image_url: resolveImageUrl('isbn.jpg'),
    video_url:  undefined,
    tags: ['Официально', 'Для продажи', 'Библиотеки'],
    param_deadline: 'до 14 дней', param_quantity: '1 издание', param_unit: 'за издание', param_format: '—',
  },
  {
    id: 9, name: 'Ризография',
    description:
      'Ризографическая печать малых и средних тиражей с характерной фактурой и насыщенными цветами. Подходит для зинов, плакатов и авторских изданий.',
    price_rub: 3500,
    work_type: 'Печать',
    unit: 'лист',
    image_url: resolveImageUrl('file-1774601879825304000.png'),
    video_url: undefined,
    tags: ['Малый тираж', 'Яркие цвета', 'Авторские издания'],
    param_deadline: 'от 3 дней',
    param_quantity: 'от 50 листов',
    param_unit: 'за лист',
    param_format: 'A3, A4',
  },
]
