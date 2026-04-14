import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import * as authApi from '../api/auth.js'

export function MePage() {
  const { token, user, setUser, refresh, logout, loading } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login', { replace: true, state: { from: location } })
    }
  }, [token, loading, navigate, location])

  return (
    <section className="card">
      <h2 style={{ margin: 0 }}>Профиль</h2>

      {error ? (
        <div className="alert error" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}

      <div className="grid two" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="muted">Текущий пользователь</div>
          <div style={{ marginTop: 10 }}>
            <div>
              <span className="muted">email:</span> <span style={{ fontWeight: 700 }}>{user?.email || '—'}</span>
            </div>
            <div>
              <span className="muted">nickname:</span> <span style={{ fontWeight: 700 }}>{user?.nickname || '—'}</span>
            </div>
            <div>
              <span className="muted">status:</span> <span style={{ fontWeight: 700 }}>{user?.status || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button
          className="btn primary"
          disabled={!token || busy}
          onClick={async () => {
            setError('')
            setBusy(true)
            try {
              const me = await authApi.me(token)
              setUser(me)
            } catch (e) {
              setError(e?.message || 'Не удалось загрузить профиль')
            } finally {
              setBusy(false)
            }
          }}
        >
          Обновить
        </button>

  

        <button
          className="btn"
          disabled={busy}
          onClick={async () => {
            setError('')
            setBusy(true)
            try {
              await logout()
              navigate('/login', { replace: true })
            } catch (e) {
              setError(e?.message || 'Не удалось выйти')
            } finally {
              setBusy(false)
            }
          }}
        >
          Выйти
        </button>

        <Link className="btn" to="/verify">
          Ввести код
        </Link>
      </div>
    </section>
  )
}

