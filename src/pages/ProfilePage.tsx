import { useState, useEffect } from 'react'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockOrders } from '../mocks/orders'
import type { Order } from '../types'

const USE_MOCK = false

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  formed:    { label: 'На рассмотрении', color: '#f59e0b' },
  completed: { label: 'Выполнен',        color: '#22c55e' },
  rejected:  { label: 'Отклонён',        color: '#e53935' },
  draft:     { label: 'Черновик',        color: '#999'    },
}

interface Filters {
  status: string
  dateFrom: string
  dateTo: string
}

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Поля ввода (черновик фильтров)
  const [statusInput, setStatusInput] = useState('')
  const [dateFromInput, setDateFromInput] = useState('')
  const [dateToInput, setDateToInput] = useState('')

  // Применённые фильтры — только их слушает useEffect
  const [filters, setFilters] = useState<Filters>({ status: '', dateFrom: '', dateTo: '' })

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => {
        setOrders(mockOrders)
        setLoading(false)
      }, 0)
      return
    }

    const params = new URLSearchParams()
    if (filters.status)   params.append('status', filters.status)
    if (filters.dateFrom) params.append('from', filters.dateFrom)
    if (filters.dateTo)   params.append('to', filters.dateTo)

    fetch(`/api/publishing-orders?${params.toString()}`, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('Ошибка загрузки заказов'); return r.json() })
      .then((data: Order[]) => { setOrders(data); setLoading(false) })
      .catch((err: Error) => { setError(err.message); setLoading(false) })
  }, [filters])

  const handleFilter = () => {
    setError('')
    setLoading(true)
    setFilters({ status: statusInput, dateFrom: dateFromInput, dateTo: dateToInput })
  }

  const handleReset = () => {
    setStatusInput('')
    setDateFromInput('')
    setDateToInput('')
    setError('')
    setLoading(true)
    setFilters({ status: '', dateFrom: '', dateTo: '' })
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Профиль' }]} />

      <div className="profile-page-wrapper">
        <h1 className="profile-title">Мои заказы</h1>

        <div className="profile-filter-panel">
          <div className="profile-filter-field">
            <label>Статус</label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="profile-select"
            >
              <option value="">Все</option>
              <option value="formed">На рассмотрении</option>
              <option value="completed">Выполнен</option>
              <option value="rejected">Отклонён</option>
            </select>
          </div>

          <div className="profile-filter-field">
            <label>Дата от</label>
            <input
              type="date"
              value={dateFromInput}
              onChange={(e) => setDateFromInput(e.target.value)}
              className="profile-input"
            />
          </div>

          <div className="profile-filter-field">
            <label>Дата до</label>
            <input
              type="date"
              value={dateToInput}
              onChange={(e) => setDateToInput(e.target.value)}
              className="profile-input"
            />
          </div>

          <div className="profile-filter-actions">
            <button className="btn-profile-filter" onClick={handleFilter}>Применить</button>
            <button className="btn-profile-reset" onClick={handleReset}>Сброс</button>
          </div>
        </div>

        {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}
        {error && <div className="mis-error py-4">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="order-empty">Заказов не найдено</div>
        )}

        {!loading && !error && orders.map((order) => {
          const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#999' }
          const total = order.total_price ? `${order.total_price.toLocaleString()} ₽` : '—'
          const date = order.formed_at
            ? new Date(order.formed_at).toLocaleDateString('ru-RU')
            : new Date(order.created_at).toLocaleDateString('ru-RU')

          return (
            <div key={order.id} className="profile-order-card">
              <div className="profile-order-header">
                <span className="profile-order-id">Заявка №{order.id}</span>
                <span
                  className="profile-order-status"
                  style={{ color: statusInfo.color, borderColor: statusInfo.color }}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div className="profile-order-meta">
                {order.book_title && <span>📖 {order.book_title}</span>}
                {!!order.circulation && <span>📦 Тираж: {order.circulation} экз.</span>}
                <span>📅 {date}</span>
                <span>🛠 Услуг: {order.works?.length ?? order.filled_works_count}</span>
              </div>

              <div className="profile-order-footer">
                <span className="profile-order-total">
                  {total !== '—' ? `Итого: ${total}` : 'Стоимость не рассчитана'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}