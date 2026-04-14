import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../../api/auth.js'
import { validateRegistration } from '../../utils/validators'

export function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [status, setStatus] = useState({ error: '', ok: '', busy: false })

  // Обработчик изменения любого поля
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ error: '', ok: '', busy: true })

    const validationError = validateRegistration(formData)
    if (validationError) {
      setStatus({ error: validationError, ok: '', busy: false })
      return
    }

    try {
      await authApi.register(formData)
      setStatus({ 
        error: '', 
        ok: 'Код подтверждения отправлен на email. Перенаправление...', 
        busy: false 
      })
      
      // Небольшая задержка, чтобы пользователь успел прочитать сообщение
      setTimeout(() => {
        navigate('/verify', { state: { email: formData.email } })
      }, 1500)
      
    } catch (err) {
      setStatus({ 
        error: err?.message || 'Ошибка регистрации', 
        ok: '', 
        busy: false 
      })
    }
  }

  // Проверка несовпадения паролей для UI-подсказки
  const showPasswordError = formData.password && 
                           formData.confirmPassword && 
                           formData.password !== formData.confirmPassword

  return (
    <section className="auth-card">
      <h2>Регистрация</h2>

      {status.error && <div className="alert error">{status.error}</div>}
      {status.ok && <div className="alert ok">{status.ok}</div>}

      <form className="grid auth-form" onSubmit={handleSubmit}>
        <div className="grid two">
          <label>
            Никнейм
            <input 
              name="nickname"
              value={formData.nickname} 
              onChange={handleChange} 
              autoComplete="nickname" 
              required
            />
          </label>
          <label>
            Email
            <input 
              name="email"
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              autoComplete="email" 
              required 
            />
          </label>
        </div>

        <div className="grid two">
          <label>
            Пароль
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            Подтверждение
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        {showPasswordError && (
          <div className="alert error-inline">Пароли не совпадают</div>
        )}

        <div className="auth-actions">
          <button className="btn primary" type="submit" disabled={status.busy}>
            {status.busy ? 'Регистрируем…' : 'Зарегистрироваться'}
          </button>
          <Link className="btn btn-outline" to="/login">
            Уже есть аккаунт
          </Link>
        </div>
      </form>
    </section>
  )
}