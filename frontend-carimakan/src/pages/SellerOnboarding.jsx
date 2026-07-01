import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'

function SellerOnboarding() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: user?.phone || '',
  })
  const [logo, setLogo] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => fd.append(key, value))
      if (logo) fd.append('logo', logo)

      await api.post('/stores', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat toko')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-3">Toko Berhasil Dibuat!</h1>
        <p className="text-gray-500 mb-8">
          Toko kamu sedang menunggu persetujuan admin. Setelah disetujui, kamu bisa
          mulai menambahkan menu.
        </p>
        <button
          onClick={() => navigate('/seller/dashboard')}
          className="bg-[#c90045] text-white px-8 py-3 rounded-full hover:opacity-90 transition"
        >
          Ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-2">
        Buat Toko Kamu
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Lengkapi data toko untuk mulai berjualan di CariMakan
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-semibold text-sm">Nama Toko</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={3}
            placeholder="Contoh: Warung Bu Tini"
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045]"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Ceritakan tentang tokomu"
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045]"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Alamat</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            placeholder="Alamat toko"
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045]"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">No. Telepon Toko</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045]"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Logo Toko (opsional)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setLogo(e.target.files[0])}
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045] bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c90045] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Membuat toko...' : 'Buat Toko'}
        </button>
      </form>
    </div>
  )
}

export default SellerOnboarding
