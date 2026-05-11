import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { fetchCartThunk } from '../store/orderSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function OrdersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { draftOrder, loadingCart, error } = useAppSelector((state) => state.order)

  useEffect(() => {
    void dispatch(fetchCartThunk())
  }, [dispatch])

  useEffect(() => {
    if (draftOrder?.id) {
      navigate(`/publishing-orders/${draftOrder.id}`, { replace: true })
    }
  }, [draftOrder?.id, navigate])

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Черновик заявки' }]} />

      <div className="order-page-wrapper">
        {loadingCart && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}
        {error && (
          <div className="order-empty">
            {error}
          </div>
        )}
        {!loadingCart && !error && !draftOrder && (
          <div className="order-empty">
            Черновик заявки пока не создан.<br />
            Добавьте услугу в каталоге.
            <br />
            <br />
            <Link to="/" className="btn-detail-custom">
              Перейти к услугам →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}