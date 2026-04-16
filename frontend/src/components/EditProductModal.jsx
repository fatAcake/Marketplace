import { useState, useEffect } from 'react'
import * as productsApi from '../api/products.js'
import { apiFetchMultipart } from '../api/http.js'

export function EditProductModal({ product, token, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [discountSize, setDiscountSize] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setName(product.name ?? product.Name ?? '')
      setPrice(product.price ?? product.Price ?? '')
      setQuantity(product.quantity ?? product.Quantity ?? '')
      setDescription(product.description ?? product.Description ?? '')
      setDiscountSize(product.discountSize ?? product.DiscountSize ?? '')
    }
  }, [product])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Введите название'); return }
    if (!price || parseFloat(price) <= 0) { setError('Укажите корректную цену'); return }
    if (!quantity || parseInt(quantity) < 0) { setError('Укажите корректное количество'); return }
    if (discountSize !== '' && discountSize != null && (parseFloat(discountSize) < 0 || parseFloat(discountSize) > 100)) {
      setError('Скидка должна быть от 0 до 100%')
      return
    }

    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('Name', name.trim())
      formData.append('Price', parseFloat(price))
      formData.append('Quantity', parseInt(quantity))
      if (description.trim()) {
        formData.append('Description', description.trim())
      }
      if (discountSize !== '' && discountSize != null) {
        formData.append('DiscountSize', parseFloat(discountSize))
      }

      await apiFetchMultipart(`/api/products/${product.id ?? product.Id}`, {
        method: 'PUT',
        token,
        formData,
      })
      onSuccess()
    } catch (e) {
      setError(e?.message || 'Не удалось обновить товар')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-edit" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать товар</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit} className="edit-product-form">
            <label>
              Название
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название товара"
                maxLength={200}
                required
              />
            </label>

            <div className="edit-product-row">
              <label>
                Цена (₽)
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Количество (шт.)
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  min="0"
                  step="1"
                  required
                />
              </label>
            </div>

            <label>
              Скидка (%)
              <input
                type="number"
                value={discountSize}
                onChange={(e) => setDiscountSize(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="1"
              />
              <span className="edit-product-hint">Оставьте пустым, если скидки нет</span>
            </label>

            <label>
              Описание
              <textarea
                className="edit-product-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите ваш товар..."
                maxLength={2000}
                rows={4}
              />
              <span className="edit-product-counter">{description.length}/2000</span>
            </label>

            <div className="edit-product-actions">
              <button className="btn btn-secondary" type="button" onClick={onClose} disabled={busy}>
                Отмена
              </button>
              <button className="btn btn-primary-navy" type="submit" disabled={busy}>
                {busy ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
