import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import {
  deleteOrderThunk,
  fetchOrderByIdThunk,
  removeOrderWorkThunk,
  submitOrderThunk,
  updateOrderMetaThunk,
  updateOrderWorkThunk,
} from '../store/orderSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function PublishingOrderPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selectedOrder, loadingOrder, mutating, error } = useAppSelector((state) => state.order)

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
  const sortedWorks = useMemo(
    () => [...(selectedOrder?.works ?? [])].sort((a, b) => a.work_id - b.work_id),
    [selectedOrder?.works],
  )
  const totalPrice = useMemo(
    () => sortedWorks.reduce((sum, item) => sum + item.price_rub * item.quantity, 0),
    [sortedWorks],
  )

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
    return <div className="mis-error py-5">Заявка не найдена</div>
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
          Статус: <strong>{selectedOrder.status === 'draft' ? 'Черновик' : selectedOrder.status}</strong>
        </p>

        {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
          <div
            className="order-result-card mis-error"
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(229, 57, 53, 0.08)',
            }}
          >
            <strong>Причина отклонения:</strong> {selectedOrder.rejection_reason}
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
              className="order-primary-action-btn"
              disabled={!isDraft || mutating}
              onClick={() => void handleSubmitOrder()}
            >
              Отправить на рассмотрение
            </button>
            <button
              className="order-secondary-action-btn"
              disabled={!isDraft || mutating}
              onClick={() => void handleDeleteOrder()}
            >
              Удалить заявку
            </button>
          </div>
        </div>

        {!selectedOrder.works?.length && (
          <div className="order-empty">
            В заявке нет услуг.
            <br />
            <br />
            <Link to="/works" className="btn-detail-custom">
              Добавить услуги →
            </Link>
          </div>
        )}

        {sortedWorks.map((item) => (
          <div key={item.work_id} className="order-item-card-custom">
            {item.image_url ? (
              <img src={item.image_url} alt={item.work_name} className="order-item-img" />
            ) : (
              <div className="order-item-img-placeholder" />
            )}

            <div>
              <div className="order-item-name">{item.work_name}</div>
              <div className="order-item-qty">
                <button
                  className="qty-btn-custom"
                  disabled={!isDraft || mutating || item.quantity <= 1}
                  onClick={() => void handleUpdateWorkQty(item.work_id, item.quantity - 1, item.comment ?? '')}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn-custom"
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
                className="order-item-action-btn"
                disabled={!isDraft || mutating}
                onClick={() => void handleRemoveWork(item.work_id)}
              >
                Удалить услугу
              </button>
            </div>
          </div>
        ))}

        <div className="order-result-card">
          <span className="order-result-text">Итого: {totalPrice.toLocaleString()} ₽</span>
          {!isDraft && <span>Режим просмотра: редактирование отключено</span>}
        </div>

        {error && <div className="mis-error">{error}</div>}
      </div>
    </>
  )
}
