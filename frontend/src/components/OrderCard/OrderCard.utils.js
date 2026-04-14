export const STATUS_MAP = {
  pending: { label: 'Ожидает', color: '#f59e0b' },
  processing: { label: 'В обработке', color: '#3b82f6' },
  shipped: { label: 'Отправлен', color: '#8b5cf6' },
  delivered: { label: 'Доставлен', color: '#10b981' },
  cancelled: { label: 'Отменён', color: '#ef4444' },
  completed: { label: 'Завершён', color: '#059669' },
};

export function normalizeOrder(o) {
  return {
    id: o.id ?? o.Id ?? o.orderId,
    status: (o.status ?? o.Status ?? 'pending').toLowerCase(),
    createdAt: o.createdAt ?? o.CreatedAt ?? new Date(),
    totalAmount: o.totalAmount ?? o.TotalAmount ?? 0,
    items: (o.items ?? o.Items ?? o.orderItems ?? []).map(item => ({
      id: item.productId ?? item.ProductId ?? item.product_id,
      name: item.productName ?? item.ProductName ?? item.name ?? 'Товар',
      quantity: item.quantity ?? item.Quantity ?? 1,
      price: item.price ?? item.Price ?? 0
    })),
  };
}