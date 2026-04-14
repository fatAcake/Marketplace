export const calculateSellerStats = (products) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0);
  const avgPrice = totalProducts > 0 
    ? products.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts 
    : 0;
  
  return { totalProducts, totalValue, avgPrice };
};

export const calculateBuyerStats = (orders) => {
  const totalOrdersValue = orders.reduce((sum, o) => {
    const items = o.items || o.orderItems || [];
    return sum + items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  }, 0);
  
  return { totalOrders: orders.length, totalOrdersValue };
};