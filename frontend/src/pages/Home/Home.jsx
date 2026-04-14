import { useEffect, useState } from 'react';
import { productsApi } from '../api/products.js';
import { ProductCard } from '../components/ProductCard/ProductCard.jsx';
import s from './Home.module.css';

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Защита от утечек памяти при размонтировании

    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await productsApi.getAll();
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) setError('Не удалось загрузить товары');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProducts();
    return () => { isMounted = false };
  }, []);

  // Выносим рендер контента в переменную
  const renderContent = () => {
    if (isLoading) return <div className={s.loader}>Загрузка товаров...</div>;
    if (error) return <div className="alert error">{error}</div>;
    if (products.length === 0) return <div className={s.empty}>Товары не найдены</div>;

    return (
      <div className={s.productGrid}> 
        {products.map((item) => (
          <ProductCard 
            key={item.id ?? item.Id} 
            product={item} 
            // Используем метод из API сервиса
            imageUrl={productsApi.getProductImageUrl(item.id ?? item.Id, item.images?.[0]?.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={s.page}>
      <header className={s.hero}>
        <h1 className={s.title}>Добро пожаловать в Marketplace</h1>
        <p>Находите лучшие товары по выгодным ценам</p>
      </header>

      <main className="container">
        <h2 className={s.sectionTitle}>Все товары</h2>
        {renderContent()}
      </main>
    </div>
  );
}