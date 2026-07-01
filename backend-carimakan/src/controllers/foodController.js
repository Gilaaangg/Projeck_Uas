const { Op, fn, col, literal } = require('sequelize');
const { Food, Category, Cart, Store, User } = require('../models');
const fs = require('fs');
const path = require('path');

const getImageUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/menus/${filename}`;
};

const deleteOldImage = (imageUrl) => {
  if (!imageUrl) return;
  // hanya hapus file lokal (bukan placeholder external)
  if (imageUrl.includes('/uploads/menus/')) {
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../../uploads/menus', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

const buildOrderClause = (sort) => {
  const orders = {
    'price-asc': [['price', 'ASC']],
    'price-desc': [['price', 'DESC']],
    'name-asc': [['name', 'ASC']],
    'name-desc': [['name', 'DESC']],
    'rating': [['ratingAverage', 'DESC']],
  };
  return orders[sort] || [['createdAt', 'DESC']];
};

// GET /api/foods
const getAllFoods = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 10, storeId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isAvailable: true };

    if (search) where.name = { [Op.like]: `%${search}%` };
    if (storeId) where.storeId = storeId;

    const include = [
      { model: Category, as: 'category', attributes: ['id', 'name'],
        ...(category ? { where: { name: category } } : {}) },
      { model: Store, as: 'store', attributes: ['id', 'name', 'logoUrl'],
        where: { status: 'approved' } },
    ];

    let order;
    if (sort === 'best-seller') {
      order = [[literal('(SELECT COALESCE(SUM(quantity), 0) FROM carts WHERE carts.foodId = Food.id)'), 'DESC']];
    } else {
      order = buildOrderClause(sort);
    }

    const { count, rows } = await Food.findAndCountAll({
      where, include, order,
      limit: parseInt(limit), offset, distinct: true,
    });

    return res.status(200).json({
      success: true, data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) { next(error); }
};

// GET /api/foods/best-seller
const getBestSeller = async (req, res, next) => {
  try {
    const foods = await Food.findAll({
      where: { isAvailable: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Store, as: 'store', attributes: ['id', 'name'], where: { status: 'approved' } },
        { model: Cart, as: 'cartItems', attributes: [] },
      ],
      attributes: {
        include: [[fn('COALESCE', fn('SUM', col('cartItems.quantity')), 0), 'totalSold']],
      },
      group: ['Food.id', 'category.id', 'store.id'],
      order: [[literal('totalSold'), 'DESC']],
      limit: 5,
      subQuery: false,
    });
    return res.status(200).json({ success: true, data: foods });
  } catch (error) { next(error); }
};

// GET /api/foods/category/:categoryName
const getFoodsByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isAvailable: true };
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Food.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', where: { name: categoryName }, attributes: ['id', 'name'] },
        { model: Store, as: 'store', attributes: ['id', 'name'], where: { status: 'approved' } },
      ],
      order: [['name', 'ASC']], limit: parseInt(limit), offset, distinct: true,
    });

    return res.status(200).json({
      success: true, data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) { next(error); }
};

// GET /api/foods/:id
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'logoUrl', 'address', 'phone', 'isOpen'] },
      ],
    });
    if (!food) return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });
    return res.status(200).json({ success: true, data: food });
  } catch (error) { next(error); }
};

// POST /api/foods — seller tambah menu (perlu toko approved)
const createFood = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, stock = 999 } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });

    // req.store diisi oleh middleware hasApprovedStore
    const storeId = req.user.role === 'admin' ? req.body.storeId : req.store.id;
    if (!storeId) return res.status(400).json({ success: false, message: 'storeId diperlukan' });

    let imageUrl = null;
    if (req.file) {
      imageUrl = getImageUrl(req, req.file.filename);
    }

    const food = await Food.create({ storeId, name, description, price, imageUrl, categoryId, stock });
    const full = await Food.findByPk(food.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Store, as: 'store', attributes: ['id', 'name'] },
      ],
    });

    return res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', data: full });
  } catch (error) { next(error); }
};

// PUT /api/foods/:id — seller update menu miliknya
const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findByPk(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });

    // Seller hanya bisa update menu tokonya sendiri
    if (req.user.role === 'seller' && food.storeId !== req.store.id) {
      return res.status(403).json({ success: false, message: 'Bukan menu tokomu' });
    }

    if (req.body.categoryId) {
      const cat = await Category.findByPk(req.body.categoryId);
      if (!cat) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    if (req.file) {
      deleteOldImage(food.imageUrl);
      req.body.imageUrl = getImageUrl(req, req.file.filename);
    }

    await food.update(req.body);
    const updated = await Food.findByPk(food.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Store, as: 'store', attributes: ['id', 'name'] },
      ],
    });

    return res.status(200).json({ success: true, message: 'Menu berhasil diupdate', data: updated });
  } catch (error) { next(error); }
};

// DELETE /api/foods/:id
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findByPk(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });

    if (req.user.role === 'seller' && food.storeId !== req.store.id) {
      return res.status(403).json({ success: false, message: 'Bukan menu tokomu' });
    }

    deleteOldImage(food.imageUrl);
    await food.destroy();

    return res.status(200).json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (error) { next(error); }
};

// GET /api/foods/my — seller lihat menu tokonya sendiri
const getMyFoods = async (req, res, next) => {
  try {
    const store = req.store;
    const foods = await Food.findAll({
      where: { storeId: store.id },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ success: true, data: foods });
  } catch (error) { next(error); }
};

module.exports = {
  getAllFoods, getBestSeller, getFoodsByCategory, getFoodById,
  createFood, updateFood, deleteFood, getMyFoods,
};
