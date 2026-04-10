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
            Marketplace
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


      <Outlet />
    </>
  )
}

