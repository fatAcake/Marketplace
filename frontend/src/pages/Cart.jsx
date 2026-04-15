import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/useCart.js'
import { useAuth } from '../auth/useAuth.js'
import { apiFetch } from '../api/http.js'

export function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [ordering, setOrdering] = useState(false)
  const [error, setError] = useState(null)

  const handlePlaceOrder = useCallback(async () => {
    if (!token || items.length === 0) return

    setOrdering(true)
    setError(null)

    try {
      const orderItems = items.map((i) => ({
        productId: i.id,
        quantity: i.quantity,
      }))

      await apiFetch('/api/orders', {
        method: 'POST',
        token,
        body: { items: orderItems },
      })

      clearCart()
      navigate('/me')
    } catch (err) {
      setError(err.message || 'Не удалось оформить заказ')
    } finally {
      setOrdering(false)
    }
  }, [token, items, clearCart, navigate])

  if (!token) {
    return (
      <div className="cart-empty">
        <h2>Корзина</h2>
        <p className="muted">Войдите в аккаунт, чтобы увидеть корзину.</p>
        <Link to="/login" className="btn primary">Войти</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Корзина</h2>
        <p className="muted">Корзина пуста</p>
        <Link to="/" className="btn primary">К товарам</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h2>Корзина ({totalItems} шт.)</h2>

      {error && <div className="alert error">{error}</div>}

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="cart-item-placeholder">
                  <i className="bi bi-image" style={{ fontSize: 32, color: 'var(--gray-400)' }}></i>
                </div>
              )}
            </div>

            <div className="cart-item-info">
              <Link to={`/products/${item.id}`} className="cart-item-name">
                {item.name}
              </Link>
              <div className="cart-item-price">
                {item.discountedPrice != null ? (
                  <>
                    <span className="current">{item.discountedPrice} ₽</span>
                    <span className="old">{item.price} ₽</span>
                    <span className="discount-badge">−{item.discountSize}%</span>
                  </>
                ) : (
                  <span>{item.price} ₽</span>
                )}
              </div>
            </div>

            <div className="cart-item-controls">
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="qty-value">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.stock != null && item.quantity >= item.stock}
              >
                +
              </button>
            </div>

            <div className="cart-item-subtotal">
              {(item.discountedPrice ?? item.price) * item.quantity} ₽
            </div>

            <button
              className="cart-item-remove"
              onClick={() => removeFromCart(item.id)}
              title="Удалить"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Итого:</span>
          <span className="cart-total">{totalPrice} ₽</span>
        </div>
        <div className="cart-summary-actions">
          <button
            className="btn primary btn-lg"
            onClick={handlePlaceOrder}
            disabled={ordering}
          >
            {ordering ? 'Оформление...' : 'Оформить заказ'}
          </button>
          <button className="btn btn-danger-outline" onClick={clearCart}>
            Очистить корзину
          </button>
        </div>
      </div>
    </div>
  )
}
