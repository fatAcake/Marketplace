import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function Layout() {
  const { user, token, logout, loading } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            BLISS
          </NavLink>
          <nav className="nav">
            <NavLink className="btn" to="/">
              Главная
            </NavLink>
            <NavLink className="btn" to="/me">
              Профиль
            </NavLink>
            {!token ? (
              <>
                <NavLink className="btn primary" to="/login">
                  Вход
                </NavLink>
                <NavLink className="btn" to="/register">
                  Регистрация
                </NavLink>
              </>
            ) : (
              <button
                className="btn"
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                disabled={loading}
              >
                Выйти
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="container page">
        {user ? (
          <div className="muted" style={{ marginBottom: 12 }}>
            Вошли как <span style={{ fontWeight: 700 }}>{user.nickname || user.email}</span>
          </div>
        ) : null}
        <Outlet />
      </main>
    </>
  )
}

