const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Store = require('./Store');
const Food = require('./Food');
const Cart = require('./Cart');
const Favorite = require('./Favorite');
const Rating = require('./Rating');
const Contact = require('./Contact');

// ─── Associations ────────────────────────────────────────────────

// User <-> Store (1 seller = 1 toko)
User.hasOne(Store, { foreignKey: 'userId', as: 'store', onDelete: 'CASCADE' });
Store.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Store <-> Food
Store.hasMany(Food, { foreignKey: 'storeId', as: 'foods', onDelete: 'CASCADE' });
Food.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// Food <-> Category
Category.hasMany(Food, { foreignKey: 'categoryId', as: 'foods' });
Food.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User <-> Cart <-> Food
User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Food.hasMany(Cart, { foreignKey: 'foodId', as: 'cartItems', onDelete: 'CASCADE' });
Cart.belongsTo(Food, { foreignKey: 'foodId', as: 'food' });

// User <-> Favorite <-> Food
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Food.hasMany(Favorite, { foreignKey: 'foodId', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(Food, { foreignKey: 'foodId', as: 'food' });

// User <-> Rating <-> Food
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Food.hasMany(Rating, { foreignKey: 'foodId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Food, { foreignKey: 'foodId', as: 'food' });

module.exports = {
  sequelize,
  User,
  Category,
  Store,
  Food,
  Cart,
  Favorite,
  Rating,
  Contact,
};
