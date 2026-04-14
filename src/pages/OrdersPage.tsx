import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockCart } from '../mocks/orders'
import type { Order } from '../types'

export default function OrdersPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/publishing-orders/cart', { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('Ошибка загрузки корзины'); return r.json() })
      .then((data: Order) => setOrder(data))
      .catch(() => setOrder(mockCart))
      .finally(() => setLoading(false))
  }, [])

  const handleQty = (workId: number, delta: number) => {
    if (!order) return
    const item = order.works!.find((w) => w.work_id === workId)
    if (!item) return
    const newQty = item.quantity + delta
    if (newQty < 1) return

    setOrder((prev) => prev ? {
      ...prev,
      works: prev.works!.map((w) =>
        w.work_id === workId ? { ...w, quantity: newQty } : w
      ),
    } : prev)

    setUpdatingId(workId)
    fetch(`/api/publishing-orders/${order.id}/works/${workId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty, comment: item.comment ?? '' }),
    })
      .then((r) => { if (!r.ok) throw new Error('Ошибка обновления') })
      .catch(() => {
        setOrder((prev) => prev ? {
          ...prev,
          works: prev.works!.map((w) =>
            w.work_id === workId ? { ...w, quantity: item.quantity } : w
          ),
        } : prev)
      })
      .finally(() => setUpdatingId(null))
  }

  const handleDelete = () => {
    if (!order) return
    if (!confirm('Удалить заявку?')) return
    setDeleting(true)
    fetch(`/api/publishing-orders/${order.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((r) => { if (!r.ok) throw new Error('Ошибка удаления'); navigate('/') })
      .catch((err: Error) => setError(err.message))
      .finally(() => setDeleting(false))
  }

  const totalPrice = order?.works?.reduce(
    (sum, item) => sum + item.price_rub * item.quantity, 0
  ) ?? 0

  const hasItems = order?.works && order.works.length > 0

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Мои заказы' }]} />

      <div className="order-page-wrapper">
        {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}

        {error && (
          <>
            <h1>Заявка</h1>
            <div className="order-empty">
              {error}<br /><br />
              <Link to="/" className="btn-detail-custom">Просмотреть работы →</Link>
            </div>
          </>
        )}

        {!loading && !error && (
          <>
            <h1>Заявка №{order?.id}</h1>

            {order?.book_title && (
              <p className="order-meta">📖 Книга: <strong>{order.book_title}</strong></p>
            )}
            {!!order?.circulation && (
              <p className="order-meta">📦 Тираж: <strong>{order.circulation} экз.</strong></p>
            )}

            {hasItems ? (
              <>
                {order!.works!.map((item) => (
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
                          onClick={() => handleQty(item.work_id, -1)}
                          disabled={updatingId === item.work_id || item.quantity <= 1}
                        >−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn-custom"
                          onClick={() => handleQty(item.work_id, +1)}
                          disabled={updatingId === item.work_id}
                        >+</button>
                        <span>шт.</span>
                      </div>
                      {item.comment && (
                        <div className="order-item-comment">💬 {item.comment}</div>
                      )}
                    </div>

                    <div className="order-item-price">
                      {(item.price_rub * item.quantity).toLocaleString()} ₽
                    </div>
                  </div>
                ))}

                <div className="order-result-card">
                  <span className="order-result-text">
                    Ориентировочная стоимость: {totalPrice.toLocaleString()} ₽
                  </span>
                  <Link to="/" className="btn-submit-custom">Перейти к оформлению</Link>
                </div>

                <button
                  className="btn-delete-custom"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Удаляем...' : '🗑 Удалить заявку'}
                </button>
              </>
            ) : (
              <div className="order-empty">
                Добавьте что-нибудь в заявку<br /><br />
                <Link to="/" className="btn-detail-custom">Просмотреть работы →</Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}