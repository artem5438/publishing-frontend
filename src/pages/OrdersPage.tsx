import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockCart } from '../mocks/orders'
import type { Order } from '../types'

const USE_MOCK = false

const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  draft: { label: 'Черновик', variant: 'secondary' },
  formed: { label: 'Сформирован', variant: 'primary' },
  completed: { label: 'Выполнен', variant: 'success' },
  rejected: { label: 'Отклонён', variant: 'danger' },
  deleted: { label: 'Удалён', variant: 'dark' },
}

export default function OrdersPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (USE_MOCK) {
  setTimeout(() => {
    setOrder(mockCart)
    setLoading(false)
  }, 0)
  return
}
    fetch('/api/publishing-orders/cart', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Ошибка загрузки корзины')
        return r.json()
      })
      .then((data: Order) => {
        setOrder(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const status = order ? STATUS_LABELS[order.status] : null

  return (
    <Container className="py-4">
      <Breadcrumbs
        items={[{ label: 'Главная', path: '/' }, { label: 'Мои заказы' }]}
      />
      <h1 className="mb-4">Мои заказы</h1>

      {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}
      {error && <Alert variant="warning">{error}</Alert>}

      {!loading && !error && (!order || !order.works || order.works.length === 0) && (
        <Alert variant="info">Заказов пока нет. Перейдите в <a href="/">каталог услуг</a> и добавьте услуги.</Alert>
      )}

      {order && order.works && order.works.length > 0 && (
        <>
          <div className="mb-3 d-flex gap-3 align-items-center">
            {status && <Badge bg={status.variant} className="fs-6">{status.label}</Badge>}
            {order.booktitle && <span className="text-muted">Книга: <strong>{order.booktitle}</strong></span>}
            {order.circulation > 0 && <span className="text-muted">Тираж: <strong>{order.circulation} экз.</strong></span>}
          </div>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Услуга</th>
                <th>Цена за ед.</th>
                <th>Количество</th>
                <th>Сумма</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {order.works.map((item) => (
                <tr key={item.workid}>
                  <td>{item.workname}</td>
                  <td>{item.pricerub.toLocaleString()} ₽</td>
                  <td>{item.quantity}</td>
                  <td>{(item.pricerub * item.quantity).toLocaleString()} ₽</td>
                  <td className="text-muted">{item.comment || '—'}</td>
                </tr>
              ))}
            </tbody>
            {order.totalprice && (
              <tfoot>
                <tr className="table-secondary fw-bold">
                  <td colSpan={3}>Итого</td>
                  <td colSpan={2}>{order.totalprice.toLocaleString()} ₽</td>
                </tr>
              </tfoot>
            )}
          </Table>
        </>
      )}
    </Container>
  )
}