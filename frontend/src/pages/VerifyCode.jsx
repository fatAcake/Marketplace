import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import * as authApi from '../api/auth.js'

export function VerifyCodePage() {
  const { verify } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initialEmail = location.state?.email || ''
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)
  const [busyResend, setBusyResend] = useState(false)

  const canSubmit = useMemo(() => {
    return Boolean(email) && code.trim().length === 6
  }, [email, code])

  return (
    <section className="auth-card verify-card">
      <h2 className="auth-title">Подтверждение email</h2>

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
            await verify({ email, code })
            setOk('Готово! Вы вошли.')
            navigate('/me', { replace: true })
          } catch (e) {
            setError(e?.message || 'Ошибка подтверждения')
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
          <label>Код (6 цифр)</label>
          <input
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            required
          />
        </div>

        <div className="auth-actions">
          <button className="btn-primary-glow" disabled={busy || !canSubmit}>
            {busy ? 'Проверяем…' : 'Подтвердить'}
          </button>
          
          <button
            type="button"
            className="btn-action-outline"
            disabled={busyResend || !email}
            onClick={async () => {
              setError('')
              setOk('')
              setBusyResend(true)
              try {
                await authApi.resendCode({ email, code: '000000' })
                setOk('Новый код отправлен на email')
              } catch (e) {
                setError(e?.message || 'Не удалось отправить код')
              } finally {
                setBusyResend(false)
              }
            }}
          >
            {busyResend ? 'Отправляем…' : 'Отправить код ещё раз'}
          </button>

          <Link className="btn-secondary-link" to="/login">
            Вернуться ко входу
          </Link>
        </div>
      </form>
    </section>
  )
}