import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import * as productsApi from '../api/products.js'
import * as analyticsApi from '../api/analytics.js'
import { SimpleChart } from '../components/SimpleChart.jsx'
import { EditProductModal } from '../components/EditProductModal.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5035'
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export function ProductDetailPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const [descExpanded, setDescExpanded] = useState(false)
  const descMaxLen = 180

  const [priceHistory, setPriceHistory] = useState([])
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  async function loadProduct() {
    setLoading(true)
    setError('')
    try {
      const data = await productsApi.getProductById(id, token)
      setProduct(data)

      try {
        const imgs = await analyticsApi.getProductImages(id, token)
        setImages(Array.isArray(imgs) ? imgs : [])
        if (imgs?.length > 0) setSelectedImage(imgs[0].id)
      } catch {
        setImages([])
      }

      try {
        setChartLoading(true)
        const history = await analyticsApi.getPriceHistory(id, token)
        setPriceHistory(Array.isArray(history) ? history : [])
      } catch {
        setPriceHistory([])
      } finally {
        setChartLoading(false)
      }
    } catch (e) {
      setError(e?.message || 'Не удалось загрузить продукт')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!token) return
    setDeleting(true)
    try {
      await productsApi.deleteProduct(id, token)
      navigate('/me')
    } catch (e) {
      setError(e?.message || 'Не удалось удалить продукт')
    } finally {
      setDeleting(false)
    }
  }

  async function handleEditSuccess() {
    setEditModalOpen(false)
    loadProduct()
  }

  const isOwner = user?.id === (product?.userId ?? product?.UserId)

  const isDiscountActive = (() => {
    if (!product) return false
    const discountSize = product.discountSize ?? product.DiscountSize
    const discountedPrice = product.discountedPrice ?? product.DiscountedPrice
    return discountSize != null && discountSize !== 0 && discountedPrice != null
  })()

  const p = product ? {
    name: product.name ?? product.Name ?? '',
    price: product.price ?? product.Price ?? 0,
    quantity: product.quantity ?? product.Quantity ?? 0,
    description: product.description ?? product.Description ?? '',
    sellerNickName: product.sellerNickName ?? product.SellerNickName ?? '',
    discountSize: isDiscountActive ? (product.discountSize ?? product.DiscountSize) : null,
    discountedPrice: isDiscountActive ? (product.discountedPrice ?? product.DiscountedPrice) : null,
  } : {}

  const priceChartData = priceHistory.length > 0
    ? (() => {
        const points = []
        const sorted = [...priceHistory].sort(
          (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
        )
        let currentPrice = null

        sorted.forEach((h, i) => {
          const d = new Date(h.changedAt)
          const label = `${d.getDate()} ${months[d.getMonth()]}`

          if (i === 0 && h.oldPrice != null) {
            const oldD = new Date(h.changedAt)
            points.push({
              label: `${oldD.getDate()} ${months[oldD.getMonth()]}`,
              value: h.oldPrice,
            })
          }

          if (h.newPrice != null) {
            currentPrice = h.newPrice
          } else if (h.oldPrice != null && currentPrice == null) {
            currentPrice = h.oldPrice
          }

          if (currentPrice != null) {
            points.push({ label, value: currentPrice })
          }
        })

        return points.length > 0 ? points : null
      })()
    : null

  const discountChartData = priceHistory.length > 0
    ? (() => {
        const points = []
        const sorted = [...priceHistory].sort(
          (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
        )
        let currentDiscount = null

        sorted.forEach((h) => {
          if (h.newDiscount != null) {
            currentDiscount = h.newDiscount
          } else if (h.oldDiscount != null && currentDiscount == null) {
            currentDiscount = h.oldDiscount
          }

          if (currentDiscount != null) {
            const d = new Date(h.changedAt)
            points.push({
              label: `${d.getDate()} ${months[d.getMonth()]}`,
              value: currentDiscount,
            })
          }
        })

        return points.length > 0 ? points : null
      })()
    : null

  const descText = p.description || ''
  const isDescLong = descText.length > descMaxLen
  const displayDesc = isDescLong && !descExpanded
    ? descText.slice(0, descMaxLen) + '...'
    : descText

  if (loading) {
    return (
      <section className="product-detail-section">
        <p className="text-navy">Загрузка...</p>
      </section>
    )
  }

  if (error && !product) {
    return (
      <section className="product-detail-section">
        <div className="alert error">{error}</div>
        <Link className="btn btn-back-link" to="/me">← Назад в профиль</Link>
      </section>
    )
  }

  return (
    <section className="product-detail-section">
      <Link className="btn btn-back-link" to="/me">← Назад в профиль</Link>

      {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}

      <div className="product-detail-grid">
        <div className="product-detail-gallery">
          {selectedImage ? (
            <img
              className="product-detail-main-img"
              src={`${API_BASE}/api/products/${id}/images/${selectedImage}`}
              alt={p.name}
            />
          ) : (
            <div className="product-detail-placeholder">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span>Нет изображений</span>
            </div>
          )}

          {images.length > 1 && (
            <div className="product-detail-thumbs">
              {images.map((img) => (
                <button
                  key={img.id}
                  className={`product-detail-thumb ${selectedImage === img.id ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img.id)}
                >
                  <img src={`${API_BASE}/api/products/${id}/images/${img.id}`} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{p.name}</h1>

          <div className="product-detail-price">
            {p.discountedPrice != null ? (
              <>
                <span className="price-current">{p.discountedPrice} ₽</span>
                <span className="price-old">{p.price} ₽</span>
                <span className="price-discount-badge">−{p.discountSize}%</span>
              </>
            ) : (
              <span className="price-current">{p.price} ₽</span>
            )}
          </div>

          <div className="product-detail-meta">
            <div className="product-detail-meta-item">
              <span className="meta-label">В наличии</span>
              <span className="meta-value">{p.quantity} шт.</span>
            </div>
            <div className="product-detail-meta-item">
              <span className="meta-label">Продавец</span>
              <span className="meta-value">{p.sellerNickName || '—'}</span>
            </div>
          </div>

          {p.description && (
            <div className="product-detail-description">
              <h3>Описание</h3>
              <p className={isDescLong && !descExpanded ? 'desc-collapsed' : ''}>
                {displayDesc}
              </p>
              {isDescLong && (
                <button
                  className="btn-desc-toggle"
                  onClick={() => setDescExpanded((v) => !v)}
                >
                  {descExpanded ? 'Свернуть' : 'Развернуть'}
                </button>
              )}
            </div>
          )}

          {isOwner && (
            <div className="product-detail-actions">
              <button className="btn btn-edit" onClick={() => setEditModalOpen(true)}>
                ✏️ Изменить
              </button>
              <button className="btn btn-danger-outline" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Удаление...' : '🗑 Удалить'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="product-detail-charts">
        <h2 className="product-detail-charts-title">История цен и скидок</h2>

        {chartLoading ? (
          <p className="text-navy">Загрузка графиков...</p>
        ) : priceHistory.length === 0 ? (
          <p className="text-navy">История изменений пока отсутствует.</p>
        ) : (
          <>
            {priceChartData && priceChartData.length > 0 ? (
              <div className="product-detail-chart">
                <h4>Изменение цены</h4>
                <SimpleChart data={priceChartData} label="₽" />
              </div>
            ) : (
              <p className="text-navy">Нет данных об изменении цен.</p>
            )}

            {discountChartData && discountChartData.length > 0 ? (
              <div className="product-detail-chart">
                <h4>Изменение скидки</h4>
                <SimpleChart data={discountChartData} label="%" />
              </div>
            ) : (
              <p className="text-navy">Скидки пока не применялись.</p>
            )}
          </>
        )}
      </div>

      {editModalOpen && product && (
        <EditProductModal
          product={product}
          token={token}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </section>
  )
}
