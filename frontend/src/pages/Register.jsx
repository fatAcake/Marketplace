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
    <section className="auth-card register-card">
      <h2 className="auth-title">Регистрация</h2>

      {error ? (
        <div className="alert error">
          {error}
        </div>
      ) : null}
      
      {ok ? (
        <div className="alert ok">
          {ok}
        </div>
      ) : null}

      <form
        className="auth-form"
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
        <div className="form-row">
          <div className="input-group">
            <label>Никнейм</label>
            <input 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              autoComplete="nickname" 
            />
          </div>
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
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Пароль</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="input-group">
            <label>Подтверждение</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {passwordMismatch ? (
          <div className="alert error">
            Пароли не совпадают
          </div>
        ) : null}

        <div className="auth-actions">
          <button className="btn-primary-glow" disabled={busy}>
            {busy ? 'Регистрируем…' : 'Зарегистрироваться'}
          </button>
          <Link className="btn-secondary-link" to="/login">
            Уже есть аккаунт
          </Link>
        </div>
      </form>
    </section>
  )
}