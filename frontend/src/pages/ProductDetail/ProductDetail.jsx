import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import * as productsApi from '../../api/products.js';
import * as analyticsApi from '../../api/analytics.js';
import { SimpleChart } from '../components/SimpleChart.jsx';
import { EditProductModal } from '../components/EditProductModal.jsx';
import { normalizeProduct, prepareHistoryData } from '../../utils/productHelpers.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5035';

export function ProductDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Состояние данных
  const [data, setData] = useState({
    product: null,
    images: [],
    priceHistory: [],
    loading: true,
    chartLoading: false,
    error: '',
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [ui, setUi] = useState({ deleting: false, editModalOpen: false, descExpanded: false });

  const loadAllData = async () => {
    setData(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const [product, imgs, history] = await Promise.allSettled([
        productsApi.getProductById(id, token),
        analyticsApi.getProductImages(id, token),
        analyticsApi.getPriceHistory(id, token),
      ]);

      const productData = product.status === 'fulfilled' ? product.value : null;
      const imagesData = imgs.status === 'fulfilled' ? imgs.value : [];
      
      setData({
        product: productData,
        images: Array.isArray(imagesData) ? imagesData : [],
        priceHistory: history.status === 'fulfilled' ? history.value : [],
        loading: false,
        error: product.status === 'rejected' ? 'Не удалось загрузить продукт' : '',
      });

      if (imagesData?.length > 0) setSelectedImage(imagesData[0].id);
    } catch (e) {
      setData(prev => ({ ...prev, loading: false, error: 'Произошла ошибка' }));
    }
  };

  useEffect(() => { loadAllData(); }, [id]);

  // Вычисляемые данные
  const p = useMemo(() => normalizeProduct(data.product), [data.product]);
  const isOwner = user?.id === p.userId;
  const priceChartData = useMemo(() => prepareHistoryData(data.priceHistory, 'price'), [data.priceHistory]);
  const discountChartData = useMemo(() => prepareHistoryData(data.priceHistory, 'discount'), [data.priceHistory]);

  const handleDelete = async () => {
    if (!window.confirm('Удалить этот товар?')) return;
    setUi(prev => ({ ...prev, deleting: true }));
    try {
      await productsApi.deleteProduct(id, token);
      navigate('/me');
    } catch (e) {
      setData(prev => ({ ...prev, error: e.message }));
      setUi(prev => ({ ...prev, deleting: false }));
    }
  };

  if (data.loading) return <section className="product-detail-section"><p className="text-navy">Загрузка...</p></section>;
  if (data.error && !data.product) return <section className="product-detail-section"><div className="alert error">{data.error}</div></section>;

  return (
    <section className="product-detail-section">
      <Link className="btn btn-back-link" to="/me">← Назад в профиль</Link>

      <div className="product-detail-grid">
        {/* Галерея */}
        <div className="product-detail-gallery">
          {selectedImage ? (
            <img 
              className="product-detail-main-img" 
              src={`${API_BASE}/api/products/${id}/images/${selectedImage}`} 
              alt={p.name} 
            />
          ) : <div className="product-detail-placeholder"><span>Нет изображений</span></div>}
          
          <div className="product-detail-thumbs">
            {data.images.map(img => (
              <button 
                key={img.id} 
                className={`product-detail-thumb ${selectedImage === img.id ? 'active' : ''}`}
                onClick={() => setSelectedImage(img.id)}
              >
                <img src={`${API_BASE}/api/products/${id}/images/${img.id}`} alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* Инфо */}
        <div className="product-detail-info">
          <h1 className="product-detail-title">{p.name}</h1>
          
          <div className="product-detail-price">
            {p.discountedPrice ? (
              <>
                <span className="price-current">{p.discountedPrice} ₽</span>
                <span className="price-old">{p.price} ₽</span>
                <span className="price-discount-badge">−{p.discountSize}%</span>
              </>
            ) : <span className="price-current">{p.price} ₽</span>}
          </div>

          <div className="product-detail-description">
            <h3>Описание</h3>
            <p className={!ui.descExpanded && p.description.length > 180 ? 'desc-collapsed' : ''}>
              {ui.descExpanded ? p.description : `${p.description.slice(0, 180)}${p.description.length > 180 ? '...' : ''}`}
            </p>
            {p.description.length > 180 && (
              <button className="btn-desc-toggle" onClick={() => setUi(v => ({...v, descExpanded: !v.descExpanded}))}>
                {ui.descExpanded ? 'Свернуть' : 'Развернуть'}
              </button>
            )}
          </div>

          {isOwner && (
            <div className="product-detail-actions">
              <button className="btn btn-edit" onClick={() => setUi(v => ({...v, editModalOpen: true}))}>✏️ Изменить</button>
              <button className="btn btn-danger-outline" onClick={handleDelete} disabled={ui.deleting}>
                {ui.deleting ? 'Удаление...' : '🗑 Удалить'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Графики */}
      <div className="product-detail-charts">
        <h2>История цен и скидок</h2>
        <div className="charts-container">
          {priceChartData && (
            <div className="product-detail-chart">
              <h4>Изменение цены</h4>
              <SimpleChart data={priceChartData} label="₽" />
            </div>
          )}
          {discountChartData && (
            <div className="product-detail-chart">
              <h4>Изменение скидки</h4>
              <SimpleChart data={discountChartData} label="%" />
            </div>
          )}
          {!priceChartData && <p>История изменений пока отсутствует.</p>}
        </div>
      </div>

      {ui.editModalOpen && (
        <EditProductModal
          product={data.product}
          token={token}
          onClose={() => setUi(v => ({...v, editModalOpen: false}))}
          onSuccess={() => { setUi(v => ({...v, editModalOpen: false})); loadAllData(); }}
        />
      )}
    </section>
  );
}