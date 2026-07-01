const express = require('express');
const router = express.Router();
const {
  getAllFoods, getBestSeller, getFoodsByCategory,
  getFoodById, createFood, updateFood, deleteFood, getMyFoods,
} = require('../controllers/foodController');
const authenticate = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { isSeller, hasApprovedStore } = require('../middlewares/seller');
const { uploadMenuImage } = require('../middlewares/upload');

// Public
router.get('/best-seller', getBestSeller);
router.get('/category/:categoryName', getFoodsByCategory);
router.get('/', getAllFoods);
router.get('/:id', getFoodById);

// Seller — kelola menu tokonya sendiri
router.get('/seller/my', authenticate, isSeller, hasApprovedStore, getMyFoods);
router.post('/', authenticate, isSeller, hasApprovedStore, uploadMenuImage, createFood);
router.put('/:id', authenticate, isSeller, hasApprovedStore, uploadMenuImage, updateFood);
router.delete('/:id', authenticate, isSeller, hasApprovedStore, deleteFood);

module.exports = router;
