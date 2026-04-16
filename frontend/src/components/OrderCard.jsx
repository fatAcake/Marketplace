import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as ordersApi from '../api/orders.js'
import { useAuth } from '../auth/useAuth.js'

const statusLabels = {
  pending: 'Ожидает',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  completed: 'Завершён',
}

const statusColors = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
  completed: '#059669',
}

function normalizeOrder(o) {
  return {
    id: o.id ?? o.Id ?? o.orderId,
    status: o.status ?? o.Status ?? o.OrderStatus ?? 'pending',
    createdAt: o.createdAt ?? o.CreatedAt ?? '',
    totalAmount: o.totalSum ?? o.TotalSum ?? o.totalAmount ?? o.TotalAmount ?? 0,
    items: o.items ?? o.Items ?? o.orderItems ?? [],
    sellerName: o.sellerName ?? o.SellerName ?? o.sellerNickName ?? '',
  }
}

export function OrderCard({ order: rawOrder }) {
  const { token } = useAuth()
  const order = normalizeOrder(rawOrder)
  const [busy, setBusy] = useState(false)

  async function handleCancel() {
    setBusy(true)
    try {
      await ordersApi.updateOrderStatus(order.id, 'cancelled', token)
      window.location.reload()
    } catch (e) {
    } finally {
      setBusy(false)
    }
  }

  const statusColor = statusColors[order.status.toLowerCase()] || '#6b7280'
  const statusLabel = statusLabels[order.status.toLowerCase()] || order.status
  const items = Array.isArray(order.items) ? order.items : []

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-card-meta">
          <span className="order-card-id">Заказ #{order.id}</span>
          <span className="order-card-date">
            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
        <span className="order-card-status" style={{ background: statusColor }}>
          {statusLabel}
        </span>
      </div>

      <div className="order-card-items">
        {items.slice(0, 3).map((item, i) => (
          <div className="order-item" key={i}>
            <Link
              to={`/products/${item.productId ?? item.ProductId ?? item.product_id}`}
              className="order-item-name"
            >
              {item.productName ?? item.ProductName ?? item.name ?? 'Товар'}
            </Link>
            <span className="order-item-qty">
              {item.quantity ?? item.Quantity ?? 1} шт. × {item.finalPriceAtBuy ?? item.FinalPriceAtBuy ?? item.priceAtBuy ?? item.PriceAtBuy ?? item.price ?? item.Price ?? 0} ₽
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="order-item-more">
            + ещё {order.items.length - 3} {order.items.length - 3 === 1 ? 'товар' : 'товаров'}
          </div>
        )}
      </div>

      <div className="order-card-footer">
        <span className="order-card-total">
          Итого: {Math.round(order.totalAmount).toLocaleString('ru-RU')} ₽
        </span>
        {order.status?.toLowerCase() === 'pending' && (
          <button
            className="btn btn-danger-outline btn-sm"
            onClick={handleCancel}
            disabled={busy}
          >
            {busy ? 'Отмена...' : 'Отменить'}
          </button>
        )}
      </div>
    </div>
  )
}
