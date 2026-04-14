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
    <section className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2 style={{ margin: 0 }}>Вход</h2>

      {error ? (
        <div className="alert error" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}

      <form
        className="grid"
        style={{ marginTop: 14 }}
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
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
        </label>
        <label>
          Пароль
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <div className="row" style={{ marginTop: 6 }}>
          <button className="btn primary" disabled={busy}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
          <Link className="btn" to="/register">
            Регистрация
          </Link>
        </div>
      </form>
    </section>
  )
}

