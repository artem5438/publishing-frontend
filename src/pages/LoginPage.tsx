import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { fetchCartThunk } from '../store/orderSlice'
import { loginThunk } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authLoading = useAppSelector((state) => state.auth.loading)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await dispatch(loginThunk({ login, password }))
    if (loginThunk.rejected.match(result)) {
      setError(result.payload ?? 'Неверный логин или пароль')
      return
    }
    await dispatch(fetchCartThunk())
    navigate('/')
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Вход' }]} />

      <div className="login-page-wrapper">
        <div className="login-card">
          <h1 className="login-title">Вход в систему</h1>
          <p className="login-subtitle">Введите данные вашего аккаунта</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login">Логин</label>
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
                required
                autoComplete="username"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              className="btn-add-custom"
              disabled={authLoading}
              style={{ marginTop: '8px' }}
            >
              {authLoading ? 'Входим...' : 'Войти'}
            </button>
          </form>
          <p style={{ marginTop: 12, fontSize: 13 }}>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </>
  )
}