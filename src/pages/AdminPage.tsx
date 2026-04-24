import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, Button } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import type { Order, OrderStatus } from '../types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  formed:    { label: 'На рассмотрении', color: '#f59e0b' },
  completed: { label: 'Выполнен',        color: '#22c55e' },
  rejected:  { label: 'Отклонён',        color: '#e53935' },
  draft:     { label: 'Черновик',        color: '#999'    },
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [moderatingId, setModeratingId] = useState<number | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/publishing-orders', { credentials: 'include' })
      .then((r) => {
        if (r.status === 403) {
          navigate('/')
          return null
        }
        if (!r.ok) throw new Error('Ошибка загрузки заказов')
        return r.json()
      })
      .then((data: Order[] | null) => {
        if (data === null) return
        setOrders(data)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    fetch('/api/publishing-orders', { credentials: 'include' })
      .then((r) => {
        if (r.status === 403) {
          navigate('/')
          return null
        }
        if (!r.ok) return null
        return r.json()
      })
      .then((data: Order[] | null) => {
        if (data) setAllOrders(data)
      })
      .catch(() => {})
  }, [navigate])

  const reloadOrderLists = () =>
    fetch('/api/publishing-orders', { credentials: 'include' })
      .then((r) => {
        if (r.status === 403) {
          navigate('/')
          return null
        }
        if (!r.ok) throw new Error('Ошибка обновления списка')
        return r.json()
      })
      .then((data: Order[] | null) => {
        if (data) {
          setOrders(data)
          setAllOrders(data)
        }
      })

  const formedOrders = orders.filter((o) => o.status === 'formed')

  const handleModerate = (orderId: number, action: 'complete' | 'reject') => {
    setModeratingId(orderId)
    setError('')
    fetch(`/api/publishing-orders/${orderId}/moderate`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Не удалось выполнить действие')
        return r.json().catch(() => null) as Promise<Order | null>
      })
      .then((updated) => {
        const nextStatus: OrderStatus = action === 'complete' ? 'completed' : 'rejected'
        const patch = (o: Order): Order => {
          if (o.id !== orderId) return o
          if (updated && typeof updated === 'object' && 'id' in updated) return updated as Order
          return { ...o, status: nextStatus }
        }
        setOrders((prev) => prev.map(patch))
        setAllOrders((prev) => prev.map(patch))
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setModeratingId(null))
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Панель модератора' }]} />

      <div className="profile-page-wrapper">
        <h1 className="profile-title">Панель модератора</h1>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && error && <div className="mis-error py-4">{error}</div>}

        {!loading && !error && formedOrders.length === 0 && (
          <div className="order-empty">Нет заявок на рассмотрении</div>
        )}

        {!loading &&
          !error &&
          formedOrders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#999' }
            const total =
              order.total_price != null ? `${order.total_price.toLocaleString('ru-RU')} ₽` : '—'
            const formedDate = order.formed_at
              ? new Date(order.formed_at).toLocaleString('ru-RU')
              : '—'

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
                  <span>👤 {order.creator_login}</span>
                  <span>📖 {order.book_title || '—'}</span>
                  <span>💰 {total}</span>
                  <span>📅 Подана: {formedDate}</span>
                </div>

                <div className="profile-order-footer d-flex gap-2 flex-wrap align-items-center">
                  <Button
                    variant="success"
                    size="sm"
                    disabled={moderatingId === order.id}
                    onClick={() => handleModerate(order.id, 'complete')}
                  >
                    ✅ Принять
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={moderatingId === order.id}
                    onClick={() => handleModerate(order.id, 'reject')}
                  >
                    ❌ Отклонить
                  </Button>
                </div>
              </div>
            )
          })}

        {!loading && !error && (
          <div style={{ marginTop: 40 }} className="profile-order-card">
            <h3 className="profile-title" style={{ fontSize: '1.25rem', marginBottom: 16 }}>
              Все заказы в системе (для тестирования)
            </h3>

            <table className="params-table-custom">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Автор</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order) => {
                  const statusInfo =
                    STATUS_LABELS[order.status] ?? { label: order.status, color: '#999' }
                  const dateRaw =
                    order.status === 'draft'
                      ? order.created_at
                      : order.formed_at ?? order.created_at
                  const dateStr = dateRaw
                    ? new Date(dateRaw).toLocaleString('ru-RU')
                    : '—'

                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.creator_login}</td>
                      <td>
                        <span
                          className="profile-order-status"
                          style={{
                            color: statusInfo.color,
                            borderColor: statusInfo.color,
                            display: 'inline-block',
                            margin: 0,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>{dateStr}</td>
                      <td>
                        {order.status === 'draft' ? (
                          <button
                            type="button"
                            className="btn-add-custom"
                            style={{ marginBottom: 0, padding: '8px 12px', fontSize: 13 }}
                            disabled={submittingId === order.id}
                            onClick={() => {
                              setSubmittingId(order.id)
                              fetch(`/api/publishing-orders/${order.id}/submit`, {
                                method: 'PUT',
                                credentials: 'include',
                              })
                                .then((r) => {
                                  if (!r.ok) throw new Error('Не удалось отправить заявку')
                                })
                                .then(() => reloadOrderLists())
                                .catch((err: Error) => setError(err.message))
                                .finally(() => setSubmittingId(null))
                            }}
                          >
                            Отправить на рассмотрение
                          </button>
                        ) : (
                          <span style={{ color: '#999' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {allOrders.length === 0 && (
              <div className="order-empty" style={{ marginTop: 8 }}>
                Нет заказов в выборке
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
