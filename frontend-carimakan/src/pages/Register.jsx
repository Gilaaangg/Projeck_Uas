import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Register() {
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await register(form)
      if (user.role === 'seller') {
        navigate('/seller/onboarding')
      } else {
        navigate('/')
      }
    } catch (err) {
      const apiError = err.response?.data
      setError(apiError?.errors?.[0]?.message || apiError?.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-2">
        Buat Akun Baru
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Daftar untuk mulai memesan atau berjualan
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Pilihan role */}
        <div>
          <label className="font-semibold text-sm">Daftar sebagai</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'buyer' })}
              className={`py-3 rounded-lg border font-medium transition ${
                form.role === 'buyer'
                  ? 'bg-[#c90045] text-white border-[#c90045]'
                  : 'bg-white text-gray-600 hover:border-[#c90045]'
              }`}
            >
              🛒 Pembeli
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'seller' })}
              className={`py-3 rounded-lg border font-medium transition ${
                form.role === 'seller'
                  ? 'bg-[#c90045] text-white border-[#c90045]'
                  : 'bg-white text-gray-600 hover:border-[#c90045]'
              }`}
            >
              🏪 Penjual
            </button>
          </div>
        </div>

        <div>
          <label className="font-semibold text-sm">Nama Lengkap</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={3}
            placeholder="Nama kamu"
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045]"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="nama@email.com"
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045]"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">No. Telepon (opsional)</label>
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
          <label className="font-semibold text-sm">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Minimal 6 karakter"
            className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#c90045]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c90045] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-[#c90045] font-semibold hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}

export default Register
