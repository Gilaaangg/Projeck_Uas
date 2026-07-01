/**
 * SearchBar - input pencarian real-time untuk filter makanan berdasarkan nama.
 *
 * Props:
 * - value: string, nilai pencarian saat ini
 * - onChange: function(string), dipanggil setiap kali user mengetik
 * - placeholder: string (opsional)
 */
function SearchBar({ value, onChange, placeholder = 'Cari makanan...' }) {
  return (
    <div className="relative w-full md:max-w-xs">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#c90045] transition"
      />
    </div>
  )
}

export default SearchBar
