const { Cart, Food, Category } = require('../models');

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cartItems = await Cart.findAll({
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

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.food?.price || 0) * item.quantity;
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        items: cartItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, notes } = req.body;

    const food = await Food.findByPk(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Makanan tidak ditemukan',
      });
    }

    // Cek apakah sudah ada di cart
    const existingItem = await Cart.findOne({
      where: { userId: req.user.id, foodId },
    });

    if (existingItem) {
      // Update quantity
      await existingItem.update({
        quantity: existingItem.quantity + parseInt(quantity),
        ...(notes !== undefined ? { notes } : {}),
      });

      const updated = await Cart.findByPk(existingItem.id, {
        include: [{ model: Food, as: 'food' }],
      });

      return res.status(200).json({
        success: true,
        message: 'Quantity berhasil diupdate',
        data: updated,
      });
    }

    const cartItem = await Cart.create({
      userId: req.user.id,
      foodId,
      quantity: parseInt(quantity),
      notes: notes || null,
    });

    const newItem = await Cart.findByPk(cartItem.id, {
      include: [{ model: Food, as: 'food' }],
    });

    return res.status(201).json({
      success: true,
      message: 'Item berhasil ditambahkan ke keranjang',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:itemId
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findOne({
      where: { id: req.params.itemId, userId: req.user.id },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item keranjang tidak ditemukan',
      });
    }

    // Jika quantity 0 atau kurang → hapus item
    if (parseInt(quantity) <= 0) {
      await cartItem.destroy();
      return res.status(200).json({
        success: true,
        message: 'Item dihapus dari keranjang karena quantity 0',
      });
    }

    await cartItem.update({ quantity: parseInt(quantity) });
    const updated = await Cart.findByPk(cartItem.id, {
      include: [{ model: Food, as: 'food' }],
    });

    return res.status(200).json({
      success: true,
      message: 'Quantity berhasil diupdate',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:itemId
const removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await Cart.findOne({
      where: { id: req.params.itemId, userId: req.user.id },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item keranjang tidak ditemukan',
      });
    }

    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: 'Item berhasil dihapus dari keranjang',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/clear
const clearCart = async (req, res, next) => {
  try {
    await Cart.destroy({ where: { userId: req.user.id } });

    return res.status(200).json({
      success: true,
      message: 'Keranjang berhasil dikosongkan',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
