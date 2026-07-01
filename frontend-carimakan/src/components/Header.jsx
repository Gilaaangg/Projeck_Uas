import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Header() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="flex items-center justify-between mb-12 flex-wrap gap-4">
      <Link
        to="/"
        className="text-2xl font-bold text-[#c90045]"
      >
        🍎 Foody
      </Link>

      <ul className="hidden md:flex gap-8 text-gray-600">
        <li>
          <Link
            to="/"
            className="hover:text-[#c90045]"
          >
            Home
          </Link>
        </li>

        <li>
          <Link
            to="/menu"
            className="hover:text-[#c90045]"
          >
            Menu
          </Link>
        </li>

        <li>
          <Link
            to="/stores"
            className="hover:text-[#c90045]"
          >
            Toko
          </Link>
        </li>

        {user?.role !== 'admin' && (
          <li>
            <Link
              to="/contact"
              className="hover:text-[#c90045]"
            >
              Contact
            </Link>
          </li>
        )}

        <li>
          <Link
            to="/cart"
            className="hover:text-[#c90045]"
          >
            Keranjang
          </Link>
        </li>

        {user?.role === 'seller' && (
          <li>
            <Link
              to="/seller/dashboard"
              className="hover:text-[#c90045]"
            >
              Dashboard Toko
            </Link>
          </li>
        )}

        {user?.role === 'admin' && (
          <li>
            <Link
              to="/admin/dashboard"
              className="hover:text-[#c90045]"
            >
              Admin Panel
            </Link>
          </li>
        )}
      </ul>

      <div className="flex items-center gap-3">
        <Link to="/cart" className="text-2xl">
          🛒
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <a
              href="/profile"
              className="text-gray-600 text-sm hidden sm:inline hover:text-[#c90045] transition"
            >
              Hai, {user.name.split(' ')[0]}
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border hover:border-[#c90045] hover:text-[#c90045] transition text-sm"
            >
              Keluar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full border hover:border-[#c90045] hover:text-[#c90045] transition text-sm"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-[#c90045] text-white hover:opacity-90 transition text-sm"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Header
