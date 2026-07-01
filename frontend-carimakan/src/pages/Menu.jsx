import { useState, useContext, useEffect } from 'react'

import { useFoods } from '../hooks/useFoods'
import { mapFoodsToProducts } from '../utils/mapFood'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import FoodCard from '../components/FoodCard'
import SearchBar from '../components/SearchBar'

function Menu() {
  const [categories, setCategories] = useState(['Semua'])
  const [selected, setSelected] = useState('Semua')
  const [search, setSearch] = useState('')

  const { user } = useContext(AuthContext)
  const { addToCart } = useContext(CartContext)
  const { foods, loading, error } = useFoods({ category: selected })

  const filteredProducts = mapFoodsToProducts(foods).filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  // Fetch kategori dari backend
  useEffect(() => {
    api.get('/categories').then((res) => {
      const names = res.data.data.map((c) => c.name)
      setCategories(['Semua', ...names])
    }).catch(() => {
      // fallback ke default jika gagal
      setCategories(['Semua', 'Makanan', 'Minuman', 'Cemilan'])
    })
  }, [])

  const handleAddToCart = async (item) => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambahkan ke keranjang.')
      return
    }
    try {
      await addToCart(item)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang')
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-4xl font-bold">
          Menu Kami
        </h1>

        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        {/* Filter Kategori */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelected(category)}
              className={`px-5 py-2 rounded-full border transition ${
                selected === category
                  ? 'bg-[#c90045] text-white border-[#c90045]'
                  : 'bg-white text-gray-700 hover:border-[#c90045] hover:text-[#c90045]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <p className="text-gray-500 mb-6">
        Menampilkan kategori:{' '}
        <span className="font-semibold text-[#c90045]">
          {selected}
        </span>
      </p>

      {loading && (
        <p className="text-gray-500 text-center py-10">Memuat menu...</p>
      )}

      {error && (
        <p className="text-red-500 text-center py-10">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredProducts.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              showBadge
              showAddToCart
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Tidak ada menu pada kategori ini.
        </div>
      )}
    </>
  )
}

export default Menu
