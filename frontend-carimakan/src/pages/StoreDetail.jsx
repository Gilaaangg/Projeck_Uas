import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import FoodCard from '../components/FoodCard';
import { mapFoodsToProducts } from '../utils/mapFood';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

function StoreDetail() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/stores/${id}`);
        setStore(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Toko tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchStore();
  }, [id]);

  const handleAddToCart = async (item) => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambahkan ke keranjang.');
      return;
    }
    try {
      await addToCart(item);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    }
  };

  if (loading) {
    return <p className="text-gray-500 text-center py-10">Memuat detail toko...</p>;
  }

  if (error || !store) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-gray-800 mb-4">{error || 'Toko tidak ditemukan'}</h1>
        <Link to="/stores" className="text-[#c90045] font-semibold hover:underline">
          ← Kembali ke Daftar Toko
        </Link>
      </div>
    );
  }

  const products = mapFoodsToProducts(store.foods || []);

  return (
    <>
      <Link to="/stores" className="inline-block text-[#c90045] mb-6 font-medium hover:underline">
        ← Kembali
      </Link>

      <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl overflow-hidden shrink-0 shadow-inner">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : '🏪'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
            <p className="text-gray-600 mb-2">{store.description || 'Toko ini tidak memiliki deskripsi.'}</p>
            <div className="flex gap-4 text-sm text-gray-500 mb-2">
              {store.address && <span>📍 {store.address}</span>}
              {store.owner?.phone && <span>📞 {store.owner.phone}</span>}
            </div>
            {parseFloat(store.ratingAverage) > 0 && (
              <div className="flex items-center gap-2 mt-1 text-sm bg-yellow-50 px-3 py-1 rounded-full w-fit border border-yellow-200">
                <span className="text-yellow-500">★</span>
                <span className="font-bold text-gray-800">{store.ratingAverage}</span>
                <span className="text-gray-500">({store.ratingCount} Ulasan)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Menu dari {store.name}</h2>

      {products.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              showBadge
              showAddToCart
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-3xl block mb-3">🍳</span>
          <p>Toko ini belum menambahkan menu apa pun.</p>
        </div>
      )}
    </>
  );
}

export default StoreDetail;
