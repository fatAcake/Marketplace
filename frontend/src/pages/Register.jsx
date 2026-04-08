import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth.js'

export function RegisterPage() {
  const navigate = useNavigate()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  const passwordMismatch = useMemo(() => {
    if (!password || !confirmPassword) return false
    return password !== confirmPassword
  }, [password, confirmPassword])

  return (
    <section className="card" style={{ maxWidth: 620, margin: '0 auto' }}>
      <h2 style={{ margin: 0 }}>Регистрация</h2>

      {error ? (
        <div className="alert error" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="alert ok" style={{ marginTop: 12 }}>
          {ok}
        </div>
      ) : null}

      <form
        className="grid"
        style={{ marginTop: 14 }}
        onSubmit={async (e) => {
          e.preventDefault()
          setError('')
          setOk('')
          setBusy(true)
          try {
            if (password.length < 5) throw new Error('Пароль должен быть минимум 5 символов')
            if (password !== confirmPassword) throw new Error('Пароли не совпадают')

            await authApi.register({ email, password, confirmPassword, nickname })
            setOk('Код подтверждения отправлен на email. Введите его на следующем шаге.')
            navigate('/verify', { state: { email } })
          } catch (e) {
            setError(e?.message || 'Ошибка регистрации')
          } finally {
            setBusy(false)
          }
        }}
      >
        <div className="grid two">
          <label>
            Никнейм
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} autoComplete="nickname" />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
          </label>
        </div>
        <div className="grid two">
          <label>
            Пароль
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            Подтверждение пароля
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        {passwordMismatch ? (
          <div className="alert error" style={{ marginTop: 6 }}>
            Пароли не совпадают
          </div>
        ) : null}

        <div className="row" style={{ marginTop: 6 }}>
          <button className="btn primary" disabled={busy}>
            {busy ? 'Регистрируем…' : 'Зарегистрироваться'}
          </button>
          <Link className="btn" to="/login">
            Уже есть аккаунт
          </Link>
        </div>
      </form>
    </section>
  )
}

