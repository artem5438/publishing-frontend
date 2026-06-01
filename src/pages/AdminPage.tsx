import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spinner, Button } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import ErrorAlert from '../components/ErrorAlert'
import StatisticsErrorBoundary from '../components/StatisticsErrorBoundary'
import AdminWorksTab from '../components/AdminWorksTab'
import WorkFormModal from '../components/WorkFormModal'
import {
  fetchModeratorOrdersThunk,
  fetchPendingCountThunk,
  moderateOrderThunk,
  setModeratorFilters,
} from '../store/moderatorSlice'
import { fetchAdminWorksThunk } from '../store/worksAdminSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { Work } from '../types'
import { getOrderStatusInfo } from '../utils/orderStatus'

const AdminStatisticsTab = lazy(() => import('../components/AdminStatisticsTab'))

const statisticsTabFallback = (
  <div className="text-center py-5">
    <Spinner animation="border" />
  </div>
)

export default function AdminPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { items: orders, loading, moderating, error, filters } = useAppSelector((state) => state.moderator)
  const pendingCount = useAppSelector((state) => state.moderator.pendingCount)
  const {
    works: adminWorks,
    loading: worksLoading,
    error: worksError,
  } = useAppSelector((state) => state.worksAdmin)

  const [activeTab, setActiveTab] = useState<'orders' | 'works' | 'statistics'>('orders')
  const [showWorkModal, setShowWorkModal] = useState(false)
  const [editingWork, setEditingWork] = useState<Work | null>(null)
  const [statusInput, setStatusInput] = useState(filters.status)
  const [dateFromInput, setDateFromInput] = useState(filters.dateFrom)
  const [dateToInput, setDateToInput] = useState(filters.dateTo)
  const [creatorInput, setCreatorInput] = useState(filters.creatorLogin)
  const [activeModerationOrderId, setActiveModerationOrderId] = useState<number | null>(null)
  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (user?.role !== 'moderator') {
      navigate('/')
    }
  }, [navigate, user?.role])

  // «Заказы»: список без works[] — меньше трафика; фильтры с сервера.
  useEffect(() => {
    if (user?.role !== 'moderator' || activeTab === 'statistics') return
    void dispatch(
      fetchModeratorOrdersThunk({
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    )
  }, [activeTab, dispatch, filters.dateFrom, filters.dateTo, filters.status, user?.role])

  // «Статистика»: полный состав заявок (include_works) для топ-3 услуг; период — на клиенте.
  useEffect(() => {
    if (user?.role !== 'moderator' || activeTab !== 'statistics') return
    void dispatch(
      fetchModeratorOrdersThunk({
        status: '',
        dateFrom: '',
        dateTo: '',
        includeWorks: true,
      }),
    )
    void dispatch(fetchAdminWorksThunk())
  }, [activeTab, dispatch, user?.role])

  useEffect(() => {
    if (user?.role !== 'moderator' || activeTab !== 'works') return
    void dispatch(fetchAdminWorksThunk())
  }, [activeTab, dispatch, user?.role])

  const handleApplyFilters = () => {
    dispatch(
      setModeratorFilters({
        status: statusInput,
        dateFrom: dateFromInput,
        dateTo: dateToInput,
        creatorLogin: creatorInput,
      }),
    )
  }

  const filteredOrders = (() => {
    const query = filters.creatorLogin.trim().toLowerCase()
    if (!query) return orders
    return orders.filter((order) => (order.creator_login ?? '').toLowerCase().includes(query))
  })()

  const formedOrders = filteredOrders.filter((order) => order.status === 'formed')

  const reloadOrders = async () => {
    await dispatch(
      fetchModeratorOrdersThunk({
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    )
    void dispatch(fetchPendingCountThunk())
  }

  const handleAccept = async (orderId: number) => {
    setRejectOrderId(null)
    setRejectReason('')
    setActiveModerationOrderId(orderId)
    await dispatch(moderateOrderThunk({ orderId, action: 'complete' }))
    setActiveModerationOrderId(null)
    await reloadOrders()
  }

  const handleConfirmReject = async () => {
    if (rejectOrderId == null) return
    if (!rejectReason.trim()) {
      return
    }
    setActiveModerationOrderId(rejectOrderId)
    const result = await dispatch(
      moderateOrderThunk({
        orderId: rejectOrderId,
        action: 'reject',
        rejectionReason: rejectReason.trim(),
      }),
    )
    setActiveModerationOrderId(null)
    if (moderateOrderThunk.fulfilled.match(result)) {
      setRejectOrderId(null)
      setRejectReason('')
      await reloadOrders()
    }
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Панель модератора' }]} />

      <div className="profile-page-wrapper">
        <h1 className="profile-title">Панель модератора</h1>

        <div className="mis-tab-switcher">
          <button
            type="button"
            className={`mis-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Заказы
            {pendingCount > 0 && <span className="cart-badge-custom">{pendingCount}</span>}
          </button>
          <button
            type="button"
            className={`mis-tab-btn${activeTab === 'works' ? ' active' : ''}`}
            onClick={() => setActiveTab('works')}
          >
            Услуги
          </button>
          <button
            type="button"
            className={`mis-tab-btn${activeTab === 'statistics' ? ' active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Статистика
          </button>
        </div>

        {activeTab === 'orders' && (
          <>
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
            <label>Создатель</label>
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

        {!loading && error && <ErrorAlert message={error} className="mb-3" />}

        {!loading && !error && formedOrders.length === 0 && (
          <div className="order-empty">Нет заявок на рассмотрении</div>
        )}

        {!loading &&
          !error &&
          formedOrders.map((order) => {
            const statusInfo = getOrderStatusInfo(order.status)
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
                  <span>Создатель: {order.creator_login}</span>
                  <span>Книга: {order.book_title || '—'}</span>
                  <span>Стоимость: {total}</span>
                  <span>Подана: {formedDate}</span>
                </div>

                <div className="profile-order-footer d-flex flex-column gap-2">
                  {rejectOrderId === order.id ? (
                    <>
                      <label htmlFor={`reject-reason-${order.id}`}>Причина отклонения</label>
                      <textarea
                        id={`reject-reason-${order.id}`}
                        className="profile-input"
                        style={{ height: 'auto', minHeight: 80 }}
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Укажите причину для создателя"
                      />
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={moderating || !rejectReason.trim()}
                          onClick={() => void handleConfirmReject()}
                        >
                          Подтвердить отклонение
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={moderating}
                          onClick={() => {
                            setRejectOrderId(null)
                            setRejectReason('')
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex gap-2 flex-wrap align-items-center">
                      <Link
                        to={`/publishing-orders/${order.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Посмотреть состав
                      </Link>
                      <Button
                        variant="success"
                        size="sm"
                        disabled={moderating || activeModerationOrderId === order.id}
                        onClick={() => void handleAccept(order.id)}
                      >
                        Принять
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={moderating || activeModerationOrderId === order.id}
                        onClick={() => {
                          setRejectOrderId(order.id)
                          setRejectReason('')
                        }}
                      >
                        Отклонить
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

        {!loading && !error && (
          <div style={{ marginTop: 40 }}>
            <h3 className="profile-title" style={{ fontSize: '1.25rem', marginBottom: 16 }}>
              Все заявки по фильтрам
            </h3>

            {filteredOrders.length === 0 && (
              <div className="order-empty" style={{ marginTop: 8 }}>
                Нет заказов в выборке
              </div>
            )}

            {filteredOrders.length > 0 && (
              <div className="profile-orders-list">
                {filteredOrders.map((order) => {
                  const statusInfo = getOrderStatusInfo(order.status)
                  const dateRaw =
                    order.status === 'draft'
                      ? order.created_at
                      : order.formed_at ?? order.created_at
                  const dateStr = dateRaw
                    ? new Date(dateRaw).toLocaleDateString('ru-RU')
                    : '—'
                  const total =
                    order.total_price != null
                      ? `${order.total_price.toLocaleString('ru-RU')} ₽`
                      : '—'

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
                        <span>Автор: {order.creator_login || '—'}</span>
                        <span>{order.book_title || '—'}</span>
                        <span>{dateStr}</span>
                        <span className="profile-order-total">{total}</span>
                      </div>
                      <div className="profile-order-footer">
                        <Link
                          className="mis-action-btn mis-action-btn--block"
                          to={`/publishing-orders/${order.id}`}
                        >
                          Открыть
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )}
          </>
        )}

        {activeTab === 'works' && (
          <AdminWorksTab
            onAdd={() => {
              setEditingWork(null)
              setShowWorkModal(true)
            }}
            onEdit={(work) => {
              setEditingWork(work)
              setShowWorkModal(true)
            }}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsErrorBoundary>
            <Suspense fallback={statisticsTabFallback}>
              <AdminStatisticsTab
                orders={orders}
                works={adminWorks}
                loading={loading || worksLoading}
                error={error || worksError}
              />
            </Suspense>
          </StatisticsErrorBoundary>
        )}

        <WorkFormModal
          show={showWorkModal}
          onHide={() => {
            setShowWorkModal(false)
            setEditingWork(null)
          }}
          work={editingWork}
          onSaved={() => void dispatch(fetchAdminWorksThunk())}
        />
      </div>
    </>
  )
}
