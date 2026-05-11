import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import { logoutThunk } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchCartThunk } from '../store/orderSlice'
import { resetUserOrdersFilters } from '../store/userOrdersSlice'
import { resetModeratorFilters } from '../store/moderatorSlice'
import { resetWorksFilters } from '../store/worksSlice'

export default function AppNavbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const draftOrder = useAppSelector((state) => state.order.draftOrder)
  const cartCount = draftOrder?.works?.length ?? draftOrder?.works_count ?? 0

  useEffect(() => {
    if (!user) return
    void dispatch(fetchCartThunk())
  }, [dispatch, location.pathname, user])

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    dispatch(resetUserOrdersFilters())
    dispatch(resetModeratorFilters())
    dispatch(resetWorksFilters())
    navigate('/login')
  }

  const navigateToDraft = () => {
    if (draftOrder?.id) {
      navigate(`/publishing-orders/${draftOrder.id}`)
      return
    }
    navigate('/orders')
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid className="px-3">
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Folio
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Button className="mis-nav-btn" onClick={() => navigate('/')}>
              🏠 Главная
            </Button>
            <Button className="mis-nav-btn" onClick={() => navigate('/works')}>
              📚 Услуги
            </Button>

            <Button
              className="mis-nav-btn"
              onClick={navigateToDraft}
              disabled={!user}
              style={{ opacity: cartCount > 0 ? 1 : 0.5 }}
            >
              🛒 Корзина {cartCount > 0 && <span className="cart-badge-custom">{cartCount}</span>}
            </Button>

            {user?.role === 'moderator' && (
              <Button className="mis-nav-btn" onClick={() => navigate('/admin')}>
                Панель модератора
              </Button>
            )}

            {user ? (
              <>
                <Button className="mis-nav-btn" onClick={() => navigate('/profile')}>
                  👤 {user.name || user.login}
                </Button>
                <Button className="mis-nav-btn mis-nav-btn-logout" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button className="mis-nav-btn" onClick={() => navigate('/register')}>
                  Регистрация
                </Button>
                <Button className="mis-nav-btn" onClick={() => navigate('/login')}>
                  🔑 Войти
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}