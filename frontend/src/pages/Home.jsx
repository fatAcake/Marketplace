import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function HomePage() {
  const { token } = useAuth()

  return (
    <section className="card">
      <h2 style={{ margin: 0 }}>Главная</h2>
      <div className="row" style={{ marginTop: 12 }}>
        {!token ? (
          <>
            <Link className="btn primary" to="/login">
              Войти
            </Link>
            <Link className="btn" to="/register">
              Регистрация
            </Link>
          </>
        ) : (
          <Link className="btn primary" to="/me">
            Профиль
          </Link>
        )}
      </div>
    </section>
  )
}

