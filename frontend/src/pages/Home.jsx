import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import api from '../api/client'
import './Home.css'

export function HomePage() {
  const { token, user } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await api.get('/Products')
        const productsData = response.data.slice(0, 8)
        
        const productsWithImages = await Promise.all(
          productsData.map(async (product) => {
            try {
              const imagesRes = await api.get(`/Products/${product.id}/images`)
              const firstImage = imagesRes.data?.[0]
              return {
                ...product,
                imageUrl: firstImage 
                ? `http://localhost:5035/api/Products/${product.id}/images`
                : null
              }
            } catch {
              return { ...product, imageUrl: null }
            }
          })
        )
        
        setProducts(productsWithImages)
        setError(null)
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err)
        setError('Не удалось загрузить товары')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    setCategories(['Электроника', 'Одежда', 'Книги', 'Дом', 'Спорт', 'Игрушки'])
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка товаров...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="marketplace">
      <header className="header">
        <div className="header-top">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                <span className="logo-text">MarketPlace</span>
              </Link>
              
              <div className="search-bar">
                <input type="text" placeholder="Поиск товаров..." />
                <button className="search-btn">Поиск</button>
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
                      Корзина <span className="cart-count">0</span>
                    </Link>
                    <Link to="/me" className="profile-link">
                      <span className="username">{user?.nickname || user?.name || 'Профиль'}</span>
                    </Link>
                    {user?.status === 'Saller' && (
                      <Link to="/seller/products" className="btn-outline seller-btn">
                        Мои товары
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="header-bottom">
          <div className="container">
            <nav className="categories-nav">
              <button className="catalog-btn">Каталог</button>
              <ul className="categories-list">
                {categories.map(cat => (
                  <li key={cat}><Link to={`/category/${cat.toLowerCase()}`}>{cat}</Link></li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="banner">
            <div className="banner-content">
              <h1>Добро пожаловать в MarketPlace</h1>
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

          {token && user?.status === 'Saller' && (
            <section className="seller-actions-card">
              <div className="seller-actions">
                <Link to="/seller/products/new" className="action-card">
                  <h4>Добавить товар</h4>
                  <p>Разместите новый товар на продажу</p>
                </Link>
                <Link to="/seller/orders" className="action-card">
                  <h4>Заказы</h4>
                  <p>Управляйте заказами покупателей</p>
                </Link>
                <Link to="/seller/stats" className="action-card">
                  <h4>Статистика</h4>
                  <p>Анализируйте свои продажи</p>
                </Link>
              </div>
            </section>
          )}

          <section className="products-section">
            <div className="section-header">
              <h2>Популярные товары</h2>
              <Link to="/products" className="view-all">Смотреть все</Link>
            </div>
            
            {products.length === 0 ? (
              <div className="no-products">
                <p>Товары пока не добавлены</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                    <div className="product-image">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl}
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
                        style={{ display: !product.imageUrl ? 'flex' : 'none' }}
                      >
                        <span className="no-image-text">Нет фото</span>
                      </div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">
                        <span className="current-price">{product.price} ₽</span>
                      </div>
                      <span className="product-seller">{product.sellerNickName}</span>
                      <span className={`stock ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.quantity > 0 ? `В наличии: ${product.quantity} шт.` : 'Нет в наличии'}
                      </span>
                    </div>
                    <button 
                      className="add-to-cart-btn" 
                      onClick={(e) => {
                        e.preventDefault()
                        if (!token) {
                          window.location.href = '/login'
                          return
                        }
                        console.log('Добавить в корзину:', product.id)
                      }}
                      disabled={product.quantity === 0}
                    >
                      {product.quantity > 0 ? 'В корзину' : 'Нет в наличии'}
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="features">
            <div className="feature-item">
              <h4>Быстрая доставка</h4>
              <p>Доставляем по всей стране</p>
            </div>
            <div className="feature-item">
              <h4>Безопасная сделка</h4>
              <p>Гарантия возврата средств</p>
            </div>
            <div className="feature-item">
              <h4>Поддержка 24/7</h4>
              <p>Всегда на связи</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>MarketPlace</h4>
              <p>Лучший маркетплейс для покупок и продаж</p>
            </div>
            <div className="footer-section">
              <h4>Покупателям</h4>
              <ul>
                <li><Link to="/help">Как купить</Link></li>
                <li><Link to="/returns">Возврат</Link></li>
                <li><Link to="/questions">Вопросы и ответы</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Продавцам</h4>
              <ul>
                <li><Link to="/seller/guide">Как продавать</Link></li>
                <li><Link to="/seller/rules">Правила</Link></li>
                <li><Link to="/seller/support">Поддержка продавцов</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Контакты</h4>
              <ul>
                <li>support@marketplace.ru</li>
                <li>8 (800) 123-45-67</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>2025 MarketPlace. Все права не защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}