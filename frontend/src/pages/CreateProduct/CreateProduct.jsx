import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import * as productsApi from '../api/products.js';
import { validateProduct } from './CreateProduct.utils';
import s from './CreateProduct.module.css';

export function CreateProductPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Объединяем поля в один объект
  const [form, setForm] = useState({
    name: '', price: '', quantity: '', description: '',
    discountSize: '', discountStartDate: '', discountEndDate: ''
  });
  
  const [files, setFiles] = useState({ images: [], previews: [] });
  const [status, setStatus] = useState({ busy: false, error: '' });

  // Очистка URL-превью при размонтировании (профилактика утечек памяти)
  useEffect(() => {
    return () => files.previews.forEach(url => URL.revokeObjectURL(url));
  }, [files.previews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (incomingFiles) => {
    const newFiles = Array.from(incomingFiles);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setFiles(prev => ({
      images: [...prev.images, ...newFiles],
      previews: [...prev.previews, ...newPreviews]
    }));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(files.previews[index]);
    setFiles(prev => ({
      images: prev.images.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateProduct(form, files.images);
    if (error) return setStatus({ ...status, error });

    setStatus({ busy: true, error: '' });
    
    try {
      const formData = new FormData();
      // Автоматизируем добавление текстовых полей
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '') {
          // Приводим ключи к PascalCase для бэкенда, если нужно
          const backendKey = key.charAt(0).toUpperCase() + key.slice(1);
          formData.append(backendKey, val);
        }
      });
      files.images.forEach(img => formData.append('Images', img));

      const product = await productsApi.createProduct(formData, token);
      navigate(`/products/${product.id}`, { replace: true });
    } catch (err) {
      setStatus({ busy: false, error: err.message || 'Ошибка сервера' });
    }
  };

  return (
    <section className={s.container}>
      <header className={s.header}>
        <Link to="/me" className="btn-link">← В профиль</Link>
        <h1>Новый товар</h1>
      </header>

      <form onSubmit={handleSubmit} className={s.form}>
        {status.error && <div className="alert error">{status.error}</div>}
        
        <div className={s.mainFields}>
          <InputField label="Название" name="name" value={form.name} onChange={handleChange} />
          
          <div className="row">
            <InputField label="Цена" name="price" type="number" value={form.price} onChange={handleChange} />
            <InputField label="Количество" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
          </div>

          <label className={s.label}>
            Описание
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              maxLength={2000}
            />
            <small>{form.description.length}/2000</small>
          </label>
        </div>

        {/* Секция с изображениями */}
        <div className={s.imageSection}>
          <Dropzone onUpload={handleFiles} />
          <div className={s.previewGrid}>
            {files.previews.map((src, i) => (
              <div key={src} className={s.thumb}>
                <img src={src} alt="" />
                <button type="button" onClick={() => removeImage(i)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-lg" disabled={status.busy}>
          {status.busy ? 'Создаем...' : 'Опубликовать'}
        </button>
      </form>
    </section>
  );
}

// Мини-компоненты
function InputField({ label, ...props }) {
  return (
    <label className={s.label}>
      {label}
      <input {...props} />
    </label>
  );
}

function Dropzone({ onUpload }) {
  return (
    <div className={s.dropzone} onClick={() => document.getElementById('fileInput').click()}>
      <p>Кликните или перетащите фото сюда</p>
      <input 
        id="fileInput" 
        type="file" 
        multiple 
        hidden 
        accept="image/*" 
        onChange={e => onUpload(e.target.files)} 
      />
    </div>
  );
}