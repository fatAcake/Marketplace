import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Куда перенаправить пользователя после входа
  const from = location.state?.from?.pathname || '/me'

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange = (e) => {
    const { type, value } = e.target
    // Тип email или password совпадает с ключами в formData
    setFormData(prev => ({ ...prev, [type]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      await login(formData)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message || 'Неверный email или пароль')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="login-page-card">
      <h2>Вход</h2>

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      <form className="grid login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            autoComplete="email" 
            required 
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        <div className="login-actions">
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
          <Link className="btn btn-outline" to="/register">
            Регистрация
          </Link>
        </div>
      </form>
    </section>
  )
}