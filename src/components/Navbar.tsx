import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container, Offcanvas } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import { logoutThunk } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchCartThunk } from '../store/orderSlice'
import { resetUserOrdersFilters } from '../store/userOrdersSlice'
import { fetchPendingCountThunk, resetModeratorFilters } from '../store/moderatorSlice'
import { resetWorksFilters } from '../store/worksSlice'
import { IS_GUEST_MODE } from '../config/env'

export default function AppNavbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const draftOrder = useAppSelector((state) => state.order.draftOrder)
  const cartCount = draftOrder?.works?.length ?? draftOrder?.works_count ?? 0
  const pendingCount = useAppSelector((state) => state.moderator.pendingCount)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!user) return
    void dispatch(fetchCartThunk())
  }, [dispatch, location.pathname, user])

  useEffect(() => {
    if (user?.role !== 'moderator') return
    void dispatch(fetchPendingCountThunk())
  }, [dispatch, location.pathname, user?.role])

  useEffect(() => {
    setExpanded(false)
  }, [location.pathname])

  const closeNav = () => setExpanded(false)

  const handleLogout = async () => {
    closeNav()
    await dispatch(logoutThunk())
    dispatch(resetUserOrdersFilters())
    dispatch(resetModeratorFilters())
    dispatch(resetWorksFilters())
    navigate('/login')
  }

  const navigateToDraft = () => {
    closeNav()
    if (draftOrder?.id) {
      navigate(`/publishing-orders/${draftOrder.id}`)
      return
    }
    navigate('/orders')
  }

  const go = (path: string) => {
    closeNav()
    navigate(path)
  }

  return (
    <Navbar
      bg="light"
      variant="light"
      expand="lg"
      sticky="top"
      className="mis-navbar"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="px-3">
        <Navbar.Brand onClick={() => go('/')} style={{ cursor: 'pointer' }}>
          Folio
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" aria-label="Открыть меню" />
        <Nav className="ms-auto d-none d-lg-flex align-items-center mis-navbar-desktop">
          <Button className="mis-nav-btn" onClick={() => navigate('/')}>
            Главная
          </Button>
          <Button className="mis-nav-btn" onClick={() => navigate('/works')}>
            Услуги
          </Button>

          {!IS_GUEST_MODE && (
            <Button
              className="mis-nav-btn"
              onClick={navigateToDraft}
              disabled={!user}
              style={{ opacity: cartCount > 0 ? 1 : 0.5 }}
            >
              Корзина {cartCount > 0 && <span className="cart-badge-custom">{cartCount}</span>}
            </Button>
          )}

          {!IS_GUEST_MODE && user?.role === 'moderator' && (
            <Button className="mis-nav-btn" onClick={() => navigate('/admin')}>
              Панель модератора
              {pendingCount > 0 && <span className="cart-badge-custom">{pendingCount}</span>}
            </Button>
          )}

          {!IS_GUEST_MODE && user ? (
            <>
              <Button className="mis-nav-btn" onClick={() => navigate('/profile')}>
                {user.name || user.login}
              </Button>
              <Button className="mis-nav-btn mis-nav-btn-logout" onClick={() => void handleLogout()}>
                Выйти
              </Button>
            </>
          ) : !IS_GUEST_MODE ? (
            <>
              <Button className="mis-nav-btn" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
              <Button className="mis-nav-btn" onClick={() => navigate('/login')}>
                Войти
              </Button>
            </>
          ) : null}
        </Nav>

        <Navbar.Offcanvas
          id="main-nav"
          aria-labelledby="main-nav-label"
          placement="end"
          className="mis-nav-offcanvas"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="main-nav-label">Меню</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="mis-nav-mobile flex-column">
              <Nav.Link className="mis-nav-link" onClick={() => go('/')}>
                Главная
              </Nav.Link>
              <Nav.Link className="mis-nav-link" onClick={() => go('/works')}>
                Услуги
              </Nav.Link>

              {!IS_GUEST_MODE && (
                <Nav.Link
                  className={`mis-nav-link mis-nav-link--cart${cartCount > 0 ? '' : ' mis-nav-link--muted'}`}
                  onClick={() => {
                    if (!user) return
                    navigateToDraft()
                  }}
                  style={!user ? { pointerEvents: 'none' } : undefined}
                >
                  <span>Корзина</span>
                  {cartCount > 0 && <span className="cart-badge-custom">{cartCount}</span>}
                </Nav.Link>
              )}

              {!IS_GUEST_MODE && user?.role === 'moderator' && (
                <Nav.Link className="mis-nav-link mis-nav-link--cart" onClick={() => go('/admin')}>
                  <span>Панель модератора</span>
                  {pendingCount > 0 && <span className="cart-badge-custom">{pendingCount}</span>}
                </Nav.Link>
              )}

              {!IS_GUEST_MODE && user ? (
                <>
                  <Nav.Link className="mis-nav-link" onClick={() => go('/profile')}>
                    {user.name || user.login}
                  </Nav.Link>
                  <Nav.Link
                    className="mis-nav-link mis-nav-link-logout"
                    onClick={() => void handleLogout()}
                  >
                    Выйти
                  </Nav.Link>
                </>
              ) : !IS_GUEST_MODE ? (
                <>
                  <Nav.Link className="mis-nav-link" onClick={() => go('/register')}>
                    Регистрация
                  </Nav.Link>
                  <Nav.Link className="mis-nav-link" onClick={() => go('/login')}>
                    Войти
                  </Nav.Link>
                </>
              ) : null}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}
