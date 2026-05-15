import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spinner, Button } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { fetchModeratorOrdersThunk, moderateOrderThunk, setModeratorFilters } from '../store/moderatorSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  formed:    { label: 'На рассмотрении', color: '#f59e0b' },
  completed: { label: 'Выполнен',        color: '#22c55e' },
  rejected:  { label: 'Отклонён',        color: '#e53935' },
  draft:     { label: 'Черновик',        color: '#999'    },
}

export default function AdminPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { items: orders, loading, moderating, error, filters } = useAppSelector((state) => state.moderator)

  const [statusInput, setStatusInput] = useState(filters.status)
  const [dateFromInput, setDateFromInput] = useState(filters.dateFrom)
  const [dateToInput, setDateToInput] = useState(filters.dateTo)
  const [creatorInput, setCreatorInput] = useState(filters.creatorLogin)
  const [activeModerationOrderId, setActiveModerationOrderId] = useState<number | null>(null)

  const loadOrders = useCallback(
    () =>
      dispatch(
      fetchModeratorOrdersThunk({
        status: statusInput,
        dateFrom: dateFromInput,
        dateTo: dateToInput,
      }),
      ),
    [dateFromInput, dateToInput, dispatch, statusInput],
  )

  useEffect(() => {
    if (user?.role !== 'moderator') {
      navigate('/')
      return
    }
    void loadOrders()
  }, [loadOrders, navigate, user?.role])
  // Автоматическая перезагрузка заявок каждые 7 секунд
  useEffect(() => {
    if (user?.role !== 'moderator') return
    const timer = setInterval(() => {
      void loadOrders()
    }, 7000)
    return () => clearInterval(timer)
  }, [loadOrders, user?.role])

  const handleApplyFilters = () => {
    dispatch(
      setModeratorFilters({
        status: statusInput,
        dateFrom: dateFromInput,
        dateTo: dateToInput,
        creatorLogin: creatorInput,
      }),
    )
    void loadOrders()
  }

  const filteredOrders = useMemo(() => {
    if (!creatorInput.trim()) return orders
    const query = creatorInput.toLowerCase()
    return orders.filter((order) => (order.creator_login ?? '').toLowerCase().includes(query))
  }, [creatorInput, orders])

  const formedOrders = filteredOrders.filter((order) => order.status === 'formed')

  const handleModerate = async (orderId: number, action: 'complete' | 'reject') => {
    setActiveModerationOrderId(orderId)
    await dispatch(moderateOrderThunk({ orderId, action }))
    setActiveModerationOrderId(null)
    await loadOrders()
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Панель модератора' }]} />

      <div className="profile-page-wrapper">
        <h1 className="profile-title">Панель модератора</h1>
        <div className="profile-filter-panel">
          <div className="profile-filter-field">
            <label>Статус</label>
            <select className="profile-select" value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
              <option value="">Все</option>
              <option value="formed">На рассмотрении</option>
              <option value="completed">Выполнен</option>
              <option value="rejected">Отклонён</option>
            </select>
          </div>
          <div className="profile-filter-field">
            <label>Дата от</label>
            <input type="date" className="profile-input" value={dateFromInput} onChange={(e) => setDateFromInput(e.target.value)} />
          </div>
          <div className="profile-filter-field">
            <label>Дата до</label>
            <input type="date" className="profile-input" value={dateToInput} onChange={(e) => setDateToInput(e.target.value)} />
          </div>
          <div className="profile-filter-field">
            <label>Создатель (frontend)</label>
            <input
              className="profile-input"
              placeholder="login"
              value={creatorInput}
              onChange={(e) => setCreatorInput(e.target.value)}
            />
          </div>
          <div className="profile-filter-actions">
            <button className="btn-profile-filter" onClick={handleApplyFilters}>
              Применить
            </button>
          </div>
        </div>

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
                    disabled={moderating || activeModerationOrderId === order.id}
                    onClick={() => void handleModerate(order.id, 'complete')}
                  >
                    ✅ Принять
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={moderating || activeModerationOrderId === order.id}
                    onClick={() => void handleModerate(order.id, 'reject')}
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
              Все заявки по фильтрам
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
                {filteredOrders.map((order) => {
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
                      <td>{order.creator_login || '—'}</td>
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
                        <Link to={`/publishing-orders/${order.id}`} className="btn-detail-custom">
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
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
