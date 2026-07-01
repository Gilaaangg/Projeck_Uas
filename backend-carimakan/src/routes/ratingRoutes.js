const express = require('express');
const router = express.Router();
const {
  addOrUpdateRating,
  getFoodRatings,
  getFoodRatingSummary,
  getUserRatingForFood,
} = require('../controllers/ratingController');
const authenticate = require('../middlewares/auth');
const { addRatingValidation } = require('../validations');

router.post('/', authenticate, addRatingValidation, addOrUpdateRating);
router.get('/food/:foodId', getFoodRatings);
router.get('/food/:foodId/summary', getFoodRatingSummary);
router.get('/food/:foodId/user', authenticate, getUserRatingForFood);

module.exports = router;
