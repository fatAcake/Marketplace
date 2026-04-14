import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../auth/useAuth.js';
import * as analyticsApi from '../api/analytics.js';
import { prepareHistoryData } from './Stats.utils';
import { SimpleChart } from '../SimpleChart/SimpleChart.jsx';
import { BarChart } from '../BarChart/BarChart.jsx';
import s from './StatsModal.module.css';

export function StatsModal({ onClose }) {
  const { token } = useAuth();
  
  // Состояния данных
  const [activeTab, setActiveTab] = useState('general');
  const [salesData, setSalesData] = useState(null);
  const [productHistory, setProductHistory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Состояния UI
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Логика загрузки общих данных
  const loadGeneralData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sales = await analyticsApi.getSalesAnalytics(token);
      setSalesData(sales);
    } catch (e) {
      setError(e?.message || 'Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 2. Логика загрузки истории конкретного товара
  const loadProductHistory = async (productId, productName) => {
    setProductLoading(true);
    setSelectedProduct({ id: productId, name: productName });
    try {
      const history = await analyticsApi.getPriceHistory(productId, token);
      setProductHistory(Array.isArray(history) ? history : []);
    } catch (e) {
      setProductHistory([]);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    loadGeneralData();
  }, [loadGeneralData]);

  // 3. Мемоизация расчетов
  const charts = useMemo(() => ({
    revenue: (salesData?.topProducts || []).slice(0, 8).map(p => ({ label: p.productName, value: p.totalRevenue })),
    quantity: (salesData?.topProducts || []).slice(0, 8).map(p => ({ label: p.productName, value: p.soldQuantity })),
    priceHistory: prepareHistoryData(productHistory, 'price'),
    discountHistory: prepareHistoryData(productHistory, 'discount')
  }), [salesData, productHistory]);

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.content} onClick={(e) => e.stopPropagation()}>
        <header className={s.header}>
          <h2>Аналитика</h2>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </header>

        <nav className={s.tabs}>
          <button 
            className={activeTab === 'general' ? s.active : ''} 
            onClick={() => { setActiveTab('general'); setSelectedProduct(null); }}
          >
            Обзор
          </button>
          <button 
            className={activeTab === 'products' ? s.active : ''} 
            onClick={() => setActiveTab('products')}
          >
            По товарам
          </button>
        </nav>

        <div className={s.body}>
          {loading ? (
            <div className={s.loader}>Загрузка данных...</div>
          ) : error ? (
            <div className="alert error">{error}</div>
          ) : activeTab === 'general' ? (
            /* Вкладка: ОБЩАЯ СТАТИСТИКА */
            <div className={s.tabContent}>
              <div className={s.kpiGrid}>
                <KpiCard label="Доход" value={`${Math.round(salesData?.totalRevenue || 0).toLocaleString()} ₽`} />
                <KpiCard label="Заказы" value={salesData?.totalOrders || 0} />
                <KpiCard label="Средний чек" value={`${Math.round(salesData?.averageCheck || 0).toLocaleString()} ₽`} />
              </div>
              
              <div className={s.chartSection}>
                <h4>Выручка по товарам</h4>
                <BarChart data={charts.revenue} />
              </div>
            </div>
          ) : (
            /* Вкладка: ТОВАРЫ */
            <div className={s.tabContent}>
              {!selectedProduct ? (
                <ProductSelector 
                  products={salesData?.topProducts || []} 
                  onSelect={loadProductHistory} 
                />
              ) : (
                <ProductDetail 
                  name={selectedProduct.name}
                  loading={productLoading}
                  history={productHistory}
                  priceData={charts.priceHistory}
                  discountData={charts.discountHistory}
                  onBack={() => setSelectedProduct(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Вспомогательные компоненты
function KpiCard({ label, value }) {
  return (
    <div className={s.kpiCard}>
      <span className={s.kpiValue}>{value}</span>
      <span className={s.kpiLabel}>{label}</span>
    </div>
  );
}

function ProductSelector({ products, onSelect }) {
  return (
    <div className={s.productGrid}>
      {products.map(p => (
        <button key={p.productId} className={s.selectorBtn} onClick={() => onSelect(p.productId, p.productName)}>
          <strong>{p.productName}</strong>
          <span>{p.soldQuantity} шт.</span>
        </button>
      ))}
    </div>
  );
}

function ProductDetail({ name, loading, priceData, onBack }) {
  if (loading) return <div>Загрузка истории...</div>;
  return (
    <div>
      <button onClick={onBack} className={s.backBtn}>← Назад</button>
      <h3>{name}</h3>
      {priceData ? <SimpleChart data={priceData} label="Цена (₽)" /> : <p>Нет данных</p>}
    </div>
  );
}