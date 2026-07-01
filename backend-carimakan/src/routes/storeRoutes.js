const express = require('express');
const router = express.Router();
const {
  getAllStores, getStoreById, createStore, updateMyStore,
  getMyStore, adminGetAllStores, updateStoreStatus,
} = require('../controllers/storeController');
const authenticate = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { isSeller } = require('../middlewares/seller');
const { uploadStoreImage } = require('../middlewares/upload');

// Public
router.get('/', getAllStores);
router.get('/:id', getStoreById);

// Seller
router.post('/', authenticate, isSeller, uploadStoreImage, createStore);
router.get('/seller/my', authenticate, isSeller, getMyStore);
router.put('/seller/my', authenticate, isSeller, uploadStoreImage, updateMyStore);

// Admin
router.get('/admin/all', authenticate, admin, adminGetAllStores);
router.patch('/:id/status', authenticate, admin, updateStoreStatus);

module.exports = router;
