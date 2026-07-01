const { Store } = require('../models');

// Middleware: pastikan user adalah seller
const isSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Autentikasi diperlukan' });
  }
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya penjual yang diizinkan.' });
  }
  next();
};

// Middleware: pastikan seller sudah punya toko yang approved
const hasApprovedStore = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const store = await Store.findOne({ where: { userId: req.user.id } });
    if (!store) {
      return res.status(403).json({ success: false, message: 'Kamu belum membuat toko.' });
    }
    if (store.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Toko kamu masih menunggu persetujuan admin.' });
    }
    if (store.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Toko kamu ditolak oleh admin.' });
    }

    req.store = store; // inject store ke request
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isSeller, hasApprovedStore };
