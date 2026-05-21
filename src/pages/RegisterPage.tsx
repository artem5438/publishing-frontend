import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { registerThunk } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authLoading = useAppSelector((state) => state.auth.loading)

  const [login, setLogin] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'creator' | 'moderator'>('creator')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = await dispatch(registerThunk({ login, password, name, role }))
    if (registerThunk.rejected.match(result)) {
      setError(result.payload ?? 'Не удалось зарегистрироваться')
      return
    }

    setSuccess('Регистрация выполнена, теперь войдите в систему.')
    setTimeout(() => navigate('/login'), 900)
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Регистрация' }]} />

      <div className="login-page-wrapper">
        <div className="login-card">
          <h1 className="login-title">Регистрация</h1>
          <p className="login-subtitle">Создайте аккаунт пользователя или модератора</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="register-login">Логин</label>
              <input
                id="register-login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="register-name">Имя</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="register-password">Пароль</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="register-role">Роль</label>
              <select
                id="register-role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'creator' | 'moderator')}
                className="profile-select"
              >
                <option value="creator">Пользователь</option>
                <option value="moderator">Модератор</option>
              </select>
            </div>

            {error && <div className="login-error">{error}</div>}
            {success && <div style={{ color: '#166534', fontSize: 13 }}>{success}</div>}

            <button type="submit" className="btn-add-custom" disabled={authLoading}>
              {authLoading ? 'Создаём...' : 'Создать аккаунт'}
            </button>
          </form>

          <p style={{ marginTop: 12, fontSize: 13 }}>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </>
  )
}
