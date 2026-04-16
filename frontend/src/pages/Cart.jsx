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
      <div className="cart-empty-state">
        <div className="empty-icon"><i class="bi bi-lock"></i></div>
        <h2>Корзина</h2>
        <p>Войдите в аккаунт, чтобы увидеть свои товары</p>
        <Link to="/login" className="btn-primary-glow">Войти</Link>
      </div>
    )
  }

if (items.length === 0) {
    return (
      <div className="cart-empty-state">
        <div className="empty-icon"><i class="bi bi-cart-dash"></i></div>
        <h2>Корзина пуста</h2>
        <p>Кажется, пришло время для покупок</p>
        <Link to="/" className="btn-primary-glow">К товарам</Link>
      </div>
    )
  }
return (
    <div className="cart-container">
      <h2 className="cart-title">Корзина ({totalItems})</h2>

      {error && <div className="alert error">{error}</div>}

      <div className="cart-layout">
        <div className="cart-items-list">
          {items.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-preview">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="cart-item-placeholder">🖼️</div>
                )}
              </div>

              <div className="cart-item-main">
                <Link to={`/products/${item.id}`} className="cart-item-link">
                  {item.name}
                </Link>
                <div className="cart-item-price-tag">
                  {item.discountedPrice != null ? (
                    <>
                      <span className="price-now">{item.discountedPrice} ₽</span>
                      <span className="price-old">{item.price} ₽</span>
                    </>
                  ) : (
                    <span className="price-now">{item.price} ₽</span>
                  )}
                </div>
              </div>

              <div className="cart-item-management">
                <div className="qty-controls">
                  <button 
                    className="qty-action" 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button 
                    className="qty-action" 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.stock != null && item.quantity >= item.stock}
                  >+</button>
                </div>
                <div className="item-subtotal">
                  {(item.discountedPrice ?? item.price) * item.quantity} ₽
                </div>
              </div>

              <button className="item-delete" onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))}
        </div>

        <aside className="cart-checkout-panel">
          <div className="summary-details">
            <div className="summary-line">
              <span>Товары ({totalItems})</span>
              <span>{totalPrice} ₽</span>
            </div>
            <div className="summary-line total">
              <span>Итого</span>
              <span className="total-amount">{totalPrice} ₽</span>
            </div>
          </div>
          <div className="summary-actions">
            <button 
              className="btn-primary-glow btn-full" 
              onClick={handlePlaceOrder} 
              disabled={ordering}
            >
              {ordering ? 'Оформление...' : 'Оформить заказ'}
            </button>
            <button className="btn-text-danger" onClick={clearCart}>
              Очистить всё
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}