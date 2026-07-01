import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import api from '../api/axios'
import { AuthContext } from './AuthContext'

// eslint-disable-next-line react-refresh/only-export-components -- context + provider kept together intentionally
export const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [cartItems, setCartItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  // Normalisasi 1 item cart dari backend -> bentuk yang dipakai UI (sama seperti dummy data dulu)
  const normalizeItem = (cartRow) => ({
    cartItemId: cartRow.id,
    id: cartRow.food?.id,
    name: cartRow.food?.name,
    price: Number(cartRow.food?.price || 0),
    image: cartRow.food?.imageUrl,
    quantity: cartRow.quantity,
    notes: cartRow.notes,
  })

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      setTotalPrice(0)
      return
    }
    setLoading(true)
    try {
      const res = await api.get('/cart')
      const { items, totalPrice: tp } = res.data.data
      setCartItems(items.map(normalizeItem))
      setTotalPrice(tp)
    } catch (err) {
      console.error('Gagal memuat keranjang:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    fetchCart()
  }, [fetchCart])

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      throw new Error('NEED_LOGIN')
    }
    await api.post('/cart', { foodId: product.id, quantity })
    await fetchCart()
  }

  const removeFromCart = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`)
    await fetchCart()
  }

  const updateQuantity = async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity })
    await fetchCart()
  }

  const clearCart = async () => {
    await api.delete('/cart/clear')
    await fetchCart()
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
