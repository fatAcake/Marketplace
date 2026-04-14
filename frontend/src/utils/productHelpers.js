const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const formatChartDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

export const normalizeProduct = (product) => {
  if (!product) return {};
  const discountSize = product.discountSize ?? product.DiscountSize ?? 0;
  const discountedPrice = product.discountedPrice ?? product.DiscountedPrice;
  const hasDiscount = discountSize > 0 && discountedPrice != null;

  return {
    name: product.name ?? product.Name ?? '',
    price: product.price ?? product.Price ?? 0,
    quantity: product.quantity ?? product.Quantity ?? 0,
    description: product.description ?? product.Description ?? '',
    sellerNickName: product.sellerNickName ?? product.SellerNickName ?? '',
    discountSize: hasDiscount ? discountSize : null,
    discountedPrice: hasDiscount ? discountedPrice : null,
    userId: product.userId ?? product.UserId,
  };
};

export const prepareHistoryData = (history, type = 'price') => {
  if (!Array.isArray(history) || history.length === 0) return null;

  const sorted = [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
  const points = [];

  sorted.forEach((h) => {
    const label = formatChartDate(h.changedAt);
    let value = null;

    if (type === 'price') {
      value = h.newPrice ?? h.oldPrice;
    } else {
      value = h.newDiscount ?? h.oldDiscount;
    }

    if (value != null) points.push({ label, value });
  });

  return points.length > 0 ? points : null;
};