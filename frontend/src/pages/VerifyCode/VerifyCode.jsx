import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import * as authApi from '../../api/auth.js'

export function VerifyCodePage() {
  const { verify } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Инициализация
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState({ error: '', ok: '', busy: false, busyResend: false })

  // Вычисляемые свойства (валидация на лету)
  const isCodeValid = code.length === 6
  const canSubmit = email && isCodeValid && !status.busy

  // Обработчик подтверждения
  const handleVerify = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setStatus(prev => ({ ...prev, error: '', ok: '', busy: true }))
    try {
      await verify({ email, code })
      setStatus(prev => ({ ...prev, ok: 'Готово! Вы вошли.' }))
      navigate('/me', { replace: true })
    } catch (err) {
      setStatus(prev => ({ ...prev, error: err?.message || 'Ошибка подтверждения', busy: false }))
    }
  }

  // Обработчик повторной отправки
  const handleResend = async () => {
    if (!email || status.busyResend) return

    setStatus(prev => ({ ...prev, error: '', ok: '', busyResend: true }))
    try {
      // Передаем заглушку кода, если API того требует, или просто email
      await authApi.resendCode({ email, code: '000000' })
      setStatus(prev => ({ ...prev, ok: 'Новый код отправлен на email', busyResend: false }))
    } catch (err) {
      setStatus(prev => ({ ...prev, error: err?.message || 'Не удалось отправить код', busyResend: false }))
    }
  }

  return (
    <section className="auth-card verify-page">
      <h2>Подтверждение email</h2>

      {status.error && <div className="alert error">{status.error}</div>}
      {status.ok && <div className="alert ok">{status.ok}</div>}

      <form className="grid auth-form" onSubmit={handleVerify}>
        <label>
          Email
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            autoComplete="email" 
            required 
          />
        </label>

        <label>
          Код (6 цифр)
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            required
          />
        </label>

        <div className="auth-actions">
          <button className="btn primary" type="submit" disabled={!canSubmit}>
            {status.busy ? 'Проверяем…' : 'Подтвердить'}
          </button>
          
          <button
            type="button"
            className="btn btn-outline"
            disabled={status.busyResend || !email}
            onClick={handleResend}
          >
            {status.busyResend ? 'Отправляем…' : 'Отправить код ещё раз'}
          </button>

          <Link className="btn btn-link" to="/login">
            Вход
          </Link>
        </div>
      </form>
    </section>
  )
}