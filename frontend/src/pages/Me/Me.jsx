import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { productsApi } from '../api/products.js';
import { ordersApi } from '../api/orders.js';
import { calculateSellerStats, calculateBuyerStats } from './Me.utils';
import { ProductCard } from '../components/ProductCard/ProductCard.jsx';
import { OrderCard } from '../components/OrderCard/OrderCard.jsx';
import s from './Me.module.css';

export function MePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const navigate = useNavigate();

  const isSeller = useMemo(() => {
    const status = (user?.status || '').toLowerCase();
    return status === 'seller' || status === 'saller';
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = isSeller 
        ? await productsApi.getByUserId(user.id)
        : await ordersApi.getMyOrders();
      setData(Array.isArray(result) ? result : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, isSeller]);

  // Вычисляем статистику только при изменении данных
  const stats = useMemo(() => 
    isSeller ? calculateSellerStats(data) : calculateBuyerStats(data),
    [data, isSeller]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={s.container}>
      {/* Header Section */}
      <header className={s.header}>
        <div className={s.userBadge}>
          <div className={s.avatar}>{(user?.nickname || 'U')[0].toUpperCase()}</div>
          <div>
            <h1 className={s.name}>{user?.nickname || 'Пользователь'}</h1>
            <p className={s.email}>{user?.email}</p>
          </div>
        </div>
        <div className={s.actions}>
          <button className="btn" onClick={loadData}>↻ Обновить</button>
          <button className="btn danger" onClick={handleLogout}>Выйти</button>
        </div>
      </header>

      {/* Stats Section */}
      <div className={s.statsGrid}>
        {isSeller ? (
          <SellerStats stats={stats} onOpenStats={() => setStatsOpen(true)} />
        ) : (
          <BuyerStats stats={stats} />
        )}
      </div>

      {/* List Section */}
      <section className={s.content}>
        <h2>{isSeller ? 'Мои товары' : 'Мои заказы'}</h2>
        <div className={isSeller ? "grid grid-2" : s.orderList}>
          {data.map(item => (
            isSeller 
              ? <ProductCard key={item.id} product={item} />
              : <OrderCard key={item.id} order={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Вспомогательные мини-компоненты (можно вынести в этот же файл или отдельно)
function SellerStats({ stats, onOpenStats }) {
  return (
    <>
      <StatCard label="Товаров" value={stats.totalProducts} icon="box" />
      <StatCard label="Общая стоимость" value={`${Math.round(stats.totalValue)} ₽`} icon="cash" />
      <button className={s.statCardClickable} onClick={onOpenStats}>
        <i className="bi bi-bar-chart" /> Аналитика
      </button>
    </>
  );
}