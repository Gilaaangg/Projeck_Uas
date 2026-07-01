const express = require('express');
const router = express.Router();
const {
  getFavorites,
  toggleFavorite,
  checkFavorite,
} = require('../controllers/favoriteController');
const authenticate = require('../middlewares/auth');
const { toggleFavoriteValidation } = require('../validations');

router.get('/', authenticate, getFavorites);
router.post('/toggle', authenticate, toggleFavoriteValidation, toggleFavorite);
router.get('/check/:foodId', authenticate, checkFavorite);

module.exports = router;
