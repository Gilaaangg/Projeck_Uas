const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Pemilik toko (harus role seller)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: { msg: 'Satu akun hanya bisa punya satu toko' },
    references: { model: 'users', key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama toko tidak boleh kosong' },
      len: { args: [3, 100], msg: 'Nama toko minimal 3 karakter' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  bannerUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Status: pending → approved → rejected (admin approve)
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'stores',
});

module.exports = Store;
