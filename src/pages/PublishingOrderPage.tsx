import { useEffect, useMemo, useRef } from 'react'
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

  const bookTitleRef = useRef<HTMLInputElement | null>(null)
  const circulationRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!Number.isFinite(orderId) || orderId <= 0) return
    void dispatch(fetchOrderByIdThunk(orderId))
  }, [dispatch, orderId])

  const isDraft = selectedOrder?.status === 'draft'
  const totalPrice = useMemo(
    () =>
      selectedOrder?.works?.reduce((sum, item) => sum + item.price_rub * item.quantity, 0) ?? 0,
    [selectedOrder?.works],
  )

  const reloadOrder = async () => {
    if (!selectedOrder?.id) return
    await dispatch(fetchOrderByIdThunk(selectedOrder.id))
  }

  const getDraftMeta = () => {
    const bookTitle = (bookTitleRef.current?.value ?? selectedOrder?.book_title ?? '').trim()
    const circulationValue = Number(circulationRef.current?.value ?? selectedOrder?.circulation ?? 1)
    return {
      bookTitle,
      circulation: Math.max(1, Number.isFinite(circulationValue) ? circulationValue : 1),
    }
  }

  const handleSubmitOrder = async () => {
    if (!selectedOrder?.id) return
    const { bookTitle, circulation } = getDraftMeta()

    const saveResult = await dispatch(
      updateOrderMetaThunk({
        orderId: selectedOrder.id,
        bookTitle,
        circulation,
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
    const result = await dispatch(
      updateOrderWorkThunk({
        orderId: selectedOrder.id,
        workId,
        quantity,
        comment,
      }),
    )
    if (updateOrderWorkThunk.fulfilled.match(result)) {
      await reloadOrder()
    }
  }

  const handleRemoveWork = async (workId: number) => {
    if (!selectedOrder?.id) return
    const result = await dispatch(removeOrderWorkThunk({ orderId: selectedOrder.id, workId }))
    if (removeOrderWorkThunk.fulfilled.match(result)) {
      await reloadOrder()
    }
  }

  if (loadingOrder) {
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

        <div className="order-result-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div className="profile-filter-field">
            <label htmlFor="book-title">Название книги</label>
            <input
              id="book-title"
              className="profile-input"
              ref={bookTitleRef}
              disabled={!isDraft || mutating}
              defaultValue={selectedOrder.book_title ?? ''}
              key={`book-${selectedOrder.id}`}
            />
          </div>
          <div className="profile-filter-field">
            <label htmlFor="circulation">Тираж</label>
            <input
              id="circulation"
              type="number"
              min={1}
              className="profile-input"
              ref={circulationRef}
              disabled={!isDraft || mutating}
              defaultValue={selectedOrder.circulation ?? 1}
              key={`circulation-${selectedOrder.id}`}
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

        {selectedOrder.works?.map((item) => (
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
