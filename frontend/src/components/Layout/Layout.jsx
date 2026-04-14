import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import s from './Layout.module.css';

export function Layout() {
  // Используем isAuthenticated вместо проверки токена напрямую
  const { isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={s.wrapper}>
      <header className={s.topbar}>
        <div className="container status-bar-inner">
          <NavLink to="/" className={s.brand}>
            Marketplace
          </NavLink>
          
          <nav className={s.nav}>
            <NavLink className="btn" to="/">Главная</NavLink>
            <NavLink className="btn" to="/me">Профиль</NavLink>

            {!isAuthenticated ? (
              <>
                <NavLink className="btn primary" to="/login">Вход</NavLink>
                <NavLink className="btn" to="/register">Регистрация</NavLink>
              </>
            ) : (
              <button 
                className="btn" 
                onClick={handleLogout} 
                disabled={loading}
              >
                {loading ? 'Выход...' : 'Выйти'}
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}