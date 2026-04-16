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
  const [discountSize, setDiscountSize] = useState('')
  const [discountStartDate, setDiscountStartDate] = useState('')
  const [discountEndDate, setDiscountEndDate] = useState('')
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function handleFiles(files) {
    const fileArr = Array.from(files)
    setImages((prev) => [...prev, ...fileArr])

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
    if (discountSize !== '' && (parseFloat(discountSize) < 0 || parseFloat(discountSize) > 100)) {
      setError('Скидка должна быть от 0 до 100%')
      return
    }
    if (discountStartDate && discountEndDate && new Date(discountEndDate) <= new Date(discountStartDate)) {
      setError('Дата окончания должна быть позже даты начала')
      return
    }

    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('Name', name.trim())
      formData.append('Price', parseFloat(price))
      formData.append('Quantity', parseInt(quantity))
      formData.append('Description', description.trim())
      if (discountSize !== '' && discountSize != null) {
        formData.append('DiscountSize', parseFloat(discountSize))
      }
      if (discountStartDate) {
        formData.append('DiscountStartDate', new Date(discountStartDate).toISOString())
      }
      if (discountEndDate) {
        formData.append('DiscountEndDate', new Date(discountEndDate).toISOString())
      }
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
      <Link className="btn-back-link" to="/me">← Назад в профиль</Link>

      <h1 className="create-product-title">Новый товар</h1>

      {error && <div className="alert error">{error}</div>}

      <form className="create-product-form" onSubmit={handleSubmit}>
        <div className="create-product-card">
          <div className="create-product-fields">
            <label className="field-label">
              Название товара
              <input
                className="auth-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Духи Dior"
                maxLength={200}
              />
            </label>

            <div className="create-product-row">
              <label className="field-label">
                Цена (₽)
                <input
                  className="auth-input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
              </label>
              <label className="field-label">
                Количество (шт.)
                <input
                  className="auth-input"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  min="1"
                  step="1"
                />
              </label>
            </div>

            <label className="field-label">
              Скидка (%)
              <input
                className="auth-input"
                type="number"
                value={discountSize}
                onChange={(e) => setDiscountSize(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="1"
              />
              <span className="field-hint">Оставьте пустым, если скидки нет</span>
            </label>

            {discountSize && (
              <div className="create-product-row">
                <label className="field-label">
                  Начало акции
                  <input
                    className="auth-input"
                    type="datetime-local"
                    value={discountStartDate}
                    onChange={(e) => setDiscountStartDate(e.target.value)}
                  />
                </label>
                <label className="field-label">
                  Окончание акции
                  <input
                    className="auth-input"
                    type="datetime-local"
                    value={discountEndDate}
                    onChange={(e) => setDiscountEndDate(e.target.value)}
                  />
                </label>
              </div>
            )}

            <label className="field-label">
              Описание товара
              <textarea
                className="create-product-textarea auth-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Расскажите о товаре..."
                maxLength={2000}
                rows={5}
              />
              <span className="create-product-counter">{description.length} / 2000</span>
            </label>
          </div>
        </div>

        <div className="create-product-card">
          <h3 className="section-subtitle">Медиафайлы</h3>
          <div
            className="create-product-dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div className="dropzone-icon"><i class="bi bi-camera"></i></div>
            <p>Перетащите фото сюда или <span>выберите на устройстве</span></p>
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

        <div className="create-product-submit">
          <button className="btn-primary-glow btn-wide" type="submit" disabled={busy}>
            {busy ? 'Публикация...' : 'Опубликовать товар'}
          </button>
        </div>
      </form>
    </section>
  )
}
