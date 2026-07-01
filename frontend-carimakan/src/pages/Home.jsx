import { Link } from 'react-router-dom'
import { useBestSeller } from '../hooks/useFoods'
import { mapFoodsToProducts } from '../utils/mapFood'
import FoodCard from '../components/FoodCard'

function Home() {
  const { foods, loading } = useBestSeller()
  const bestSeller = mapFoodsToProducts(foods)

  return (
    <>
      {/* Hero Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            We ready
            <br />
            to <span className="text-[#c90045]">Deliver</span> food
            <br />
            anytime
          </h1>

          <p className="text-gray-500 mt-6 leading-7">
            Food is any substance consumed to provide
            nutritional support for an organism.
          </p>

          <div className="flex items-center gap-5 mt-8">
            <Link
              to="/menu"
              className="bg-[#c90045] text-white px-8 py-3 rounded-full hover:opacity-90 transition"
            >
              Order Now
            </Link>

            <Link
              to="/menu"
              className="flex items-center gap-3 text-[#c90045] font-medium"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
                ▶️
              </div>

              How to order
            </Link>
          </div>

          <div className="flex gap-5 mt-10 text-2xl text-[#c90045]">
            <span>📘</span>
            <span>📷</span>
            <span>🐦</span>
          </div>
        </div>

        {/* Right */}
        <div className="relative flex justify-center">
          <div className="absolute w-72 h-72 bg-[#c90045] rounded-full opacity-20 blur-3xl"></div>

          <img
            src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=700&q=80"
            alt="Chef"
            className="relative z-10 w-full max-w-md rounded-3xl"
          />

        </div>
      </div>

      {/* Best Seller */}
      <section className="mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">
            Best Seller
          </h2>

          <Link
            to="/menu"
            className="text-[#c90045] font-semibold hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Memuat menu...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {bestSeller.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {!loading && bestSeller.length === 0 && (
          <p className="text-gray-500 text-center py-10">Belum ada menu best seller.</p>
        )}
      </section>
    </>
  )
}

export default Home
