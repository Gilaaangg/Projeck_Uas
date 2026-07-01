import { Link } from 'react-router-dom'

/**
 * FoodCard - kartu makanan yang bisa dipakai ulang di Home & Menu.
 *
 * Props:
 * - item: { id, name, category, price, rating, stock, bestSeller, image, storeName }
 * - showBadge: tampilkan badge "Best Seller" jika item.bestSeller true (default: false)
 * - showAddToCart: tampilkan tombol "Tambah" ke keranjang (default: false)
 * - onAddToCart: handler saat tombol "Tambah" diklik
 */
function FoodCard({ item, showBadge = false, showAddToCart = false, onAddToCart }) {
  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
      {/* Badge Best Seller */}
      {showBadge && item.bestSeller && (
        <span className="absolute top-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold z-10">
          Best Seller
        </span>
      )}

      <img
        src={item.image}
        alt={item.name}
        className="w-full h-56 object-cover"
      />

      <div className="p-5">
        <div className="flex justify-between items-start">
          <h2 className="font-bold text-xl">
            {item.name}
          </h2>

          <span className="text-yellow-500">⭐ {item.rating}</span>
        </div>

        <p className="text-sm text-gray-500">
          {item.category}
          {item.storeName && (
            <span className="text-gray-400"> · {item.storeName}</span>
          )}
        </p>

        <p className="font-bold text-[#c90045] mt-2">
          Rp {item.price.toLocaleString()}
        </p>

        <p className="mt-2">
          {item.stock > 0 ? (
            <span className="text-green-600 text-sm">
              Tersedia ({item.stock})
            </span>
          ) : (
            <span className="text-red-500 text-sm">
              Stok Habis
            </span>
          )}
        </p>

        <div className="flex gap-3 mt-5">
          <Link
            to={`/product/${item.id}`}
            className="px-4 py-2 rounded-lg border hover:border-[#c90045] hover:text-[#c90045] transition"
          >
            Detail
          </Link>

          {showAddToCart && (
            <button
              onClick={() => onAddToCart?.(item)}
              disabled={item.stock === 0}
              className={`px-4 py-2 rounded-lg text-white transition ${
                item.stock > 0
                  ? 'bg-[#c90045] hover:opacity-90'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Tambah
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FoodCard
