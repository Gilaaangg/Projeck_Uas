import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-20 pt-8 border-t border-gray-200 text-sm text-gray-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-bold text-[#c90045] text-lg">
          🍎 Foody
        </p>

        <ul className="flex gap-6">
          <li>
            <Link to="/" className="hover:text-[#c90045]">
              Home
            </Link>
          </li>
          <li>
            <Link to="/menu" className="hover:text-[#c90045]">
              Menu
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-[#c90045]">
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex gap-4 text-lg text-[#c90045]">
          <span>📘</span>
          <span>📷</span>
          <span>🐦</span>
        </div>
      </div>

      <p className="text-center mt-6 text-gray-400">
        © {new Date().getFullYear()} Foody - CariMakan. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
