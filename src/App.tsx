import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import AppErrorBoundary from './components/AppErrorBoundary'
import AuthBootstrap from './components/AuthBootstrap'
import AppNavbar from './components/Navbar'
import HomePage from './pages/HomePage'
import WorksListPage from './pages/WorksListPage'
import WorkDetailPage from './pages/WorkDetailPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import PublishingOrderPage from './pages/PublishingOrderPage'
import { IS_GUEST_MODE, IS_TAURI_PROFILE } from './config/env'

const AdminPage = lazy(() => import('./pages/AdminPage'))

const routeFallback = (
  <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '30vh' }}>
    <Spinner animation="border" />
  </div>
)

const routerBasename =
  import.meta.env.BASE_URL === './' || import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')

function AppRoutes() {
  const fallback = <Navigate to="/works" replace />

  return (
    <AppErrorBoundary>
      <AuthBootstrap>
        <AppNavbar />
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/works" element={<WorksListPage />} />
        <Route path="/works/:id" element={<WorkDetailPage />} />
        <Route
          path="/publishing-orders/:id"
          element={IS_GUEST_MODE ? fallback : <PublishingOrderPage />}
        />
        <Route path="/orders" element={IS_GUEST_MODE ? fallback : <OrdersPage />} />
        <Route path="/login" element={IS_GUEST_MODE ? fallback : <LoginPage />} />
        <Route path="/register" element={IS_GUEST_MODE ? fallback : <RegisterPage />} />
        <Route path="/profile" element={IS_GUEST_MODE ? fallback : <ProfilePage />} />
        <Route
          path="/admin"
          element={
            IS_GUEST_MODE ? (
              fallback
            ) : (
              <Suspense fallback={routeFallback}>
                <AdminPage />
              </Suspense>
            )
          }
        />
        <Route path="*" element={<Navigate to={IS_GUEST_MODE ? '/works' : '/'} replace />} />
        </Routes>
      </AuthBootstrap>
    </AppErrorBoundary>
  )
}

export default function App() {
  if (IS_TAURI_PROFILE) {
    return (
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    )
  }

  return (
    <BrowserRouter basename={routerBasename}>
      <AppRoutes />
    </BrowserRouter>
  )
}
