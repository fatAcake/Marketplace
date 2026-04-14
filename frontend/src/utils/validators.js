export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
};

export const validateRequired = (value) => value.trim().length > 0;

export const validatePrice = (price) => Number(price) > 0;

export const validateProduct = (data) => {
  if (!data.name?.trim()) return 'Введите название';
  if (!data.price || parseFloat(data.price) <= 0) return 'Укажите корректную цену';
  if (data.quantity === '' || parseInt(data.quantity) < 0) return 'Укажите корректное количество';
  
  const discount = parseFloat(data.discountSize);
  if (data.discountSize && (discount < 0 || discount > 100)) {
    return 'Скидка должна быть от 0 до 100%';
  }
  return null;
};
export const validateRegistration = ({ email, nickname, password, confirmPassword }) => {
  if (!nickname.trim()) return 'Введите никнейм';
  if (!email.includes('@')) return 'Введите корректный email';
  if (password.length < 5) return 'Пароль должен быть минимум 5 символов';
  if (password !== confirmPassword) return 'Пароли не совпадают';
  return null;
};
