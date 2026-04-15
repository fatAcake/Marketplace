import { useCallback, useMemo, useState, useEffect } from 'react'
import { CartContext } from './CartContext.js'

const STORAGE_KEY = 'mp_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      const maxStock = product.stock ?? existing?.stock

      if (existing) {
        const nextQuantity = existing.quantity + 1
        if (maxStock != null && nextQuantity > maxStock) {
          return prev
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: nextQuantity } : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice ?? null,
          discountSize: product.discountSize ?? null,
          quantity: 1,
          stock: maxStock ?? null,
          userId: product.userId,
          imageUrl: product.imageUrl ?? null,
        },
      ]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== productId) return i
        const maxStock = i.stock
        const finalQuantity = maxStock != null ? Math.min(quantity, maxStock) : quantity
        return { ...i, quantity: finalQuantity }
      })
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  const totalPrice = useMemo(() => {
    return items.reduce((sum, i) => {
      const unitPrice = i.discountedPrice ?? i.price
      return sum + unitPrice * i.quantity
    }, 0)
  }, [items])

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
