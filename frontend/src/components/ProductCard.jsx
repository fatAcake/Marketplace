import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as analyticsApi from '../api/analytics.js'

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
    discountSize: p.discountSize ?? p.DiscountSize,
    discountedPrice: p.discountedPrice ?? p.DiscountedPrice,
  }
}

/**
 * Карточка продукта с превью изображения и выпадающим меню (⋮).
 */
export function ProductCard({ product: rawProduct, token, onDelete }) {
  const product = normalize(rawProduct)
  const [menuOpen, setMenuOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    async function fetchImage() {
      try {
        const images = await analyticsApi.getProductImages(product.id, token)
        if (Array.isArray(images) && images.length > 0) {
          const first = images[0]
          setImageUrl(`${API_BASE}/api/products/${product.id}/images/${first.id}`)
        }
      } catch {
        // нет изображений — placeholder
      }
    }
    fetchImage()
  }, [product.id, token])

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div className="product-card">
      {/* Изображение / placeholder */}
      <Link to={`/products/${product.id}`} className="product-card-image-link">
        {imageUrl ? (
          <img className="product-card-img" src={imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">
            <i className="bi bi-image" style={{ fontSize: 48, color: 'var(--blue-gray)' }}></i>
          </div>
        )}
      </Link>

      {/* Инфо */}
      <div className="product-card-body">
        <Link to={`/products/${product.id}`} className="product-card-title">
          {product.name}
        </Link>
        <div className="product-card-price">
          {product.discountedPrice != null ? (
            <>
              <span className="pc-price-current">{product.discountedPrice} ₽</span>
              <span className="pc-price-old">{product.price} ₽</span>
              <span className="pc-discount-badge">−{product.discountSize}%</span>
            </>
          ) : (
            <span>{product.price} ₽</span>
          )}
        </div>
        <div className="product-card-qty">
          В наличии: {product.quantity} шт.
        </div>

        {/* Меню действий */}
        <div className="product-card-menu" ref={menuRef}>
          <button className="product-card-menu-btn" onClick={() => setMenuOpen((v) => !v)}>
            <i className="bi bi-three-dots"></i>
          </button>
          {menuOpen && (
            <div className="product-card-menu-dropdown">
              <Link
                to={`/products/${product.id}`}
                className="product-card-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-eye me-1"></i>Подробнее
              </Link>
              <button
                className="product-card-menu-item product-card-menu-item--danger"
                onClick={() => { onDelete(product.id); setMenuOpen(false) }}
              >
                <i className="bi bi-trash me-1"></i>Удалить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
