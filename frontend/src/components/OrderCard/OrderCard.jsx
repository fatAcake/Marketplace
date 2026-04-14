import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as ordersApi from '../../api/orders.js';
import { normalizeOrder, STATUS_MAP } from './OrderCard.utils';
import s from './OrderCard.module.css';

export function OrderCard({ order: rawOrder, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const order = useMemo(() => normalizeOrder(rawOrder), [rawOrder]);
  
  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#6b7280' };

  const handleCancel = async () => {
    if (!window.confirm('Вы уверены, что хотите отменить заказ?')) return;
    setBusy(true);
    try {
      await ordersApi.updateStatus(order.id, 'cancelled');
      if (onRefresh) onRefresh(); // Умное обновление без перезагрузки всей страницы
    } catch (e) {
      alert('Ошибка при отмене заказа');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.card}>
      <div className={s.header}>
        <div>
          <div className="mono text-navy">Заказ #{order.id}</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </div>
        <span className={s.status} style={{ backgroundColor: statusInfo.color }}>
          {statusInfo.label}
        </span>
      </div>

      <div className={s.itemsList}>
        {order.items.slice(0, 3).map((item) => (
          <div className={s.item} key={item.id}>
            <Link to={`/products/${item.id}`} className="text-navy">{item.name}</Link>
            <span className="muted">{item.quantity} шт. × {item.price} ₽</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="muted" style={{ fontSize: 12 }}>+ еще {order.items.length - 3}</div>
        )}
      </div>

      <div className={s.footer}>
        <div className={s.total}>
          Итого: {Math.round(order.totalAmount).toLocaleString('ru-RU')} ₽
        </div>
        
        {order.status === 'pending' && (
          <button 
            className="btn btn-danger-outline btn-sm" 
            onClick={handleCancel} 
            disabled={busy}
          >
            {busy ? '...' : 'Отменить'}
          </button>
        )}
      </div>
    </div>
  );
}