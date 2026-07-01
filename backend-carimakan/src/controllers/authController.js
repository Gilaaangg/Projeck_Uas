const jwt = require('jsonwebtoken');
const { User, Store } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'buyer', phone, address } = req.body;

    // Role yang boleh didaftarkan sendiri hanya buyer & seller
    const allowedRoles = ['buyer', 'seller'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Role tidak valid' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email sudah digunakan' });
    }

    const user = await User.create({ name, email, password, role, phone, address });
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = generateToken(user);

    // Kalau seller, sertakan info toko juga
    let storeInfo = null;
    if (user.role === 'seller') {
      storeInfo = await Store.findOne({ where: { userId: user.id } });
    }

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: { user, token, store: storeInfo },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/profile (protected)
const getProfile = async (req, res, next) => {
  try {
    let storeInfo = null;
    if (req.user.role === 'seller') {
      storeInfo = await Store.findOne({ where: { userId: req.user.id } });
    }

    return res.status(200).json({
      success: true,
      data: { user: req.user, store: storeInfo },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile (protected) — update profil sendiri
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    await req.user.update({ name, phone, address });

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diupdate',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
