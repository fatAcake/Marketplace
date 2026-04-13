import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import * as authApi from '../api/auth.js'
import * as productsApi from '../api/products.js'
import * as ordersApi from '../api/orders.js'
import { ProductCard } from '../components/ProductCard.jsx'
import { OrderCard } from '../components/OrderCard.jsx'
import { StatsModal } from '../components/StatsModal.jsx'

export function MePage() {
  const { token, user, setUser, logout, loading } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const userStatus = user?.status ?? user?.Status ?? ''
  const isSeller = userStatus.toLowerCase() === 'saller' || userStatus.toLowerCase() === 'seller'

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login', { replace: true, state: { from: location } })
    }
  }, [token, loading, navigate, location])

  useEffect(() => {
    if (!loading && token && user?.id) {
      if (isSeller) {
        loadProducts()
      } else {
        loadOrders()
      }
    }
  }, [token, user?.id, isSeller, loading])

  async function loadProducts() {
    if (!token || !user?.id) return
    setProductsLoading(true)
    setError('')
    try {
      const data = await productsApi.getProductsByUserId(user.id, token)
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Не удалось загрузить продукты')
    } finally {
      setProductsLoading(false)
    }
  }

  async function loadOrders() {
    if (!token) return
    setOrdersLoading(true)
    setError('')
    try {
      const data = await ordersApi.getMyOrders(token)
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Не удалось загрузить заказы')
    } finally {
      setOrdersLoading(false)
    }
  }

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => {
    const price = p.price ?? p.Price ?? 0
    const qty = p.quantity ?? p.Quantity ?? 0
    return sum + price * qty
  }, 0)
  const avgPrice = totalProducts > 0
    ? products.reduce((sum, p) => sum + (p.price ?? p.Price ?? 0), 0) / totalProducts
    : 0

  const totalOrders = orders.length
  const totalOrdersValue = orders.reduce((sum, o) => {
    const items = o.items ?? o.Items ?? o.orderItems ?? []
    const orderSum = items.reduce((s, item) => {
      const price = item.price ?? item.Price ?? 0
      const qty = item.quantity ?? item.Quantity ?? 1
      return s + price * qty
    }, 0)
    return sum + orderSum
  }, 0)

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {(user?.nickname || user?.email || '?').charAt(0).toUpperCase()}
        </div>
        <div className="profile-header-info">
          <h1 className="profile-name">{user?.nickname || user?.email || 'Пользователь'}</h1>
          <p className="profile-email">{user?.email}</p>
          <span className={`profile-badge badge-${userStatus.toLowerCase()}`}>
            {userStatus || 'Пользователь'}
          </span>
        </div>
        <div className="profile-header-actions">
          <button
            className="btn btn-outline"
            disabled={busy}
            onClick={async () => {
              setError('')
              setBusy(true)
              try {
                const me = await authApi.me(token)
                setUser(me)
              } catch (e) {
                setError(e?.message || 'Не удалось обновить профиль')
              } finally {
                setBusy(false)
              }
            }}
          >
            ↻ Обновить
          </button>
          <button
            className="btn btn-danger-outline"
            disabled={busy}
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {isSeller ? (
        <div className="profile-stats-row">
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="bi bi-box-seam"></i></div>
            <div className="profile-stat-value">{totalProducts}</div>
            <div className="profile-stat-label">Товаров</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="bi bi-cash-stack"></i></div>
            <div className="profile-stat-value">{Math.round(totalValue).toLocaleString('ru-RU')} ₽</div>
            <div className="profile-stat-label">Общая стоимость</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="bi bi-graph-up-arrow"></i></div>
            <div className="profile-stat-value">{Math.round(avgPrice).toLocaleString('ru-RU')} ₽</div>
            <div className="profile-stat-label">Средняя цена</div>
          </div>
          <button
            className="profile-stat-card profile-stat-card--clickable"
            onClick={() => setStatsOpen(true)}
          >
            <div className="profile-stat-icon"><i className="bi bi-bar-chart-line"></i></div>
            <div className="profile-stat-value" style={{ fontSize: 18 }}>Статистика</div>
            <div className="profile-stat-label">Продажи и цены</div>
          </button>
        </div>
      ) : (
        <div className="profile-stats-row">
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="bi bi-bag-check"></i></div>
            <div className="profile-stat-value">{totalOrders}</div>
            <div className="profile-stat-label">Заказов</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon"><i className="bi bi-cash-stack"></i></div>
            <div className="profile-stat-value">{Math.round(totalOrdersValue).toLocaleString('ru-RU')} ₽</div>
            <div className="profile-stat-label">Общая сумма</div>
          </div>
        </div>
      )}

      {isSeller && (
        <div className="products-section">
          <div className="products-header">
            <h2>Мои товары</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link className="btn btn-sm btn-primary-navy" to="/products/create">
                + Добавить
              </Link>
              <button
                className="btn btn-sm btn-outline"
                onClick={loadProducts}
                disabled={productsLoading}
              >
                {productsLoading ? 'Загрузка...' : '↻ Обновить'}
              </button>
            </div>
          </div>

          {productsLoading && products.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon"><i className="bi bi-hourglass-split"></i></div>
              <p>Загрузка товаров...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon"><i className="bi bi-inbox"></i></div>
              <p>У вас пока нет товаров.</p>
              <Link className="btn btn-primary-navy" to="/products/create">
                <i className="bi bi-plus-lg me-1"></i>Добавить товар
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id ?? product.Id ?? product.productId}
                  product={product}
                  token={token}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!isSeller && (
        <div className="products-section">
          <div className="products-header">
            <h2>Мои заказы</h2>
            <button
              className="btn btn-sm btn-outline"
              onClick={loadOrders}
              disabled={ordersLoading}
            >
              {ordersLoading ? 'Загрузка...' : '↻ Обновить'}
            </button>
          </div>

          {ordersLoading && orders.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon"><i className="bi bi-hourglass-split"></i></div>
              <p>Загрузка заказов...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon"><i className="bi bi-bag-x"></i></div>
              <p>У вас пока нет заказов.</p>
              <Link className="btn btn-primary-navy" to="/products">
                <i className="bi bi-search me-1"></i>Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <OrderCard key={order.id ?? order.Id ?? order.orderId} order={order} />
              ))}
            </div>
          )}
        </div>
      )}

      {statsOpen && <StatsModal onClose={() => setStatsOpen(false)} />}
    </section>
  )
}
