import { useProductForm } from './useProductForm';

export function EditProductModal({ product, onClose, onSuccess }) {
  const { values, busy, error, handleChange, handleSubmit } = useProductForm(product, onSuccess);

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
            <div className="form-group">
              <label>Название</label>
              <input
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                placeholder="Введите название товара"
                required
              />
            </div>

            <div className="edit-product-row">
              <div className="form-group">
                <label>Цена (₽)</label>
                <input
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Количество (шт.)</label>
                <input
                  name="quantity"
                  type="number"
                  value={values.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Скидка (%)</label>
              <input
                name="discountSize"
                type="number"
                value={values.discountSize}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={4}
              />
              <small className="counter">{values.description.length}/2000</small>
            </div>

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
  );
}