const { Favorite, Food, Category } = require('../models');

// GET /api/favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Food,
          as: 'food',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const foods = favorites.map((fav) => fav.food);

    return res.status(200).json({
      success: true,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/favorites/toggle
const toggleFavorite = async (req, res, next) => {
  try {
    const { foodId } = req.body;

    const food = await Food.findByPk(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Makanan tidak ditemukan',
      });
    }

    const existing = await Favorite.findOne({
      where: { userId: req.user.id, foodId },
    });

    if (existing) {
      await existing.destroy();
      return res.status(200).json({
        success: true,
        message: 'Dihapus dari favorit',
        data: { isFavorite: false, foodId },
      });
    }

    await Favorite.create({ userId: req.user.id, foodId });

    return res.status(201).json({
      success: true,
      message: 'Ditambahkan ke favorit',
      data: { isFavorite: true, foodId },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/favorites/check/:foodId
const checkFavorite = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const existing = await Favorite.findOne({
      where: { userId: req.user.id, foodId: parseInt(foodId) },
    });

    return res.status(200).json({
      success: true,
      data: { isFavorite: !!existing, foodId: parseInt(foodId) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFavorites, toggleFavorite, checkFavorite };
