require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./src/models');
const errorHandler = require('./src/middlewares/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const storeRoutes = require('./src/routes/storeRoutes');
const foodRoutes = require('./src/routes/foodRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const ratingRoutes = require('./src/routes/ratingRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
// Akses via: http://localhost:5000/uploads/menus/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/contacts', contactRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🍽️ CariMakan API v2 — Multi-Seller',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      stores: '/api/stores',
      foods: '/api/foods',
      cart: '/api/cart',
      favorites: '/api/favorites',
      ratings: '/api/ratings',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint tidak ditemukan: ${req.method} ${req.path}` });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil');
    await sequelize.sync({ alter: true });
    console.log('✅ Tabel tersinkronisasi');
    app.listen(PORT, () => {
      console.log(`\n🚀 Server: http://localhost:${PORT}`);
      console.log(`🖼️  Uploads: http://localhost:${PORT}/uploads/`);
    });
  } catch (error) {
    console.error('❌ Gagal koneksi database:', error.message);
    process.exit(1);
  }
};

startServer();
