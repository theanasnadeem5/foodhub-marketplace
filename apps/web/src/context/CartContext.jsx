import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  // cart: [{ vendorId, vendorName, deliveryFee, items: [{ menuItemId, name, price, quantity, imageUrl }] }]

  const addToCart = (vendor, item) => {
    setCart(prev => {
      const existing = prev.find(c => c.vendorId === vendor._id)
      if (existing) {
        const existingItem = existing.items.find(i => i.menuItemId === item._id)
        return prev.map(c =>
          c.vendorId !== vendor._id ? c : {
            ...c,
            items: existingItem
              ? c.items.map(i => i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i)
              : [...c.items, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl }]
          }
        )
      }
      return [...prev, {
        vendorId:    vendor._id,
        vendorName:  vendor.name,
        deliveryFee: vendor.deliveryFee || 0,
        items: [{ menuItemId: item._id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl }]
      }]
    })
  }

  const removeFromCart = (vendorId, menuItemId) => {
    setCart(prev => prev.map(c => {
      if (c.vendorId !== vendorId) return c
      const items = c.items
        .map(i => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
      return { ...c, items }
    }).filter(c => c.items.length > 0))
  }

  const clearCart = () => setCart([])

  const totalItems = cart.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.quantity, 0), 0)
  const totalPrice = cart.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.price * i.quantity, 0) + (c.deliveryFee || 0), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
