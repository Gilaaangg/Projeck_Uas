const { Rating, Food, User } = require('../models');
const { fn, col } = require('sequelize');

// Helper: recalculate food rating average & count
const recalculateFoodRating = async (foodId) => {
  const result = await Rating.findOne({
    where: { foodId },
    attributes: [
      [fn('AVG', col('rating')), 'avg'],
      [fn('COUNT', col('id')), 'count'],
    ],
    raw: true,
  });

  const avg = parseFloat(result?.avg || 0);
  const count = parseInt(result?.count || 0);

  await Food.update(
    {
      ratingAverage: parseFloat(avg.toFixed(2)),
      ratingCount: count,
    },
    { where: { id: foodId } }
  );
};

// POST /api/ratings (protected)
const addOrUpdateRating = async (req, res, next) => {
  try {
    const { foodId, rating, review } = req.body;

    const food = await Food.findByPk(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Makanan tidak ditemukan',
      });
    }

    const existingRating = await Rating.findOne({
      where: { userId: req.user.id, foodId },
    });

    let ratingData;
    let isNew = false;

    if (existingRating) {
      await existingRating.update({ rating, review: review || existingRating.review });
      ratingData = existingRating;
    } else {
      ratingData = await Rating.create({
        userId: req.user.id,
        foodId,
        rating,
        review: review || null,
      });
      isNew = true;
    }

    // Recalculate food's rating stats
    await recalculateFoodRating(foodId);

    const fullRating = await Rating.findByPk(ratingData.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    return res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'Rating berhasil ditambahkan' : 'Rating berhasil diupdate',
      data: fullRating,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ratings/food/:foodId
const getFoodRatings = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findByPk(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });
    }

    const ratings = await Rating.findAll({
      where: { foodId: parseInt(foodId) },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ratings/food/:foodId/summary
const getFoodRatingSummary = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findByPk(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });
    }

    const ratings = await Rating.findAll({
      where: { foodId: parseInt(foodId) },
      attributes: ['rating'],
      raw: true,
    });

    const count = ratings.length;
    const average = count > 0
      ? parseFloat((ratings.reduce((s, r) => s + r.rating, 0) / count).toFixed(2))
      : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: { average, count, distribution },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ratings/food/:foodId/user (protected)
const getUserRatingForFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const rating = await Rating.findOne({
      where: { foodId: parseInt(foodId), userId: req.user.id },
    });

    return res.status(200).json({
      success: true,
      data: {
        hasRated: !!rating,
        rating: rating || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrUpdateRating,
  getFoodRatings,
  getFoodRatingSummary,
  getUserRatingForFood,
};
