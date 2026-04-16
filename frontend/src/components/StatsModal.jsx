import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import * as analyticsApi from '../api/analytics.js'
import { SimpleChart } from './SimpleChart.jsx'
import { BarChart } from './BarChart.jsx'

const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export function StatsModal({ onClose }) {
  const { token } = useAuth()
  const [tab, setTab] = useState('general')
  const [salesData, setSalesData] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productHistory, setProductHistory] = useState(null)
  const [productLoading, setProductLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [token])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const sales = await analyticsApi.getSalesAnalytics(token)
      setSalesData(sales)
      setTopProducts(sales?.topProducts || [])
    } catch (e) {
      setError(e?.message || 'Не удалось загрузить статистику')
    } finally {
      setLoading(false)
    }
  }

  async function loadProductHistory(productId, productName) {
    setProductLoading(true)
    setSelectedProduct({ id: productId, name: productName })
    try {
      const history = await analyticsApi.getPriceHistory(productId, token)
      const arr = Array.isArray(history) ? history : []
      setProductHistory(arr)
    } catch (e) {
      setError(e?.message || 'Не удалось загрузить историю цен')
      setProductHistory([])
    } finally {
      setProductLoading(false)
    }
  }

  const topProductsByRevenue = topProducts
    .slice(0, 8)
    .map((p) => ({ label: p.productName, value: p.totalRevenue }))

  const topProductsByQty = topProducts
    .slice(0, 8)
    .map((p) => ({ label: p.productName, value: p.soldQuantity }))

  const priceChartData = productHistory
    ? (() => {
        const points = []
        const sorted = [...productHistory].sort(
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

  const discountChartData = productHistory
    ? (() => {
        const points = []
        const sorted = [...productHistory].sort(
          (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
        )

        let currentDiscount = null

        sorted.forEach((h) => {
          const d = new Date(h.changedAt)
          const label = `${d.getDate()} ${months[d.getMonth()]}`

          if (h.newDiscount != null) {
            currentDiscount = h.newDiscount
          } else if (h.oldDiscount != null && currentDiscount == null) {
            currentDiscount = h.oldDiscount
          }

          if (currentDiscount != null) {
            points.push({ label, value: currentDiscount })
          }
        })

        return points.length > 0 ? points : null
      })()
    : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Статистика</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'general' ? 'active' : ''}`}
            onClick={() => { setTab('general'); setSelectedProduct(null) }}
          >
            Общая статистика
          </button>
          <button
            className={`modal-tab ${tab === 'products' ? 'active' : ''}`}
            onClick={() => { setTab('products'); setSelectedProduct(null); setProductHistory(null) }}
          >
            Товары
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p className="text-navy">Загрузка...</p>
          ) : error ? (
            <div className="alert error">{error}</div>
          ) : tab === 'general' ? (
            <div className="stats-general">
              <div className="stats-kpi-grid">
                <div className="stats-kpi-card">
                  <div className="stats-kpi-value">{salesData?.totalOrders ?? 0}</div>
                  <div className="stats-kpi-label">Заказов</div>
                </div>
                <div className="stats-kpi-card">
                  <div className="stats-kpi-value">{salesData?.totalSales ?? 0}</div>
                  <div className="stats-kpi-label">Продано товаров</div>
                </div>
                <div className="stats-kpi-card">
                  <div className="stats-kpi-value">{Math.round(salesData?.totalRevenue ?? 0).toLocaleString('ru-RU')} ₽</div>
                  <div className="stats-kpi-label">Общий доход</div>
                </div>
                <div className="stats-kpi-card">
                  <div className="stats-kpi-value">{Math.round(salesData?.averageCheck ?? 0).toLocaleString('ru-RU')} ₽</div>
                  <div className="stats-kpi-label">Средний чек</div>
                </div>
              </div>

              {topProductsByRevenue.length > 0 && (
                <div className="stats-chart-section">
                  <h4>Топ товаров по доходу</h4>
                  <BarChart data={topProductsByRevenue} />
                </div>
              )}

              {topProductsByQty.length > 0 && (
                <div className="stats-chart-section">
                  <h4>Топ товаров по количеству продаж</h4>
                  <BarChart data={topProductsByQty} />
                </div>
              )}

              {topProducts.length > 0 && (
                <div className="stats-top-products">
                  <h4>Все товары по продажам</h4>
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Товар</th>
                        <th>Продано</th>
                        <th>Доход</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={p.productId}>
                          <td>{i + 1}</td>
                          <td>{p.productName}</td>
                          <td>{p.soldQuantity}</td>
                          <td>{Math.round(p.totalRevenue).toLocaleString('ru-RU')} ₽</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {topProducts.length === 0 && (
                <p className="text-navy">Пока нет данных о продажах.</p>
              )}
            </div>
          ) : tab === 'products' && !selectedProduct ? (
            <div className="stats-products-list">
              {topProducts.length === 0 ? (
                <p className="text-navy">Нет данных о продажах товаров.</p>
              ) : (
                <>
                  <p className="text-navy" style={{ marginBottom: 12, fontSize: 14 }}>
                    Выберите товар для просмотра истории цен:
                  </p>
                  <div className="stats-product-items">
                    {topProducts.map((p) => (
                      <button
                        key={p.productId}
                        className="stats-product-item"
                        onClick={() => loadProductHistory(p.productId, p.productName)}
                      >
                        <span className="stats-product-name">{p.productName}</span>
                        <span className="stats-product-meta">
                          Продано: {p.soldQuantity} · Доход: {Math.round(p.totalRevenue).toLocaleString('ru-RU')} ₽
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : tab === 'products' && selectedProduct ? (
            <div className="stats-product-detail">
              <button className="btn btn-back" onClick={() => { setSelectedProduct(null); setProductHistory(null) }}>
                ← Назад к списку
              </button>
              <h3 style={{ margin: '0 0 16px', color: '#111' }}>{selectedProduct.name}</h3>

              {productLoading ? (
                <p className="text-navy">Загрузка истории цен...</p>
              ) : productHistory?.length === 0 ? (
                <p className="text-navy">Нет истории изменений цен для этого товара.</p>
              ) : (
                <>
                  {priceChartData && priceChartData.length > 0 ? (
                    <div className="stats-chart-section">
                      <h4>Изменение цены</h4>
                      <SimpleChart data={priceChartData} label="Цена (₽)" />
                    </div>
                  ) : (
                    <p className="text-navy">Нет данных о изменении цен.</p>
                  )}

                  {discountChartData && discountChartData.length > 0 ? (
                    <div className="stats-chart-section">
                      <h4>Изменение скидки (%)</h4>
                      <SimpleChart data={discountChartData} label="%" />
                    </div>
                  ) : null}

                  <div className="stats-history-table">
                    <h4>История изменений</h4>
                    <table className="stats-table">
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
                        {(productHistory || [])
                          .slice()
                          .reverse()
                          .slice(0, 20)
                          .map((h) => (
                            <tr key={h.id}>
                              <td>{new Date(h.changedAt).toLocaleDateString('ru-RU')}</td>
                              <td>{h.oldPrice != null ? `${h.oldPrice} ₽` : '—'}</td>
                              <td>{h.newPrice != null ? `${h.newPrice} ₽` : '—'}</td>
                              <td>{h.oldDiscount != null ? `${h.oldDiscount}%` : '—'}</td>
                              <td>{h.newDiscount != null ? `${h.newDiscount}%` : '—'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
