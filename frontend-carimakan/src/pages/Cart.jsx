import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { Link, Navigate } from 'react-router-dom'

function Cart() {
  const { user } = useContext(AuthContext)
  const {
    cartItems,
    totalPrice,
    loading,
    removeFromCart,
    updateQuantity,
  } = useContext(CartContext)

  if (!user) {
    return <Navigate to="/login" state={{ from: '/cart' }} replace />
  }

  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty < 1) return
    try {
      await updateQuantity(cartItemId, newQty)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah jumlah')
    }
  }

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus item')
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Keranjang
      </h1>

      {loading ? (
        <p className="text-gray-500">Memuat keranjang...</p>
      ) : cartItems.length === 0 ? (
        <p>Keranjang kosong</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center gap-4 bg-white p-4 rounded-xl"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h2 className="font-bold">
                    {item.name}
                  </h2>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-[#c90045] hover:text-[#c90045]"
                    >
                      -
                    </button>
                    <span>Qty: {item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-[#c90045] hover:text-[#c90045]"
                    >
                      +
                    </button>
                  </div>

                  <p className="mt-1">
                    Rp{' '}
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleRemove(item.cartItemId)
                  }
                  className="text-red-500"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold">
              Total: Rp{' '}
              {totalPrice.toLocaleString()}
            </h2>

            <Link
              to="/checkout"
              className="inline-block mt-4 bg-[#c90045] text-white px-6 py-3 rounded-lg"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
