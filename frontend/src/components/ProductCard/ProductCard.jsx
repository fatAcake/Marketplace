import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { getDisplayPrice } from './ProductCard.utils';
import s from './ProductCard.module.css';

// Предположим,ImageUrl теперь приходит сверху или формируется проще
export function ProductCard({ product, imageUrl }) {
  const price = useMemo(() => getDisplayPrice(product), [product]);

  return (
    <div className={s.card}>
      <Link to={`/products/${product.id}`} className={s.imageLink}>
        {imageUrl ? (
          <img className={s.img} src={imageUrl} alt={product.name} />
        ) : (
          <div className={s.placeholder}>
            <i className="bi bi-image" />
          </div>
        )}
      </Link>

      <div className={s.body}>
        <Link to={`/products/${product.id}`} className={s.title}>
          {product.name}
        </Link>
        
        <div className={s.priceTag}>
          {price.hasDiscount ? (
            <>
              <span className={s.current}>{price.current} ₽</span>
              <span className={s.old}>{price.old} ₽</span>
              <span className={s.badge}>−{price.percent}%</span>
            </>
          ) : (
            <span className={s.current}>{price.current} ₽</span>
          )}
        </div>
        
        <div className={s.footer}>
          В наличии: {product.quantity} шт.
        </div>
      </div>
    </div>
  );
}