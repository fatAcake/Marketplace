export const validateProduct = (data, images) => {
  if (!data.name.trim()) return 'Введите название';
  if (!data.price || parseFloat(data.price) <= 0) return 'Укажите корректную цену';
  if (!data.quantity || parseInt(data.quantity) < 1) return 'Укажите количество';
  
  if (data.discountSize !== '') {
    const ds = parseFloat(data.discountSize);
    if (ds < 0 || ds > 100) return 'Скидка должна быть от 0 до 100%';
  }
  
  if (data.discountStartDate && data.discountEndDate) {
    if (new Date(data.discountEndDate) <= new Date(data.discountStartDate)) {
      return 'Дата окончания должна быть позже даты начала';
    }
  }
  
  return null; // Ошибок нет
};