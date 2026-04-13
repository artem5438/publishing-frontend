import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'

export default function LoginPage() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })
      .then((r) => {
        if (r.status === 401) throw new Error('Неверный логин или пароль')
        if (!r.ok) throw new Error('Ошибка сервера')
        return r.json()
      })
      .then(() => {
        navigate('/')
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
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
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}