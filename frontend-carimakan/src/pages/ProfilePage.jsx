import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'

function ProfilePage() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Password change state
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      const res = await api.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        address: form.address,
      })
      // Update localStorage dengan data terbaru
      const updatedUser = res.data.data
      localStorage.setItem('cm_user', JSON.stringify(updatedUser))
      setSuccess('Profil berhasil diperbarui! ✅')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.password !== pwForm.confirm) {
      setPwError('Password tidak cocok')
      return
    }
    if (pwForm.password.length < 6) {
      setPwError('Password minimal 6 karakter')
      return
    }
    setPwLoading(true)
    try {
      await api.put('/auth/profile', { password: pwForm.password })
      setPwSuccess('Password berhasil diubah! ✅')
      setPwForm({ password: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1f2937',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#6b7280',
    display: 'block',
    marginBottom: 6,
  }

  const cardStyle = {
    background: 'white',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: 20,
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #c90045, #ff3370)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', color: 'white', fontWeight: 700, flexShrink: 0,
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              {user.name}
            </h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '0.9rem' }}>
              {user.email}
              <span
                style={{
                  marginLeft: 8, padding: '2px 10px', borderRadius: 999,
                  background: '#fce7f3', color: '#c90045',
                  fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize',
                }}
              >
                {user.role}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Form edit profil */}
      <div style={cardStyle}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: 18 }}>
          👤 Informasi Profil
        </h2>

        {success && (
          <div style={{
            background: '#d1fae5', color: '#065f46', borderRadius: 10,
            padding: '10px 16px', marginBottom: 16, fontSize: '0.88rem', fontWeight: 600,
          }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{
            background: '#fee2e2', color: '#991b1b', borderRadius: 10,
            padding: '10px 16px', marginBottom: 16, fontSize: '0.88rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              style={{ ...inputStyle, background: '#f9fafb', cursor: 'not-allowed' }}
              value={user.email}
              readOnly
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Nama Lengkap <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              style={inputStyle}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={3}
              placeholder="Nama lengkap kamu"
              onFocus={(e) => (e.target.style.borderColor = '#c90045')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>No. Telepon</label>
            <input
              style={inputStyle}
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              onFocus={(e) => (e.target.style.borderColor = '#c90045')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Alamat Default</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Alamat pengiriman default kamu"
              onFocus={(e) => (e.target.style.borderColor = '#c90045')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #c90045, #ff3370)',
              color: loading ? '#9ca3af' : 'white',
              fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      {/* Ganti password */}
      <div style={cardStyle}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: 18 }}>
          🔒 Ganti Password
        </h2>

        {pwSuccess && (
          <div style={{
            background: '#d1fae5', color: '#065f46', borderRadius: 10,
            padding: '10px 16px', marginBottom: 16, fontSize: '0.88rem', fontWeight: 600,
          }}>
            {pwSuccess}
          </div>
        )}
        {pwError && (
          <div style={{
            background: '#fee2e2', color: '#991b1b', borderRadius: 10,
            padding: '10px 16px', marginBottom: 16, fontSize: '0.88rem',
          }}>
            {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password Baru</label>
            <input
              style={inputStyle}
              type="password"
              value={pwForm.password}
              onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
              onFocus={(e) => (e.target.style.borderColor = '#c90045')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Konfirmasi Password Baru</label>
            <input
              style={inputStyle}
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="Ulangi password baru"
              required
              onFocus={(e) => (e.target.style.borderColor = '#c90045')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              background: pwLoading ? '#e5e7eb' : '#374151',
              color: pwLoading ? '#9ca3af' : 'white',
              fontWeight: 700, fontSize: '0.95rem',
              cursor: pwLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {pwLoading ? 'Mengubah...' : 'Ubah Password'}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div style={cardStyle}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: 14 }}>
          ⚙️ Aksi Akun
        </h2>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '12px', borderRadius: 12, border: '2px solid #ef4444',
            background: 'white', color: '#ef4444',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = '#ef4444'
          }}
        >
          🚪 Keluar dari Akun
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
