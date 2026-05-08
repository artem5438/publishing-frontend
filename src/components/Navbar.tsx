import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'

export default function AppNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(null)
  // Получаем корзину из API
  useEffect(() => {
    fetch('/api/publishing-orders/cart', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) {
          setUserLogin(null)
          setCartCount(0)
          setUserRole(null)
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setUserLogin(data.creator_login ?? 'Пользователь')
        setCartCount(data.works?.length ?? 0)
        setUserRole(data.user_role ?? null)
      })
      .catch(() => {
        setUserLogin(null)
        setCartCount(0)
        setUserRole(null)
      })
  }, [location.pathname])

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(() => {
        setUserLogin(null)
        setCartCount(0)
        setUserRole(null)
        navigate('/login')
      })
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid className="px-3">
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          МИС∞
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Button className="mis-nav-btn" onClick={() => navigate('/')}>
              🏠 Главная
            </Button>

            <Button
              className="mis-nav-btn"
              onClick={() => navigate('/orders')}
              disabled={!userLogin}
              style={{ opacity: cartCount > 0 ? 1 : 0.5 }}
            >
              🛒 Корзина {cartCount > 0 && <span className="cart-badge-custom">{cartCount}</span>}
            </Button>

            {userRole === 'moderator' && (
              <Button className="mis-nav-btn" onClick={() => navigate('/admin')}>
                Панель модератора
              </Button>
            )}

            {userLogin ? (
              <>
                <Button className="mis-nav-btn" onClick={() => navigate('/profile')}>
                  👤 {userLogin}
                </Button>
                <Button className="mis-nav-btn mis-nav-btn-logout" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <Button className="mis-nav-btn" onClick={() => navigate('/login')}>
                🔑 Войти
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}