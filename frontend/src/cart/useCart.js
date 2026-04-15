import { useContext } from 'react'
import { CartContext } from './CartContext.js'

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
