import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import api from '../api/client'
import './ProductDetail.css'

export function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [discount, setDiscount] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const isOwner = user && product ? user.id === product.userId : false

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await fetchProductDetails()
        await Promise.allSettled([
          fetchProductImages(),
          fetchProductDiscount(),
          fetchPriceHistory()
        ])
      } catch (err) {
        console.error('Ошибка загрузки:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id])

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/Products/${id}`)
      setProduct(response.data)
      setError(null)
    } catch (err) {
      console.error('Ошибка загрузки товара:', err)
      setError('Не удалось загрузить информацию о товаре')
      throw err
    }
  }

  const fetchProductImages = async () => {
    try {
      const response = await api.get(`/Products/${id}/images`)
      const imagesMeta = response.data || []
      
      const imagesWithUrl = imagesMeta.map(img => ({
        ...img,
        url: `http://localhost:5035/api/Products/${id}/images/${img.id}`
      }))
      
      setImages(imagesWithUrl)
    } catch (err) {
      console.log('Изображения не загружены:', err.message)
      setImages([])
    }
  }

  const fetchProductDiscount = async () => {
    try {
      const response = await api.get(`/Discounts/products/${id}/discounts`)
      const activeDiscount = response.data?.find(d => {
        const now = new Date()
        const start = d.startDate ? new Date(d.startDate) : null
        const end = d.endDate ? new Date(d.endDate) : null
        return (!start || now >= start) && (!end || now <= end)
      })
      setDiscount(activeDiscount || null)
    } catch (err) {
      console.log('Скидки не загружены:', err.message)
      setDiscount(null)
    }
  }

  const fetchPriceHistory = async () => {
    try {
      const response = await api.get(`/Products/${id}/price-history`)
      setPriceHistory(response.data || [])
    } catch (err) {
      console.log('История цен не загружена:', err.message)
      setPriceHistory([])
    }
  }

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    
    try {
      await api.post('/Cart/add', {
        productId: parseInt(id),
        quantity: quantity
      })
      alert('Товар добавлен в корзину')
    } catch (err) {
      console.error('Ошибка добавления в корзину:', err)
      alert('Не удалось добавить товар в корзину')
    }
  }

  const handleDeleteProduct = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить товар?')) return
    
    try {
      await api.delete(`/Products/${id}`)
      alert('Товар удален')
      navigate('/')
    } catch (err) {
      console.error('Ошибка удаления товара:', err)
      alert('Не удалось удалить товар')
    }
  }

  const getDiscountedPrice = () => {
    if (!product) return 0
    if (!discount?.size) return product.price
    return product.price * (1 - discount.size / 100)
  }

  const isDiscountActive = () => {
    if (!discount) return false
    const now = new Date()
    const start = discount.startDate ? new Date(discount.startDate) : null
    const end = discount.endDate ? new Date(discount.endDate) : null
    return (!start || now >= start) && (!end || now <= end)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка товара...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>Товар не найден</h2>
        <p>{error || 'Возможно, товар был удален или никогда не существовал'}</p>
        <Link to="/" className="btn-primary">Вернуться на главную</Link>
      </div>
    )
  }

  const discountedPrice = getDiscountedPrice()
  const hasActiveDiscount = isDiscountActive()
  const savings = hasActiveDiscount ? product.price - discountedPrice : 0

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span className="separator">/</span>
          <Link to="/products">Товары</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-gallery">
            <div className="main-image">
              {images.length > 0 && images[activeImage] ? (
                <img 
                  src={images[activeImage]?.url}
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const noImageDiv = e.target.parentElement?.querySelector('.no-image')
                    if (noImageDiv) noImageDiv.style.display = 'flex'
                  }}
                />
              ) : null}
              
              <div 
                className="no-image" 
                style={{ display: images.length === 0 || !images[activeImage] ? 'flex' : 'none' }}
              >
                <span className="no-image-text">Нет фотографии</span>
              </div>
              
              {hasActiveDiscount && (
                <span className="discount-badge-large">-{discount.size}%</span>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, index) => (
                  <button
                    key={img.id || index}
                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img 
                      src={img.url}
                      alt={`${product.name} - ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="seller-info">
              <div className="seller-details">
                <Link to={`/seller/${product.userId}`} className="seller-name">
                  {product.sellerNickName || 'Продавец'}
                </Link>
              </div>
            </div>

            <div className="price-block">
              {hasActiveDiscount ? (
                <>
                  <div className="current-price-block">
                    <span className="current-price">{discountedPrice.toFixed(0)} ₽</span>
                    <span className="discount-tag">-{discount.size}%</span>
                  </div>
                  <div className="old-price-block">
                    <span className="old-price">{product.price.toFixed(0)} ₽</span>
                    <span className="savings">Экономия {savings.toFixed(0)} ₽</span>
                  </div>
                  {discount.endDate && (
                    <div className="discount-timer">
                      Акция до {new Date(discount.endDate).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </>
              ) : (
                <div className="current-price-block">
                  <span className="current-price">{product.price.toFixed(0)} ₽</span>
                </div>
              )}
            </div>

            <div className="stock-info">
              <span className={`stock-status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.quantity > 0 ? `В наличии: ${product.quantity} шт.` : 'Нет в наличии'}
              </span>
            </div>

            {product.quantity > 0 && (
              <div className="purchase-block">
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  className="btn-primary btn-large add-to-cart-btn"
                  onClick={handleAddToCart}
                >
                  Добавить в корзину
                </button>
              </div>
            )}

            {isOwner && (
              <div className="owner-actions">
                <Link to={`/seller/products/${id}/edit`} className="btn-outline">
                  Редактировать
                </Link>
                <button onClick={handleDeleteProduct} className="btn-outline danger">
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="product-tabs">
          <div className="tab-headers">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Описание
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              История цен
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                <h3>Описание товара</h3>
                <p>{product.description || 'Описание отсутствует'}</p>
                
                <div className="product-specs">
                  <div className="spec-item">
                    <span className="spec-label">Количество:</span>
                    <span className="spec-value">{product.quantity} шт.</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Продавец:</span>
                    <span className="spec-value">{product.sellerNickName || 'Не указан'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">ID товара:</span>
                    <span className="spec-value">{product.id}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="history-tab">
                <h3>История изменения цен</h3>
                {priceHistory.length > 0 ? (
                  <div className="history-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Дата</th>
                          <th>Старая цена</th>
                          <th>Новая цена</th>
                          <th>Старая скидка</th>
                          <th>Новая скидка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceHistory.map(record => {
                          const oldPrice = record.old_price != null ? Number(record.old_price).toFixed(0) : '0'
                          const newPrice = record.new_price != null ? Number(record.new_price).toFixed(0) : '0'
                          const oldDiscount = record.old_discount != null ? Number(record.old_discount).toFixed(0) : '0'
                          const newDiscount = record.new_discount != null ? Number(record.new_discount).toFixed(0) : '0'
                          const changedAt = record.changed_at || record.changedAt
                          
                          return (
                            <tr key={record.id}>
                              <td>{formatDate(changedAt)}</td>
                              <td>{oldPrice} ₽</td>
                              <td>{newPrice} ₽</td>
                              <td>{oldDiscount}%</td>
                              <td>{newDiscount}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">История изменений отсутствует</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}