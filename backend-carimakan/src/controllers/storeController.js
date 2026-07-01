const { Store, User, Food, Category } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const getImageUrl = (req, filename, folder) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${filename}`;
};

const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// GET /api/stores — semua toko yang approved
const getAllStores = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let whereClause = { status: 'approved' };
    
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }

    const stores = await Store.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: Food, as: 'foods', attributes: ['ratingAverage', 'ratingCount'] }
      ],
      order: [['name', 'ASC']],
    });
    
    // Calculate store rating based on foods
    const storesWithRating = stores.map(store => {
      const storeObj = store.toJSON();
      let totalRating = 0;
      let totalCount = 0;
      
      if (storeObj.foods && storeObj.foods.length > 0) {
        storeObj.foods.forEach(food => {
          if (food.ratingCount > 0) {
            totalRating += parseFloat(food.ratingAverage) * parseInt(food.ratingCount);
            totalCount += parseInt(food.ratingCount);
          }
        });
      }
      
      storeObj.ratingAverage = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : 0;
      storeObj.ratingCount = totalCount;
      delete storeObj.foods; // don't send all foods in list API
      return storeObj;
    });

    return res.status(200).json({ success: true, data: storesWithRating });
  } catch (error) { next(error); }
};

// GET /api/stores/:id
const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: Food, as: 'foods',
          where: { isAvailable: true },
          required: false,
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        },
      ],
    });
    if (!store || store.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
    }
    
    const storeObj = store.toJSON();
    let totalRating = 0;
    let totalCount = 0;
    
    if (storeObj.foods && storeObj.foods.length > 0) {
      storeObj.foods.forEach(food => {
        if (food.ratingCount > 0) {
          totalRating += parseFloat(food.ratingAverage) * parseInt(food.ratingCount);
          totalCount += parseInt(food.ratingCount);
        }
      });
    }
    
    storeObj.ratingAverage = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : 0;
    storeObj.ratingCount = totalCount;
    
    return res.status(200).json({ success: true, data: storeObj });
  } catch (error) { next(error); }
};

// POST /api/stores — seller buat toko (1 seller 1 toko)
const createStore = async (req, res, next) => {
  try {
    const existing = await Store.findOne({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Kamu sudah punya toko' });
    }

    const { name, description, address, phone } = req.body;

    let logoUrl = null;
    let bannerUrl = null;
    if (req.files?.logo) {
      logoUrl = getImageUrl(req, req.files.logo[0].filename, 'stores');
    }
    if (req.files?.banner) {
      bannerUrl = getImageUrl(req, req.files.banner[0].filename, 'stores');
    }

    const store = await Store.create({
      userId: req.user.id,
      name, description, address, phone,
      logoUrl, bannerUrl,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Toko berhasil dibuat. Menunggu persetujuan admin.',
      data: store,
    });
  } catch (error) { next(error); }
};

// PUT /api/stores/my — seller update tokonya sendiri
const updateMyStore = async (req, res, next) => {
  try {
    const store = await Store.findOne({ where: { userId: req.user.id } });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
    }

    const { name, description, address, phone, isOpen } = req.body;

    if (req.files?.logo) {
      if (store.logoUrl) {
        const old = path.join(__dirname, '../../uploads/stores', path.basename(store.logoUrl));
        deleteFile(old);
      }
      store.logoUrl = getImageUrl(req, req.files.logo[0].filename, 'stores');
    }
    if (req.files?.banner) {
      if (store.bannerUrl) {
        const old = path.join(__dirname, '../../uploads/stores', path.basename(store.bannerUrl));
        deleteFile(old);
      }
      store.bannerUrl = getImageUrl(req, req.files.banner[0].filename, 'stores');
    }

    await store.update({ name, description, address, phone, isOpen,
      logoUrl: store.logoUrl, bannerUrl: store.bannerUrl });

    return res.status(200).json({ success: true, message: 'Toko berhasil diupdate', data: store });
  } catch (error) { next(error); }
};

// GET /api/stores/my — seller lihat toko sendiri
const getMyStore = async (req, res, next) => {
  try {
    const store = await Store.findOne({
      where: { userId: req.user.id },
      include: [{ model: Food, as: 'foods', include: [{ model: Category, as: 'category' }] }],
    });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Kamu belum punya toko' });
    }
    return res.status(200).json({ success: true, data: store });
  } catch (error) { next(error); }
};

// ─── Admin only ──────────────────────────────────────────────────

// GET /api/stores/admin/all — admin lihat semua toko (semua status)
const adminGetAllStores = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const stores = await Store.findAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ success: true, data: stores });
  } catch (error) { next(error); }
};

// PATCH /api/stores/:id/status — admin approve/reject toko
const updateStoreStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });

    await store.update({ status });
    return res.status(200).json({ success: true, message: `Toko berhasil di-${status}`, data: store });
  } catch (error) { next(error); }
};

module.exports = {
  getAllStores, getStoreById, createStore, updateMyStore,
  getMyStore, adminGetAllStores, updateStoreStatus,
};
