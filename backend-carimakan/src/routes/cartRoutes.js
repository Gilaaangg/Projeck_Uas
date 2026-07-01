const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const authenticate = require('../middlewares/auth');
const { addToCartValidation, updateCartValidation } = require('../validations');

// PENTING: /clear harus SEBELUM /:itemId
router.delete('/clear', authenticate, clearCart);

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCartValidation, addToCart);
router.put('/:itemId', authenticate, updateCartValidation, updateCartItem);
router.delete('/:itemId', authenticate, removeFromCart);

module.exports = router;
