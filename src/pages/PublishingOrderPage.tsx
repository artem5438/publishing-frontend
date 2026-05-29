import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import ErrorAlert from '../components/ErrorAlert'
import {
  copyOrderToDraftThunk,
  deleteOrderThunk,
  fetchOrderByIdThunk,
  removeOrderWorkThunk,
  submitOrderThunk,
  updateOrderMetaThunk,
  updateOrderWorkThunk,
} from '../store/orderSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getOrderStatusLabel } from '../utils/orderStatus'
import { resolveSafeImageUrl } from '../utils/media'

export default function PublishingOrderPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selectedOrder, loadingOrder, mutating, error } = useAppSelector((state) => state.order)
  const user = useAppSelector((state) => state.auth.user)

  const [bookTitle, setBookTitle] = useState('')
  const [circulation, setCirculation] = useState(1)

  useEffect(() => {
    if (!Number.isFinite(orderId) || orderId <= 0) return
    void dispatch(fetchOrderByIdThunk(orderId))
  }, [dispatch, orderId])

  useEffect(() => {
    if (!selectedOrder) return
    setBookTitle(selectedOrder.book_title ?? '')
    setCirculation(selectedOrder.circulation ?? 1)
  }, [selectedOrder?.id])

  const isDraft = selectedOrder?.status === 'draft'
  const isRejected = selectedOrder?.status === 'rejected'
  const canCopyRejected =
    isRejected &&
    user?.role !== 'moderator' &&
    (!selectedOrder?.creator_login || selectedOrder.creator_login === user?.login)
  const sortedWorks = useMemo(
    () => [...(selectedOrder?.works ?? [])].sort((a, b) => a.work_id - b.work_id),
    [selectedOrder?.works],
  )
  const servicesSubtotal = useMemo(
    () => sortedWorks.reduce((sum, item) => sum + item.price_rub * item.quantity, 0),
    [sortedWorks],
  )
  const circulationValue = Math.max(1, Number.isFinite(circulation) ? circulation : 1)
  const draftGrandTotal = servicesSubtotal * circulationValue
  const displayTotal =
    !isDraft && selectedOrder?.total_price != null ? selectedOrder.total_price : draftGrandTotal

  const handleSubmitOrder = async () => {
    if (!selectedOrder?.id) return
    const trimmedTitle = bookTitle.trim()
    const circulationValue = Math.max(1, Number.isFinite(circulation) ? circulation : 1)

    const saveResult = await dispatch(
      updateOrderMetaThunk({
        orderId: selectedOrder.id,
        bookTitle: trimmedTitle,
        circulation: circulationValue,
      }),
    )
    if (updateOrderMetaThunk.rejected.match(saveResult)) return

    const submitResult = await dispatch(submitOrderThunk(selectedOrder.id))
    if (submitOrderThunk.fulfilled.match(submitResult)) {
      navigate('/profile')
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrder?.id) return
    if (!window.confirm('Удалить эту заявку?')) return
    const result = await dispatch(deleteOrderThunk(selectedOrder.id))
    if (deleteOrderThunk.fulfilled.match(result)) {
      navigate('/')
    }
  }

  const handleCopyToDraft = async () => {
    if (!selectedOrder?.id) return
    const result = await dispatch(copyOrderToDraftThunk(selectedOrder.id))
    if (copyOrderToDraftThunk.fulfilled.match(result)) {
      navigate(`/publishing-orders/${result.payload.id}`)
    }
  }

  const handleUpdateWorkQty = async (workId: number, quantity: number, comment: string) => {
    if (!selectedOrder?.id || quantity < 1) return
    await dispatch(
      updateOrderWorkThunk({
        orderId: selectedOrder.id,
        workId,
        quantity,
        comment,
      }),
    )
  }

  const handleRemoveWork = async (workId: number) => {
    if (!selectedOrder?.id) return
    await dispatch(removeOrderWorkThunk({ orderId: selectedOrder.id, workId }))
  }

  if (loadingOrder && !selectedOrder) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (!selectedOrder || !Number.isFinite(orderId) || orderId <= 0) {
    return <ErrorAlert variant="page" message="Заявка не найдена" />
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Профиль', path: '/profile' },
          { label: `Заявка №${selectedOrder.id}` },
        ]}
      />

      <div className="order-page-wrapper">
        <h1>Заявка №{selectedOrder.id}</h1>
        <p className="order-meta">
          Статус: <strong>{getOrderStatusLabel(selectedOrder.status)}</strong>
        </p>

        {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
          <ErrorAlert
            className="mb-3"
            title="Причина отклонения:"
            message={selectedOrder.rejection_reason}
          />
        )}

        {canCopyRejected && (
          <div className="order-actions-bar" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="mis-action-btn mis-action-btn--block mis-action-btn--secondary"
              disabled={mutating}
              onClick={() => void handleCopyToDraft()}
            >
              Создать новую заявку на основе этой
            </button>
          </div>
        )}

        <div className="order-result-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div className="profile-filter-field">
            <label htmlFor="book-title">Название книги</label>
            <input
              id="book-title"
              className="profile-input"
              disabled={!isDraft || mutating}
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
          </div>
          <div className="profile-filter-field">
            <label htmlFor="circulation">Тираж</label>
            <input
              id="circulation"
              type="number"
              min={1}
              className="profile-input"
              disabled={!isDraft || mutating}
              value={circulation}
              onChange={(e) => setCirculation(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div className="order-actions-bar">
            <button
              type="button"
              className="mis-action-btn mis-action-btn--lg"
              disabled={!isDraft || mutating}
              onClick={() => void handleSubmitOrder()}
            >
              Отправить на рассмотрение
            </button>
            <button
              type="button"
              className="mis-action-btn mis-action-btn--lg mis-action-btn--danger"
              disabled={!isDraft || mutating}
              onClick={() => void handleDeleteOrder()}
            >
              Удалить заявку
            </button>
          </div>
          {error && <ErrorAlert message={error} />}
        </div>

        {!selectedOrder.works?.length && (
          <div className="order-empty">
            В заявке нет услуг.
            <br />
            <br />
            <Link to="/works" className="mis-action-btn mis-action-btn--block">
              Добавить услуги →
            </Link>
          </div>
        )}

        {sortedWorks.map((item) => (
          <div key={item.work_id} className="order-item-card-custom">
            {item.image_url ? (
              <img
                src={resolveSafeImageUrl(item.image_url)}
                alt={item.work_name}
                className="order-item-img"
                loading="lazy"
              />
            ) : (
              <div className="order-item-img-placeholder" />
            )}

            <div>
              <div className="order-item-name">{item.work_name}</div>
              <div className="order-item-qty">
                <button
                  type="button"
                  className="mis-action-btn mis-action-btn--icon"
                  disabled={!isDraft || mutating || item.quantity <= 1}
                  onClick={() => void handleUpdateWorkQty(item.work_id, item.quantity - 1, item.comment ?? '')}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  type="button"
                  className="mis-action-btn mis-action-btn--icon"
                  disabled={!isDraft || mutating}
                  onClick={() => void handleUpdateWorkQty(item.work_id, item.quantity + 1, item.comment ?? '')}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div className="order-item-price">{(item.price_rub * item.quantity).toLocaleString()} ₽</div>
              <button
                type="button"
                className="mis-action-btn mis-action-btn--danger"
                disabled={!isDraft || mutating}
                onClick={() => void handleRemoveWork(item.work_id)}
              >
                Удалить услугу
              </button>
            </div>
          </div>
        ))}

        <div className="order-result-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          {isDraft ? (
            <>
              <span className="order-result-text">
                Сумма услуг: {servicesSubtotal.toLocaleString('ru-RU')} ₽
              </span>
              <span className="order-result-text">Тираж: {circulationValue} экз.</span>
              <span className="order-result-text">
                Итого к оплате: {servicesSubtotal.toLocaleString('ru-RU')} × {circulationValue} ={' '}
                {draftGrandTotal.toLocaleString('ru-RU')} ₽
              </span>
            </>
          ) : (
            <span className="order-result-text">
              Итого: {displayTotal.toLocaleString('ru-RU')} ₽
              {selectedOrder.circulation != null && selectedOrder.circulation > 0
                ? ` (тираж ${selectedOrder.circulation} экз.)`
                : ''}
            </span>
          )}
          {!isDraft && <span>Режим просмотра: редактирование отключено</span>}
        </div>
      </div>
    </>
  )
}
