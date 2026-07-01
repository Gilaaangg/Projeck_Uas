const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi').isLength({ min: 3 }).withMessage('Nama minimal 3 karakter'),
  body('email').trim().notEmpty().withMessage('Email wajib diisi').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib diisi').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role').optional().isIn(['buyer', 'seller']).withMessage('Role hanya boleh buyer atau seller'),
  validate,
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email wajib diisi').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib diisi'),
  validate,
];

const createFoodValidation = [
  body('name').trim().notEmpty().withMessage('Nama makanan wajib diisi'),
  body('description').trim().notEmpty().withMessage('Deskripsi wajib diisi'),
  body('price').notEmpty().withMessage('Harga wajib diisi').isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('categoryId').notEmpty().withMessage('Kategori wajib dipilih').isInt({ min: 1 }).withMessage('categoryId tidak valid'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stok tidak valid'),
  validate,
];

const updateFoodValidation = [
  body('name').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('description').optional().trim().notEmpty().withMessage('Deskripsi tidak boleh kosong'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId tidak valid'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stok tidak valid'),
  validate,
];

const addToCartValidation = [
  body('foodId').notEmpty().withMessage('foodId wajib diisi').isInt({ min: 1 }).withMessage('foodId tidak valid'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity minimal 1'),
  body('notes').optional().isString().isLength({ max: 255 }),
  validate,
];

const updateCartValidation = [
  body('quantity').notEmpty().withMessage('Quantity wajib diisi').isInt({ min: 0 }).withMessage('Quantity tidak valid'),
  validate,
];

const toggleFavoriteValidation = [
  body('foodId').notEmpty().withMessage('foodId wajib diisi').isInt({ min: 1 }).withMessage('foodId tidak valid'),
  validate,
];

const addRatingValidation = [
  body('foodId').notEmpty().withMessage('foodId wajib diisi').isInt({ min: 1 }).withMessage('foodId tidak valid'),
  body('rating').notEmpty().withMessage('Rating wajib diisi').isInt({ min: 1, max: 5 }).withMessage('Rating harus 1-5'),
  body('review').optional().isString(),
  validate,
];

module.exports = {
  registerValidation, loginValidation, createFoodValidation, updateFoodValidation,
  addToCartValidation, updateCartValidation, toggleFavoriteValidation, addRatingValidation,
};
