import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import * as productsApi from '../api/products.js'

export function CreateProductPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function handleFiles(files) {
    const fileArr = Array.from(files)
    setImages((prev) => [...prev, ...fileArr])

    // Превью
    fileArr.forEach((file) => {
      const url = URL.createObjectURL(file)
      setImagePreviews((prev) => [...prev, url])
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  function removeImage(index) {
    URL.revokeObjectURL(imagePreviews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Введите название'); return }
    if (!price || parseFloat(price) <= 0) { setError('Укажите корректную цену'); return }
    if (!quantity || parseInt(quantity) < 1) { setError('Укажите количество'); return }

    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('Name', name.trim())
      formData.append('Price', parseFloat(price))
      formData.append('Quantity', parseInt(quantity))
      formData.append('Description', description.trim())
      images.forEach((img) => formData.append('Images', img))

      const product = await productsApi.createProduct(formData, token)
      navigate(`/products/${product.id}`, { replace: true })
    } catch (e) {
      setError(e?.message || 'Не удалось создать товар')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="create-product-section">
      <Link className="btn btn-back-link" to="/me">← Назад в профиль</Link>

      <h1 className="create-product-title">Добавить товар</h1>

      {error && <div className="alert error">{error}</div>}

      <form className="create-product-form" onSubmit={handleSubmit}>
        {/* Основные поля */}
        <div className="create-product-fields">
          <label>
            Название
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название товара"
              maxLength={200}
            />
          </label>

          <div className="create-product-row">
            <label>
              Цена (₽)
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </label>
            <label>
              Количество (шт.)
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                min="1"
                step="1"
              />
            </label>
          </div>

          <label>
            Описание
            <textarea
              className="create-product-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите ваш товар..."
              maxLength={2000}
              rows={4}
            />
            <span className="create-product-counter">{description.length}/2000</span>
          </label>
        </div>

        {/* Загрузка изображений */}
        <div className="create-product-images">
          <h3>Изображения</h3>

          <div
            className="create-product-dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--blue-gray)" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Перетащите файлы или <span>нажмите для выбора</span></p>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="create-product-previews">
              {imagePreviews.map((src, i) => (
                <div className="create-product-preview" key={i}>
                  <img src={src} alt="" />
                  <button
                    type="button"
                    className="create-product-remove"
                    onClick={() => removeImage(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка */}
        <div className="create-product-submit">
          <button className="btn btn-primary-navy btn-lg" type="submit" disabled={busy}>
            {busy ? 'Создание...' : 'Создать товар'}
          </button>
        </div>
      </form>
    </section>
  )
}
