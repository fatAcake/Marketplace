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
    <section className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
      <h2 style={{ margin: 0 }}>Подтверждение email</h2>

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
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
        </label>
        <label>
          Код (6 цифр)
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            required
          />
        </label>
        <div className="row" style={{ marginTop: 6 }}>
          <button className="btn primary" disabled={busy || !canSubmit}>
            {busy ? 'Проверяем…' : 'Подтвердить'}
          </button>
          <button
            type="button"
            className="btn"
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
          <Link className="btn" to="/login">
            Вход
          </Link>
        </div>
      </form>
    </section>
  )
}

