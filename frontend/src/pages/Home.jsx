import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import axios from 'axios'
import './Home.css'

const api = axios.create({
  baseURL: 'http://localhost:5035/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

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

  // Загружаем товары
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await api.get('/Products')
        setProducts(response.data.slice(0, 8)) // Показываем первые 8 товаров
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
    const fetchCategories = async () => {
      try {
        setCategories(['Электроника', 'Одежда', 'Книги', 'Дом', 'Спорт', 'Игрушки'])
      } catch (err) {
        console.error('Ошибка загрузки категорий:', err)
      }
    }

    fetchCategories()
  }, [])

  // Вычисление цены со скидкой
  const getDiscountedPrice = (price, discount) => {
    if (!discount || discount.size === null) return price
    return price * (1 - discount.size / 100)
  }

  // Проверка активности скидки
  const isDiscountActive = (discount) => {
    if (!discount) return false
    const now = new Date()
    const start = discount.startDate ? new Date(discount.startDate) : null
    const end = discount.endDate ? new Date(discount.endDate) : null
    
    if (start && now < start) return false
    if (end && now > end) return false
    return true
  }

  // Получение активной скидки товара
  const getActiveDiscount = (productId) => {
    return null
  }

  // Загрузка
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка товаров...</p>
      </div>
    )
  }

  // Ошибка
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
      {/* Шапка */}
      <header className="header">
        <div className="header-top">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                <span className="logo-icon"></span>
                <span className="logo-text">MarketPlace</span>
              </Link>
              
              <div className="search-bar">
                <input type="text" placeholder="Поиск товаров..." />
                <button className="search-btn"></button>
              </div>

              <div className="header-actions">
                {!token ? (
                  <>
                    <Link to="/login" className="btn-outline">Войти</Link>
                    <Link to="/register" className="btn-primary">Регистрация</Link>
                  </>
                ) : (
                  <>
                    <Link to="/cart" className="cart-link" title="Корзина">
                      🛒 <span className="cart-count">0</span>
                    </Link>
                    <Link to="/me" className="profile-link">
                      <span className="avatar"></span>
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

        {/* Категории */}
        <div className="header-bottom">
          <div className="container">
            <nav className="categories-nav">
              <button className="catalog-btn">☰ Каталог</button>
              <ul className="categories-list">
                {categories.map(cat => (
                  <li key={cat}><Link to={`/category/${cat.toLowerCase()}`}>{cat}</Link></li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="main">
        <div className="container">
          {/* Баннер */}
          <section className="banner">
            <div className="banner-content">
              <h1>Добро пожаловать в MarketPlace</h1>
              <p>Покупайте и продавайте товары онлайн</p>
              <Link to="/products" className="btn-primary btn-large">Все товары</Link>
            </div>
          </section>

          {/* Приветствие для покупателей */}
          {token && user?.status !== 'Saller' && (
            <section className="become-seller-card">
              <div className="seller-promo">
                <span className="promo-icon"></span>
                <div className="promo-text">
                  <h3>Станьте продавцом</h3>
                  <p>Продавайте свои товары на нашей площадке и зарабатывайте</p>
                </div>
                <Link to="/become-seller" className="btn-primary">Начать продавать</Link>
              </div>
            </section>
          )}

          {/* Приветствие для продавцов */}
          {token && user?.status === 'Saller' && (
            <section className="seller-actions-card">
              <div className="seller-actions">
                <Link to="/seller/products/new" className="action-card">
                  <span className="action-icon"></span>
                  <h4>Добавить товар</h4>
                  <p>Разместите новый товар на продажу</p>
                </Link>
                <Link to="/seller/orders" className="action-card">
                  <span className="action-icon"></span>
                  <h4>Заказы</h4>
                  <p>Управляйте заказами покупателей</p>
                </Link>
                <Link to="/seller/stats" className="action-card">
                  <span className="action-icon"></span>
                  <h4>Статистика</h4>
                  <p>Анализируйте свои продажи</p>
                </Link>
              </div>
            </section>
          )}

          {/* Товары */}
          <section className="products-section">
            <div className="section-header">
              <h2>Популярные товары</h2>
              <Link to="/products" className="view-all">Смотреть все →</Link>
            </div>
            
            {products.length === 0 ? (
              <div className="no-products">
                <p>Товары пока не добавлены</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => {
                  const activeDiscount = null // getActiveDiscount(product.id)
                  const hasDiscount = activeDiscount && isDiscountActive(activeDiscount)
                  const finalPrice = hasDiscount 
                    ? getDiscountedPrice(product.price, activeDiscount)
                    : product.price

                  return (
                    <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                      <div className="product-image">
                        {product.images?.[0] ? (
                          <img 
                            src={`data:image/jpeg;base64,${product.images[0].fileData}`} 
                            alt={product.name}
                          />
                        ) : (
                          <span className="product-pho">Нету изображения</span>
                        )}
                        {hasDiscount && (
                          <span className="discount-badge">-{activeDiscount.size}%</span>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price">
                          {hasDiscount ? (
                            <>
                              <span className="current-price">{finalPrice.toFixed(0)} ₽</span>
                              <span className="old-price">{product.price.toFixed(0)} ₽</span>
                            </>
                          ) : (
                            <span className="current-price">{product.price.toFixed(0)} ₽</span>
                          )}
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
                            // Перенаправляем на логин
                            window.location.href = '/login'
                            return
                          }
                          // Логика добавления в корзину
                          console.log('Добавить в корзину:', product.id)
                        }}
                        disabled={product.quantity === 0}
                      >
                        {product.quantity > 0 ? ' В корзину' : ' Нет в наличии'}
                      </button>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Преимущества */}
          <section className="features">
            <div className="feature-item">
              <span className="feature-icon"></span>
              <h4>Быстрая доставка</h4>
              <p>Доставляем по всей стране</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon"></span>
              <h4>Безопасная сделка</h4>
              <p>Гарантия возврата средств</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon"></span>
              <h4>Поддержка 24/7</h4>
              <p>Всегда на связи</p>
            </div>
          </section>
        </div>
      </main>

      {/* Футер */}
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
                <li> support@marketplace.ru</li>
                <li> 8 (800) 123-45-67</li>
                <li> Чат поддержки</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 MarketPlace. Все права не защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}