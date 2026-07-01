import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

// Bungkus halaman yang butuh login. Kalau perlu role tertentu, kirim prop `role`.
function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Memuat...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
