import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockCart } from '../mocks/orders'
import type { Order } from '../types'

const USE_MOCK = false
const MINIO_URL = 'http://localhost:9000/publishing-media'

export default function OrdersPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => { setOrder(mockCart); setLoading(false) }, 0)
      return
    }
    fetch('/api/publishing-orders/cart', { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('Ошибка загрузки корзины'); return r.json() })
      .then((data: Order) => { setOrder(data); setLoading(false) })
      .catch((err: Error) => { setError(err.message); setLoading(false) })
  }, [])

  const hasItems = order?.works && order.works.length > 0

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Мои заказы' }]} />

      <div className="order-page-wrapper">
        {loading && (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        )}

        {error && (
          <>
            <h1>Заявка</h1>
            <div className="order-empty">
              {error}
              <br /><br />
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
                    {item.image_key ? (
                      <img
                        src={`${MINIO_URL}/${item.image_key}`}
                        alt={item.work_name}
                        className="order-item-img"
                      />
                    ) : (
                      <div className="order-item-img-placeholder" />
                    )}

                    <div>
                      <div className="order-item-name">{item.work_name}</div>
                      <div className="order-item-qty">
                        <button className="qty-btn-custom">−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn-custom">+</button>
                        <span>шт.</span>
                      </div>
                      {item.comment && (
                        <div className="order-item-comment">💬 {item.comment}</div>
                      )}
                    </div>

                    <div className="order-item-price">
                      {item.price_rub.toLocaleString()} ₽
                    </div>
                  </div>
                ))}

                <div className="order-result-card">
                  <span className="order-result-text">
                    {order?.total_price
                      ? `Итого: ${order.total_price.toLocaleString()} ₽`
                      : `Услуг в заявке: ${order!.works!.length}`}
                  </span>
                  <Link to="/" className="btn-submit-custom">
                    Перейти к оформлению
                  </Link>
                </div>

                <button className="btn-delete-custom">🗑 Удалить заявку</button>
              </>
            ) : (
              <div className="order-empty">
                Добавьте что-нибудь в заявку
                <br /><br />
                <Link to="/" className="btn-detail-custom">Просмотреть работы →</Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}