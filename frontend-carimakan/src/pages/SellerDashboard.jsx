import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function SellerDashboard() {
  const [store, setStore] = useState(null)
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [storeError, setStoreError] = useState('')

  // Modal state — menu
  const [showModal, setShowModal] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', stock: '' })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Modal state — edit toko
  const [showStoreModal, setShowStoreModal] = useState(false)
  const [storeForm, setStoreForm] = useState({ name: '', description: '', address: '', phone: '' })
  const [storeBanner, setStoreBanner] = useState(null)
  const [storeSaving, setStoreSaving] = useState(false)
  const [storeFormError, setStoreFormError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setStoreError('')
    try {
      const [storeRes, catRes] = await Promise.all([
        api.get('/stores/seller/my'),
        api.get('/categories'),
      ])
      const storeData = storeRes.data.data
      setStore(storeData)
      setCategories(catRes.data.data)

      // Hanya fetch foods jika toko sudah approved
      if (storeData?.status === 'approved') {
        const foodRes = await api.get('/foods/seller/my')
        setFoods(foodRes.data.data)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setStoreError('NO_STORE')
      } else {
        setStoreError(err.response?.data?.message || 'Gagal memuat data toko')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    loadData()
  }, [loadData])

  const openCreateModal = () => {
    setEditingFood(null)
    setForm({ name: '', description: '', price: '', categoryId: categories[0]?.id || '', stock: 999 })
    setImageFile(null)
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (food) => {
    setEditingFood(food)
    setForm({
      name: food.name,
      description: food.description,
      price: food.price,
      categoryId: food.categoryId,
      stock: food.stock,
    })
    setImageFile(null)
    setFormError('')
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => fd.append(key, value))
      if (imageFile) fd.append('image', imageFile)

      if (editingFood) {
        await api.put(`/foods/${editingFood.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.post('/foods', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      setShowModal(false)
      await loadData()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan menu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (food) => {
    if (!confirm(`Hapus menu "${food.name}"?`)) return
    try {
      await api.delete(`/foods/${food.id}`)
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus menu')
    }
  }

  const handleToggleOpen = async () => {
    try {
      const fd = new FormData()
      fd.append('isOpen', !store.isOpen)
      await api.put('/stores/seller/my', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status toko')
    }
  }

  const openStoreModal = () => {
    setStoreForm({
      name: store?.name || '',
      description: store?.description || '',
      address: store?.address || '',
      phone: store?.phone || '',
    })
    setStoreBanner(null)
    setStoreFormError('')
    setShowStoreModal(true)
  }

  const handleStoreSave = async (e) => {
    e.preventDefault()
    setStoreSaving(true)
    setStoreFormError('')
    try {
      const fd = new FormData()
      Object.entries(storeForm).forEach(([k, v]) => fd.append(k, v))
      if (storeBanner) fd.append('banner', storeBanner)
      await api.put('/stores/seller/my', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowStoreModal(false)
      await loadData()
    } catch (err) {
      setStoreFormError(err.response?.data?.message || 'Gagal menyimpan data toko')
    } finally {
      setStoreSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Memuat dashboard...</div>
  }

  // Belum punya toko sama sekali
  if (storeError === 'NO_STORE') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">🏪</div>
        <h1 className="text-2xl font-bold mb-3">Kamu Belum Punya Toko</h1>
        <p className="text-gray-500 mb-8">Buat toko terlebih dahulu untuk mulai berjualan.</p>
        <Link
          to="/seller/onboarding"
          className="inline-block bg-[#c90045] text-white px-8 py-3 rounded-full hover:opacity-90 transition"
        >
          Buat Toko Sekarang
        </Link>
      </div>
    )
  }

  // Toko ada tapi status pending/rejected — tampilkan info status
  if (store && store.status !== 'approved') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">{store.status === 'rejected' ? '❌' : '⏳'}</div>
        <h1 className="text-2xl font-bold mb-3">
          {store.status === 'rejected' ? 'Toko Ditolak' : 'Toko Belum Aktif'}
        </h1>
        <p className="text-gray-500 mb-2">Nama Toko: <strong>{store.name}</strong></p>
        <p className="text-gray-500">
          {store.status === 'rejected'
            ? 'Toko kamu ditolak oleh admin. Hubungi admin untuk informasi lebih lanjut.'
            : 'Toko kamu sedang menunggu persetujuan admin. Sabar ya! 😊'}
        </p>
      </div>
    )
  }

  // Error lain (network, dll)
  if (storeError && storeError !== 'NO_STORE') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-3">Terjadi Kesalahan</h1>
        <p className="text-gray-500">{storeError}</p>
        <button onClick={loadData} className="mt-4 bg-[#c90045] text-white px-6 py-2 rounded-full">
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{store?.name}</h1>
          <p className="text-gray-500">
            Status:{' '}
            <span className={store?.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}>
              {store?.status === 'approved' ? '✅ Aktif' : 'Menunggu persetujuan'}
            </span>
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Toggle buka/tutup toko */}
          {store?.status === 'approved' && (
            <button
              onClick={handleToggleOpen}
              className={`px-5 py-2.5 rounded-full border font-medium transition text-sm ${
                store?.isOpen
                  ? 'border-green-500 text-green-600 hover:bg-green-50'
                  : 'border-gray-400 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {store?.isOpen ? '🟢 Toko Buka' : '🔴 Toko Tutup'}
            </button>
          )}

          {/* Edit toko */}
          {store?.status === 'approved' && (
            <button
              onClick={openStoreModal}
              className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:border-[#c90045] hover:text-[#c90045] font-medium transition text-sm"
            >
              ✏️ Edit Toko
            </button>
          )}

          {store?.status === 'approved' && (
            <button
              onClick={openCreateModal}
              className="bg-[#c90045] text-white px-6 py-2.5 rounded-full hover:opacity-90 transition text-sm"
            >
              + Tambah Menu
            </button>
          )}
        </div>
      </div>

      {store?.status !== 'approved' && (
        <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg mb-6 text-sm">
          Toko kamu masih menunggu persetujuan admin. Kamu belum bisa menambahkan menu.
        </div>
      )}

      {/* Daftar menu */}
      <div className="grid md:grid-cols-3 gap-6">
        {foods.map((food) => (
          <div key={food.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img
              src={food.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
              alt={food.name}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">{food.name}</h3>
              <p className="text-sm text-gray-500">{food.category?.name}</p>
              <p className="text-[#c90045] font-semibold mt-2">
                Rp {Number(food.price).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Stok: {food.stock}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(food)}
                  className="flex-1 px-3 py-2 rounded-lg border hover:border-[#c90045] hover:text-[#c90045] transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(food)}
                  className="flex-1 px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {foods.length === 0 && store?.status === 'approved' && (
        <div className="text-center py-16 text-gray-500">
          Belum ada menu. Klik "+ Tambah Menu" untuk menambahkan menu pertamamu.
        </div>
      )}

      {/* Modal tambah/edit menu */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingFood ? 'Edit Menu' : 'Tambah Menu Baru'}
            </h2>

            {formError && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-semibold text-sm">Nama Menu</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-sm">Harga (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-sm">Stok</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-sm">Kategori</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleFormChange}
                  required
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-sm">
                  Gambar Menu {editingFood && '(kosongkan jika tidak ingin mengganti)'}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045] bg-white text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#c90045] text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal edit toko */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">✏️ Edit Informasi Toko</h2>

            {storeFormError && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                {storeFormError}
              </div>
            )}

            <form onSubmit={handleStoreSave} className="space-y-4">
              <div>
                <label className="font-semibold text-sm">Nama Toko</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  required
                  minLength={3}
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">Deskripsi</label>
                <textarea
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">Alamat</label>
                <textarea
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">No. Telepon Toko</label>
                <input
                  type="tel"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none focus:border-[#c90045]"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">Banner Toko (opsional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setStoreBanner(e.target.files[0])}
                  className="w-full border rounded-lg p-2.5 mt-1.5 outline-none bg-white text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStoreModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={storeSaving}
                  className="flex-1 bg-[#c90045] text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {storeSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard
