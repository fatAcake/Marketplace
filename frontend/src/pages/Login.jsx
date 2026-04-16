import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/me'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <section className="auth-card login-card">
      <h2 className="auth-title">Вход</h2>

      {error ? (
        <div className="alert error">
          {error}
        </div>
      ) : null}

      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault()
          setError('')
          setBusy(true)
          try {
            await login({ email, password })
            navigate(from, { replace: true })
          } catch (e) {
            setError(e?.message || 'Ошибка входа')
          } finally {
            setBusy(false)
          }
        }}
      >
        <div className="input-group">
          <label>Email</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            autoComplete="email" 
            required 
          />
        </div>

        <div className="input-group">
          <label>Пароль</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="auth-actions">
          <button className="btn-primary-glow" disabled={busy}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
          <Link className="btn-secondary-link" to="/register">
            Регистрация
          </Link>
        </div>
      </form>
    </section>
  )
}