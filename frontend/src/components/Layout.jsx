import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { useCart } from '../cart/useCart.js'

export function Layout() {
  const { user, token, logout, loading } = useAuth()
  const { totalItems } = useCart()
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
              <>
                <NavLink className="btn" to="/cart" style={{ position: 'relative' }}>
                  Корзина
                  {totalItems > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-12px',
                        background: 'var(--color-danger, #e53e3e)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {totalItems}
                    </span>
                  )}
                </NavLink>
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
              </>
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

