import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';

function StoreList() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/stores', { params: { search } });
        setStores(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat daftar toko.');
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce to avoid spamming the backend API on every keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-4xl font-bold">
          Daftar Toko
        </h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Cari nama toko..." />
      </div>

      {loading && (
        <p className="text-gray-500 text-center py-10">Memuat toko...</p>
      )}

      {error && (
        <p className="text-red-500 text-center py-10">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl overflow-hidden shrink-0">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                  ) : '🏪'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{store.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    {parseFloat(store.ratingAverage) > 0 ? (
                      <>
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold text-gray-700">{store.ratingAverage}</span>
                        <span className="text-gray-400">({store.ratingCount} ulasan)</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Belum ada ulasan</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                {store.description || 'Toko ini belum menambahkan deskripsi.'}
              </p>
              <Link
                to={`/store/${store.id}`}
                className="block text-center w-full bg-[#c90045] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Kunjungi Toko
              </Link>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Tidak ada toko yang cocok dengan pencarian '{search}'.
        </div>
      )}
    </>
  );
}

export default StoreList;
