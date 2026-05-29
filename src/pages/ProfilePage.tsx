import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import ErrorAlert from '../components/ErrorAlert'
import { updateProfileThunk } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { copyOrderToDraftThunk } from '../store/orderSlice'
import { fetchUserOrdersThunk, setUserOrdersFilters } from '../store/userOrdersSlice'
import { getOrderStatusInfo } from '../utils/orderStatus'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const orderMutating = useAppSelector((state) => state.order.mutating)
  const authLoading = useAppSelector((state) => state.auth.loading)
  const { items: orders, loading, error, filters } = useAppSelector((state) => state.userOrders)

  const [statusInput, setStatusInput] = useState(filters.status)
  const [dateFromInput, setDateFromInput] = useState(filters.dateFrom)
  const [dateToInput, setDateToInput] = useState(filters.dateTo)
  const [nameInput, setNameInput] = useState(user?.name ?? '')
  const [profileMessage, setProfileMessage] = useState('')

  useEffect(() => {
    void dispatch(fetchUserOrdersThunk(filters))
  }, [dispatch, filters])

  const handleFilter = () => {
    dispatch(setUserOrdersFilters({ status: statusInput, dateFrom: dateFromInput, dateTo: dateToInput }))
  }

  const handleReset = () => {
    setStatusInput('')
    setDateFromInput('')
    setDateToInput('')
    dispatch(setUserOrdersFilters({ status: '', dateFrom: '', dateTo: '' }))
  }

  const applyTodayFilter = () => {
    const today = new Date().toISOString().slice(0, 10)
    setDateFromInput(today)
    setDateToInput(today)
    dispatch(setUserOrdersFilters({ status: statusInput, dateFrom: today, dateTo: today }))
  }

  const handleCopyRejected = async (orderId: number) => {
    const result = await dispatch(copyOrderToDraftThunk(orderId))
    if (copyOrderToDraftThunk.fulfilled.match(result)) {
      navigate(`/publishing-orders/${result.payload.id}`)
    }
  }

  const handleProfileSave = async () => {
    setProfileMessage('')
    const result = await dispatch(
      updateProfileThunk({
        name: nameInput.trim() || undefined,
      }),
    )
    if (updateProfileThunk.rejected.match(result)) {
      setProfileMessage(result.payload ?? 'Не удалось обновить профиль')
      return
    }
    if (updateProfileThunk.fulfilled.match(result)) {
      setNameInput(result.payload.name ?? result.payload.login)
    }
    setProfileMessage('Профиль успешно обновлён')
  }

  const sortedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const left = new Date(b.formed_at ?? b.created_at).getTime()
        const right = new Date(a.formed_at ?? a.created_at).getTime()
        return left - right
      }),
    [orders],
  )

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Профиль' }]} />

      <div className="profile-page-wrapper">
        <h1 className="profile-title">Личный кабинет</h1>
        <div className="profile-order-card">
          <div className="profile-filter-panel" style={{ marginBottom: 0 }}>
            <div className="profile-filter-field">
              <label>Логин</label>
              <input className="profile-input" value={user?.login ?? ''} disabled />
            </div>
            <div className="profile-filter-field">
              <label>Имя</label>
              <input className="profile-input" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
            </div>
            <div className="profile-filter-actions">
              <button className="btn-profile-filter" disabled={authLoading} onClick={() => void handleProfileSave()}>
                {authLoading ? 'Сохраняем...' : 'Сохранить профиль'}
              </button>
            </div>
          </div>
          {profileMessage && <div style={{ marginTop: 8, fontSize: 13 }}>{profileMessage}</div>}
        </div>

        <h1 className="profile-title">Мои заказы</h1>

        <div className="profile-filter-panel">
          <div className="profile-filter-field">
            <label>Статус</label>
            <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)} className="profile-select">
              <option value="">Все</option>
              <option value="formed">На рассмотрении</option>
              <option value="completed">Выполнен</option>
              <option value="rejected">Отклонён</option>
            </select>
          </div>

          <div className="profile-filter-field">
            <label>Дата от</label>
            <input type="date" value={dateFromInput} onChange={(e) => setDateFromInput(e.target.value)} className="profile-input" />
          </div>

          <div className="profile-filter-field">
            <label>Дата до</label>
            <input type="date" value={dateToInput} onChange={(e) => setDateToInput(e.target.value)} className="profile-input" />
          </div>

          <div className="profile-filter-actions">
            <button className="btn-profile-filter" onClick={handleFilter}>Применить</button>
            <button className="btn-profile-filter" onClick={applyTodayFilter}>Сегодня</button>
            <button className="btn-profile-reset" onClick={handleReset}>Сброс</button>
          </div>
        </div>

        {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}
        {!loading && error && <ErrorAlert message={error} className="mb-3" />}
        {!loading && !error && orders.length === 0 && (
          <div className="order-empty">Заказов не найдено</div>
        )}

        {!loading && !error && sortedOrders.length > 0 && (
          <div className="profile-orders-list">
            {sortedOrders.map((order) => {
              const statusInfo = getOrderStatusInfo(order.status)
              const date = order.formed_at
                ? new Date(order.formed_at).toLocaleDateString('ru-RU')
                : new Date(order.created_at).toLocaleDateString('ru-RU')
              const total = order.total_price ? `${order.total_price.toLocaleString()} ₽` : '—'
              return (
                <article key={order.id} className="profile-order-card">
                  <div className="profile-order-header">
                    <span className="profile-order-id">№ {order.id}</span>
                    <span
                      className="profile-order-status"
                      style={{ color: statusInfo.color, borderColor: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="profile-order-meta">
                    <span>{order.book_title || '—'}</span>
                    <span>{date}</span>
                    <span className="profile-order-total">{total}</span>
                  </div>
                  <div className="profile-order-footer">
                    <Link
                      className="mis-action-btn mis-action-btn--block"
                      to={`/publishing-orders/${order.id}`}
                    >
                      Открыть
                    </Link>
                    {order.status === 'rejected' && user?.role !== 'moderator' && (
                      <button
                        type="button"
                        className="mis-action-btn mis-action-btn--block mis-action-btn--secondary"
                        disabled={orderMutating}
                        onClick={() => void handleCopyRejected(order.id)}
                      >
                        Новая на основе этой
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}