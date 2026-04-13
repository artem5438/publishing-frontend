import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import AppNavbar from './components/Navbar'
import WorksListPage from './pages/WorksListPage'
import WorkDetailPage from './pages/WorkDetailPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<WorksListPage />} />
        <Route path="/works/:id" element={<WorkDetailPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}