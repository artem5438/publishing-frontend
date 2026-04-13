import { useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'

interface NavbarProps {
  cartCount?: number
}

export default function AppNavbar({ cartCount = 0 }: NavbarProps) {
  const navigate = useNavigate()
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
            {cartCount > 0 ? (
              <Button className="mis-nav-btn" onClick={() => navigate('/orders')}>
                🛒 Корзина <span className="cart-badge-custom">{cartCount}</span>
              </Button>
            ) : (
              <Button className="mis-nav-btn" style={{ opacity: 0.5 }} disabled>
                🛒 Корзина
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}