import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockCart } from '../mocks/orders'
import type { Order } from '../types'

const SUBMIT_NOTICE_KEY = 'orders_submit_notice'

export default function OrdersPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [submittingCheckout, setSubmittingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [submitNotice, setSubmitNotice] = useState('')
  const [cartFromApi, setCartFromApi] = useState(false)
  const [bookTitle, setBookTitle] = useState('')
  const [circulation, setCirculation] = useState(1)
  const [bookTitleError, setBookTitleError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem(SUBMIT_NOTICE_KEY)
    if (stored) {
      setSubmitNotice(stored)
      sessionStorage.removeItem(SUBMIT_NOTICE_KEY)
    }
    fetch('/api/publishing-orders/cart', { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('Ошибка загрузки корзины'); return r.json() })
      .then((data: Order) => {
        setOrder(data)
        setCartFromApi(true)
      })
      .catch(() => {
        setOrder(mockCart)
        setCartFromApi(false)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || !order) return
    setBookTitle(order.book_title ?? '')
    setCirculation(order.circulation > 0 ? order.circulation : 1)
  }, [loading, order?.id])

  const readResponseError = async (r: Response) => {
    const text = await r.text().catch(() => '')
    try {
      const j = JSON.parse(text) as { error?: string }
      if (j?.error) return j.error
    } catch {
      /* not JSON */
    }
    return text.trim() || `Ошибка ${r.status}`
  }

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

  const handleCheckout = async () => {
    if (!cartFromApi || !order || order.status !== 'draft' || !order.works?.length) return
    if (!bookTitle.trim()) {
      setBookTitleError('Укажите название книги')
      return
    }
    setBookTitleError('')
    setCheckoutError('')
    setSubmittingCheckout(true)
    try {
      const r1 = await fetch(`/api/publishing-orders/${order.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_title: bookTitle.trim(),
          circulation: Number(circulation),
        }),
      })
      if (!r1.ok) throw new Error(await readResponseError(r1))
      const r2 = await fetch(`/api/publishing-orders/${order.id}/submit`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (!r2.ok) throw new Error(await readResponseError(r2))
      sessionStorage.setItem(
        SUBMIT_NOTICE_KEY,
        'Заказ оформлен! Ожидайте рассмотрения модератора.',
      )
      setOrder(null)
      window.location.reload()
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Неизвестная ошибка')
    } finally {
      setSubmittingCheckout(false)
    }
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Мои заказы' }]} />

      <div className="order-page-wrapper">
        {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}

        {!loading && submitNotice && (
          <div
            className="order-result-card"
            style={{ marginBottom: 16, borderColor: '#86efac', background: '#f0fdf4' }}
          >
            <span className="order-result-text" style={{ color: '#166534' }}>
              {submitNotice}
            </span>
          </div>
        )}

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

            {order?.book_title &&
              !(cartFromApi && order.status === 'draft' && hasItems) && (
              <p className="order-meta">📖 Книга: <strong>{order.book_title}</strong></p>
            )}
            {!!order?.circulation &&
              !(cartFromApi && order.status === 'draft' && hasItems) && (
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

                {cartFromApi && order!.status === 'draft' && (
                  <div
                    className="order-result-card"
                    style={{
                      marginTop: 16,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 16,
                    }}
                  >
                    <div className="profile-filter-field" style={{ marginBottom: 0 }}>
                      <label htmlFor="order-book-title">Название книги</label>
                      <input
                        id="order-book-title"
                        className="profile-input"
                        type="text"
                        value={bookTitle}
                        onChange={(e) => {
                          setBookTitle(e.target.value)
                          setBookTitleError('')
                        }}
                        disabled={submittingCheckout}
                        autoComplete="off"
                      />
                      {bookTitleError && (
                        <div className="mis-error" style={{ marginTop: 8, fontSize: 13 }}>
                          {bookTitleError}
                        </div>
                      )}
                    </div>
                    <div className="profile-filter-field" style={{ marginBottom: 0 }}>
                      <label htmlFor="order-circulation">Тираж (экземпляров)</label>
                      <input
                        id="order-circulation"
                        className="profile-input"
                        type="number"
                        min={1}
                        value={circulation}
                        onChange={(e) => {
                          const raw = e.target.value
                          if (raw === '') {
                            setCirculation(1)
                            return
                          }
                          const v = parseInt(raw, 10)
                          if (!Number.isFinite(v)) return
                          setCirculation(Math.max(1, v))
                        }}
                        disabled={submittingCheckout}
                      />
                    </div>
                  </div>
                )}

                <div className="order-result-card">
                  <span className="order-result-text">
                    Ориентировочная стоимость: {totalPrice.toLocaleString()} ₽
                  </span>
                  {cartFromApi && order!.status === 'draft' ? (
                    <button
                      type="button"
                      className="btn-submit-custom"
                      disabled={submittingCheckout}
                      onClick={() => void handleCheckout()}
                    >
                      {submittingCheckout ? 'Отправка…' : 'Перейти к оформлению'}
                    </button>
                  ) : order!.status !== 'draft' ? (
                    <span className="order-meta" style={{ margin: 0, textAlign: 'right' }}>
                      Заявка уже отправлена на рассмотрение
                    </span>
                  ) : (
                    <span className="order-meta" style={{ margin: 0, textAlign: 'right' }}>
                      Войдите в аккаунт, чтобы отправить заявку на рассмотрение.
                    </span>
                  )}
                </div>

                {checkoutError && (
                  <div className="mis-error" style={{ marginTop: 12 }}>
                    {checkoutError}
                  </div>
                )}

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