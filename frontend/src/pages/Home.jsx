import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { useCart } from '../cart/useCart.js'
import * as productsApi from '../api/products.js'
import '../styles/Home.css?v=1.1'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5035'

export function HomePage() {
  const { token, user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [token])

  async function loadProducts() {
    setLoading(true)
    setError('')
    try {
      const data = await productsApi.getProducts(token)
      const productsData = Array.isArray(data) ? data : []
      
      const productsWithImages = await Promise.all(
        productsData.map(async (product) => {
          try {
            const images = await productsApi.getProductImages(product.id, token)
            const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null
            return { ...product, imageId: firstImage?.id || null }
          } catch {
            return { ...product, imageId: null }
          }
        })
      )
      
      setProducts(productsWithImages)
      setFilteredProducts(productsWithImages)
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err)
      setError('Не удалось загрузить товары')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(product => {
        const name = getProductName(product).toLowerCase()
        const description = (product.description || product.Description || '').toLowerCase()
        const seller = getProductSeller(product).toLowerCase()
        return name.includes(query) || description.includes(query) || seller.includes(query)
      })
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  const handleAddToCart = useCallback((product) => {
    if (!token) {
      navigate('/login')
      return
    }
    
    const sellerId = product.userId ?? product.UserId
    if (user && sellerId != null && user.id === sellerId) return

    const productId = getProductId(product)
    const imageUrl = product.imageId 
      ? `${API_BASE}/api/products/${productId}/images/${product.imageId}`
      : null

    addToCart({
      id: productId,
      name: getProductName(product),
      price: getProductPrice(product),
      discountedPrice: product.discountedPrice ?? null,
      discountSize: product.discountSize ?? null,
      stock: getProductQuantity(product),
      userId: sellerId,
      imageUrl,
    })
    
    setAddedId(productId)
    setTimeout(() => setAddedId(null), 1200)
  }, [token, user, addToCart, navigate])

  const getProductName = (p) => p.name || p.Name || ''
  const getProductPrice = (p) => p.price || p.Price || 0
  const getProductQuantity = (p) => p.quantity || p.Quantity || 0
  const getProductSeller = (p) => p.sellerNickName || p.SellerNickName || ''
  const getProductId = (p) => p.id || p.Id

  if (loading) {
    return <div className="loading-container">Загрузка товаров...</div>
  }
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={loadProducts} className="btn-primary">Попробовать снова</button>
      </div>
    )
  }

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-top">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                <span className="logo-text">BLISS</span>
              </Link>
              
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Поиск товаров..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="header-actions">
                {!token ? (
                  <>
                    <Link to="/login" className="btn-outline">Войти</Link>
                    <Link to="/register" className="btn-primary">Регистрация</Link>
                  </>
                ) : (
                  <>
                    <Link to="/cart" className="cart-link">
                      Корзина 
                    </Link>
                    <Link to="/me" className="profile-link">
                      <span className="username">{user?.nickname || user?.name || 'Профиль'}</span>
                    </Link>
                    {/* {user?.status === 'Saller' && (
                      <Link to="/seller/products" className="btn-outline seller-btn">
                        Мои товары
                      </Link>
                    )} */}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="banner">
            <div className="banner-content">
              <h1>Добро пожаловать в BLISS</h1>
              <p>Покупайте и продавайте товары онлайн</p>
              <Link to="/products" className="btn-primary btn-large">Все товары</Link>
            </div>
          </section>

          {token && user?.status !== 'Saller' && (
            <section className="become-seller-card">
              <div className="seller-promo">
                <div className="promo-text">
                  <h3>Станьте продавцом</h3>
                  <p>Продавайте свои товары на нашей площадке и зарабатывайте</p>
                </div>
                <Link to="/become-seller" className="btn-primary">Начать продавать</Link>
              </div>
            </section>
          )}

          <section className="products-section">
            <div className="section-header">
              <h2>
                {searchQuery.trim() !== '' 
                  ? `Результаты поиска (${filteredProducts.length})` 
                  : 'Популярные товары'}
              </h2>
              <Link to="/products" className="view-all">Смотреть все</Link>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <p>{searchQuery.trim() !== '' ? 'Товары не найдены' : 'Товары пока не добавлены'}</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => {
                  const productId = getProductId(product)
                  const imageUrl = product.imageId 
                    ? `${API_BASE}/api/products/${productId}/images/${product.imageId}`
                    : null
                  
                  const qty = getProductQuantity(product)
                  const isOwner = user && product.userId != null && user.id === product.userId

                  return (
                    <div key={productId} className="product-card">
                      <Link to={`/products/${productId}`} className="product-image-link">
                        <div className="product-image">
                          {imageUrl ? (
                            <img 
                              src={imageUrl}
                              alt={getProductName(products)}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                const noImageDiv = e.target.parentElement?.querySelector('.no-image')
                                if (noImageDiv) noImageDiv.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className="no-image" style={{ display: !imageUrl ? 'flex' : 'none' }}>
                            <span className="no-image-text">Нет фото</span>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="product-info">
                        <Link to={`/product/${productId}`} className="product-name">
                          {getProductName(product)}
                        </Link>
                        <div className="product-price">
                          <span className="current-price">{getProductPrice(product)} ₽</span>
                        </div>
                        <span className="product-seller">{getProductSeller(product)}</span>
                        <span className={`stock ${qty > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {qty > 0 ? `В наличии: ${qty} шт.` : 'Нет в наличии'}
                        </span>
                      </div>

                      <button 
                        className="add-to-cart-btn" 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                        disabled={qty === 0 || addedId === productId || isOwner}
                      >
                        {isOwner 
                          ? 'Ваш товар' 
                          : qty === 0 
                          ? 'Нет в наличии' 
                          : addedId === productId 
                          ? '✓ Добавлено' 
                          : 'В корзину'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="features">
            <div className="feature-item"><h4>Быстрая доставка</h4><p>Доставляем по всей стране</p></div>
            <div className="feature-item"><h4>Безопасная сделка</h4><p>Гарантия возврата средств</p></div>
            <div className="feature-item"><h4>Поддержка 24/7</h4><p>Всегда на связи</p></div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section"><h4>BLISS</h4><p>Лучший маркетплейс для покупок и продаж</p></div>
            <div className="footer-section"><h4>Покупателям</h4><ul><li><Link to="/help">Как купить</Link></li><li><Link to="/returns">Возврат</Link></li><li><Link to="/questions">Вопросы и ответы</Link></li></ul></div>
            <div className="footer-section"><h4>Продавцам</h4><ul><li><Link to="/seller/guide">Как продавать</Link></li><li><Link to="/seller/rules">Правила</Link></li><li><Link to="/seller/support">Поддержка продавцов</Link></li></ul></div>
            <div className="footer-section"><h4>Контакты</h4><ul><li>support@bliss.ru</li><li>8 (800) 123-45-67</li></ul></div>
          </div>
          <div className="footer-bottom"><p>2025 BLISS. Все права защищены.</p></div>
        </div>
      </footer>
    </div>
  )
}