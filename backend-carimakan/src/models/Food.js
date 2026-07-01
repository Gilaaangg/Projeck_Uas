const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Food = sequelize.define('Food', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Toko yang memiliki menu ini
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama makanan tidak boleh kosong' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Deskripsi tidak boleh kosong' },
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Harga tidak boleh negatif' },
      isDecimal: { msg: 'Harga harus berupa angka' },
    },
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'categories', key: 'id' },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 999,
    validate: {
      min: { args: [0], msg: 'Stok tidak boleh negatif' },
    },
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ratingAverage: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'foods',
});

module.exports = Food;
