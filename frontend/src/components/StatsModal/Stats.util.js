const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const formatChartDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

export const prepareHistoryData = (history, type = 'price') => {
  if (!history || history.length === 0) return null;
  
  const sorted = [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
  const points = [];
  let currentValue = null;

  sorted.forEach((h) => {
    const label = formatChartDate(h.changedAt);
    const newVal = type === 'price' ? h.newPrice : h.newDiscount;
    const oldVal = type === 'price' ? h.oldPrice : h.oldDiscount;

    if (newVal != null) currentValue = newVal;
    else if (oldVal != null && currentValue === null) currentValue = oldVal;

    if (currentValue != null) points.push({ label, value: currentValue });
  });

  return points.length > 0 ? points : null;
};