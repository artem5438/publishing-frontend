import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { updateProfileThunk } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchUserOrdersThunk, setUserOrdersFilters } from '../store/userOrdersSlice'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  formed:    { label: 'На рассмотрении', color: '#f59e0b' },
  completed: { label: 'Выполнен',        color: '#22c55e' },
  rejected:  { label: 'Отклонён',        color: '#e53935' },
  draft:     { label: 'Черновик',        color: '#999'    },
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const authLoading = useAppSelector((state) => state.auth.loading)
  const { items: orders, loading, error, filters } = useAppSelector((state) => state.userOrders)

  const [statusInput, setStatusInput] = useState(filters.status)
  const [dateFromInput, setDateFromInput] = useState(filters.dateFrom)
  const [dateToInput, setDateToInput] = useState(filters.dateTo)
  const [nameInput, setNameInput] = useState(user?.name ?? '')
  const [passwordInput, setPasswordInput] = useState('')
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

  const handleProfileSave = async () => {
    setProfileMessage('')
    const result = await dispatch(
      updateProfileThunk({
        name: nameInput.trim() || undefined,
        password: passwordInput.trim() || undefined,
      }),
    )
    if (updateProfileThunk.rejected.match(result)) {
      setProfileMessage(result.payload ?? 'Не удалось обновить профиль')
      return
    }
    if (updateProfileThunk.fulfilled.match(result)) {
      setNameInput(result.payload.name ?? result.payload.login)
    }
    setPasswordInput('')
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
            <div className="profile-filter-field">
              <label>Новый пароль</label>
              <input
                className="profile-input"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Оставьте пустым, если не меняете"
              />
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
        {!loading && error && <div className="mis-error py-4">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="order-empty">Заказов не найдено</div>
        )}

        {!loading && !error && sortedOrders.length > 0 && (
          <div className="profile-order-card">
            <table className="params-table-custom">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Статус</th>
                  <th>Книга</th>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '#999' }
                  const date = order.formed_at
                    ? new Date(order.formed_at).toLocaleDateString('ru-RU')
                    : new Date(order.created_at).toLocaleDateString('ru-RU')
                  const total = order.total_price ? `${order.total_price.toLocaleString()} ₽` : '—'
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <span className="profile-order-status" style={{ color: statusInfo.color, borderColor: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>{order.book_title || '—'}</td>
                      <td>{date}</td>
                      <td>{total}</td>
                      <td>
                        <Link className="btn-detail-custom" to={`/publishing-orders/${order.id}`}>
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}