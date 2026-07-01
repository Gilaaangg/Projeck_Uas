import { useState } from 'react';
import axios from 'axios';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/contacts', formData);
      if (response.data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengirim pesan.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#c90045] mb-4">Hubungi Kami</h1>
        <p className="text-gray-600">
          Ada pertanyaan, saran, atau keluhan? Jangan ragu untuk menghubungi tim Foody!
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {status === 'success' && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p className="font-bold">Berhasil!</p>
            <p>Pesan Anda telah terkirim. Kami akan segera merespon melalui email Anda.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Gagal!</p>
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c90045] focus:border-transparent transition-all"
                placeholder="Masukkan nama Anda"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c90045] focus:border-transparent transition-all"
                placeholder="email@contoh.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subjek (Opsional)</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c90045] focus:border-transparent transition-all"
              placeholder="Perihal pesan Anda"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c90045] focus:border-transparent transition-all"
              placeholder="Tulis pesan Anda di sini..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#c90045] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#a00037] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Mengirim...' : 'Kirim Pesan'}
          </button>
        </form>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-[#fff5f5] rounded-xl">
          <div className="text-3xl mb-3">📍</div>
          <h3 className="font-bold text-[#c90045] mb-2">Alamat</h3>
          <p className="text-sm text-gray-600">Jl. Foody Raya No. 123<br/>Jakarta Selatan, 12345</p>
        </div>
        <div className="p-6 bg-[#fff5f5] rounded-xl">
          <div className="text-3xl mb-3">📞</div>
          <h3 className="font-bold text-[#c90045] mb-2">Telepon</h3>
          <p className="text-sm text-gray-600">+62 21 1234 5678<br/>0812-3456-7890</p>
        </div>
        <div className="p-6 bg-[#fff5f5] rounded-xl">
          <div className="text-3xl mb-3">✉️</div>
          <h3 className="font-bold text-[#c90045] mb-2">Email</h3>
          <p className="text-sm text-gray-600">support@foody.com<br/>info@foody.com</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;