import { useState, useEffect } from 'react';
import { productsApi } from '../../api/products';

export function useProductForm(product, onSuccess) {
  const [values, setValues] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    discountSize: ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Наполняем форму при открытии
  useEffect(() => {
    if (product) {
      setValues({
        name: product.name ?? product.Name ?? '',
        price: product.price ?? product.Price ?? '',
        quantity: product.quantity ?? product.Quantity ?? '',
        description: product.description ?? product.Description ?? '',
        discountSize: product.discountSize ?? product.DiscountSize ?? ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!values.name.trim()) return 'Введите название';
    if (!values.price || parseFloat(values.price) <= 0) return 'Укажите корректную цену';
    if (values.quantity === '' || parseInt(values.quantity) < 0) return 'Укажите количество';
    
    const discount = parseFloat(values.discountSize);
    if (values.discountSize && (discount < 0 || discount > 100)) {
      return 'Скидка должна быть от 0 до 100%';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setBusy(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('Name', values.name.trim());
      formData.append('Price', parseFloat(values.price));
      formData.append('Quantity', parseInt(values.quantity));
      formData.append('Description', values.description.trim());
      
      if (values.discountSize !== '') {
        formData.append('DiscountSize', parseFloat(values.discountSize));
      }

      await productsApi.update(product.id ?? product.Id, formData);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Ошибка при сохранении');
    } finally {
      setBusy(false);
    }
  };

  return { values, busy, error, handleChange, handleSubmit };
}