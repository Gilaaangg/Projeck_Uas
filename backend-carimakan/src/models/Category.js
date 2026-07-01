const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'Nama kategori sudah ada' },
    validate: {
      notEmpty: { msg: 'Nama kategori tidak boleh kosong' },
    },
  },
}, {
  tableName: 'categories',
});

module.exports = Category;
