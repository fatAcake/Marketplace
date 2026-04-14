export const getDisplayPrice = (product) => {
  const hasDiscount = product.discountSize > 0 && product.discountedPrice !== null;
  return {
    hasDiscount,
    current: hasDiscount ? product.discountedPrice : product.price,
    old: hasDiscount ? product.price : null,
    percent: hasDiscount ? product.discountSize : null,
  };
};