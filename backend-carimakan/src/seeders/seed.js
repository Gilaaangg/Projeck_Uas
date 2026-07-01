require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Store, Food } = require('../models');

const seed = async () => {
  try {
    console.log('🌱 Memulai seeding...');
    await sequelize.sync({ force: true });
    console.log('✅ Database sync selesai');

    // Users
    const hash = (p) => bcrypt.hash(p, 10);
    const users = await User.bulkCreate([
      { name: 'Admin CariMakan', email: 'admin@carimakan.id', password: await hash('admin123'), role: 'admin' },
      { name: 'Warung Pak Budi', email: 'budi@carimakan.id', password: await hash('seller123'), role: 'seller', phone: '081234567890' },
      { name: 'Toko Bu Siti', email: 'siti@carimakan.id', password: await hash('seller123'), role: 'seller', phone: '089876543210' },
      { name: 'Andi Pembeli', email: 'andi@example.com', password: await hash('buyer123'), role: 'buyer' },
      { name: 'Rina Pembeli', email: 'rina@example.com', password: await hash('buyer123'), role: 'buyer' },
    ], { individualHooks: false });
    console.log(`✅ ${users.length} users`);

    const [, seller1, seller2] = users;

    // Categories
    const cats = await Category.bulkCreate([
      { name: 'Makanan' }, { name: 'Minuman' }, { name: 'Cemilan' },
    ]);
    console.log(`✅ ${cats.length} kategori`);
    const [makanan, minuman, cemilan] = cats;

    // Stores
    const stores = await Store.bulkCreate([
      { userId: seller1.id, name: 'Warung Pak Budi', description: 'Masakan rumahan khas Jawa yang lezat dan terjangkau.',
        address: 'Jl. Merdeka No. 10, Lampung', phone: '081234567890', status: 'approved', isOpen: true },
      { userId: seller2.id, name: 'Toko Bu Siti', description: 'Minuman segar dan cemilan enak buat nemenin hari-harimu.',
        address: 'Jl. Sudirman No. 5, Lampung', phone: '089876543210', status: 'approved', isOpen: true },
    ]);
    console.log(`✅ ${stores.length} toko`);
    const [store1, store2] = stores;

    // Foods
    const foods = await Food.bulkCreate([
      // Store 1 — Warung Pak Budi
      { storeId: store1.id, categoryId: makanan.id, name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng bumbu rahasia, telur mata sapi, ayam suwir, kerupuk udang.',
        price: 25000, stock: 50, ratingAverage: 4.5, ratingCount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600' },
      { storeId: store1.id, categoryId: makanan.id, name: 'Mie Ayam Bakso',
        description: 'Mie segar dengan bakso sapi jumbo dan kuah kaldu gurih.',
        price: 20000, stock: 40, ratingAverage: 4.3, ratingCount: 15,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600' },
      { storeId: store1.id, categoryId: makanan.id, name: 'Ayam Geprek',
        description: 'Ayam crispy digeprek sambal bawang, tersedia level kepedasan.',
        price: 22000, stock: 30, ratingAverage: 4.7, ratingCount: 35,
        imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600' },
      { storeId: store1.id, categoryId: minuman.id, name: 'Es Teh Manis',
        description: 'Teh manis segar dengan es batu.',
        price: 5000, stock: 100, ratingAverage: 4.0, ratingCount: 50,
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600' },
      // Store 2 — Toko Bu Siti
      { storeId: store2.id, categoryId: minuman.id, name: 'Jus Alpukat',
        description: 'Alpukat segar dicampur susu dan cokelat. Tebal dan menyegarkan.',
        price: 15000, stock: 30, ratingAverage: 4.8, ratingCount: 30,
        imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600' },
      { storeId: store2.id, categoryId: minuman.id, name: 'Kopi Susu Kekinian',
        description: 'Arabika pilihan dengan susu segar, dingin atau panas.',
        price: 18000, stock: 50, ratingAverage: 4.6, ratingCount: 40,
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600' },
    ]);
    console.log(`✅ ${foods.length} menu`);

    console.log('\n🎉 Seeding selesai!');
    console.log('─────────────────────────────────────────────────');
    console.log('👑 Admin  → admin@carimakan.id    / admin123');
    console.log('🏪 Seller1 → budi@carimakan.id   / seller123');
    console.log('🏪 Seller2 → siti@carimakan.id   / seller123');
    console.log('🛒 Buyer1  → andi@example.com     / buyer123');
    console.log('🛒 Buyer2  → rina@example.com     / buyer123');
    console.log('─────────────────────────────────────────────────');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding gagal:', error);
    process.exit(1);
  }
};

seed();
