import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as analyticsApi from '../api/analytics.js'
import { useCart } from '../cart/useCart.js'
import { useAuth } from '../auth/useAuth.js'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5035'

/**
 * Нормализует продукт — разные API возвращают разные поля.
 */
function normalize(p) {
  return {
    id: p.id ?? p.Id ?? p.productId ?? p.ProductId,
    name: p.name ?? p.Name ?? '',
    price: p.price ?? p.Price ?? 0,
    quantity: p.quantity ?? p.Quantity ?? 0,
    description: p.description ?? p.Description ?? '',
    userId: p.userId ?? p.UserId ?? p.sellerUserId ?? p.SellerUserId,
    sellerNickName: p.sellerNickName ?? p.SellerNickName ?? p.nickName ?? p.NickName ?? '',
    discountSize: p.discountSize ?? p.DiscountSize ?? null,
    discountedPrice: p.discountedPrice ?? p.DiscountedPrice ?? null,
  }
}

/**
 * Карточка продукта с превью изображения.
 */
export function ProductCard({ product: rawProduct, token }) {
  const product = normalize(rawProduct)
  const [imageUrl, setImageUrl] = useState(null)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const { addToCart } = useCart()
  const { token: authToken, user } = useAuth()
  const navigate = useNavigate()

  const isOwnProduct = user && product.userId != null && user.id === product.userId

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!authToken) {
        navigate('/login')
        return
      }
      if (isOwnProduct) return
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice,
        discountSize: product.discountSize,
        stock: product.quantity,
        userId: product.userId,
        imageUrl,
      })
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 1200)
    },
    [authToken, addToCart, product, imageUrl, navigate, isOwnProduct]
  )

  useEffect(() => {
    async function fetchImage() {
      try {
        const images = await analyticsApi.getProductImages(product.id, token)
        if (Array.isArray(images) && images.length > 0) {
          const first = images[0]
          setImageUrl(`${API_BASE}/api/products/${product.id}/images/${first.id}`)
        }
      } catch {
      }
    }
    fetchImage()
  }, [product.id, token])

  const isDiscountActive = (() => {
    const discountSize = product.discountSize
    const discountedPrice = product.discountedPrice
    return discountSize != null && discountSize !== 0 && discountedPrice != null
  })()

  const displayDiscountedPrice = isDiscountActive ? product.discountedPrice : null
  const displayDiscountSize = isDiscountActive ? product.discountSize : null

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image-link">
        {imageUrl ? (
          <img className="product-card-img" src={imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">
            <i className="bi bi-image" style={{ fontSize: 48, color: 'var(--gray-400)' }}></i>
          </div>
        )}
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product.id}`} className="product-card-title">
          {product.name}
        </Link>
        <div className="product-card-price">
          {displayDiscountedPrice != null ? (
            <>
              <span className="pc-price-current">{displayDiscountedPrice} ₽</span>
              <span className="pc-price-old">{product.price} ₽</span>
              <span className="pc-discount-badge">−{displayDiscountSize}%</span>
            </>
          ) : (
            <span>{product.price} ₽</span>
          )}
        </div>
        <div className="product-card-qty">
          В наличии: {product.quantity} шт.
        </div>
        <button
          className="product-card-add-btn"
          onClick={handleAddToCart}
          disabled={product.quantity === 0 || addedFeedback || isOwnProduct}
          style={{
            marginTop: 8,
            padding: '6px 0',
            width: '100%',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            cursor: (product.quantity === 0 || isOwnProduct) ? 'not-allowed' : 'pointer',
            background: addedFeedback
              ? 'var(--color-success, #38a169)'
              : isOwnProduct
              ? '#888'
              : 'var(--color-primary, #3182ce)',
            color: '#fff',
            transition: 'background 0.2s',
          }}
        >
          {isOwnProduct
            ? 'Ваш товар'
            : product.quantity === 0
            ? 'Нет в наличии'
            : addedFeedback
            ? '✓ Добавлено'
            : 'В корзину'}
        </button>
      </div>
    </div>
  )
}
