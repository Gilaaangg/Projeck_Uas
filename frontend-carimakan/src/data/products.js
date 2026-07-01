const products = [
  // MAKANAN
  {
    id: 1,
    name: 'Spaghetti Bolognese',
    category: 'Makanan',
    price: 25000,
    rating: 4.8,
    stock: 10,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',

    description:
      'Pasta Italia dengan saus bolognese dan taburan keju.',

    composition: [
      'Pasta',
      'Daging sapi',
      'Saus tomat',
      'Keju parmesan',
    ],

    instructions:
      'Sajikan selagi hangat.'
  },

  {
    id: 2,
    name: 'Nasi Goreng Spesial',
    category: 'Makanan',
    price: 22000,
    rating: 4.9,
    stock: 15,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',

    description:
      'Nasi goreng dengan telur, ayam, dan kerupuk.',

    composition: [
      'Nasi',
      'Ayam',
      'Telur',
      'Bawang',
      'Kecap',
    ],

    instructions:
      'Aduk sebelum disantap.'
  },

  {
    id: 3,
    name: 'Chicken Katsu',
    category: 'Makanan',
    price: 28000,
    rating: 4.7,
    stock: 12,
    bestSeller: false,
    image: 'https://images.unsplash.com/photo-1604908176997-431221a3b5f8?w=500',

    description:
      'Ayam katsu renyah dengan saus spesial.',

    composition: [
      'Dada ayam',
      'Tepung roti',
      'Saus katsu',
    ],

    instructions:
      'Nikmati bersama nasi hangat.'
  },

  {
    id: 4,
    name: 'Burger Beef',
    category: 'Makanan',
    price: 30000,
    rating: 4.8,
    stock: 8,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',

    description:
      'Burger daging sapi dengan sayuran segar.',

    composition: [
      'Roti burger',
      'Daging sapi',
      'Selada',
      'Keju',
    ],

    instructions:
      'Sajikan hangat.'
  },

  {
    id: 5,
    name: 'Mie Ayam',
    category: 'Makanan',
    price: 18000,
    rating: 4.6,
    stock: 20,
    bestSeller: false,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',

    description:
      'Mie ayam gurih dengan topping ayam manis.',

    composition: [
      'Mie',
      'Ayam',
      'Sawi',
      'Kuah kaldu',
    ],

    instructions:
      'Aduk sebelum dimakan.'
  },

  {
    id: 6,
    name: 'Sate Ayam',
    category: 'Makanan',
    price: 27000,
    rating: 4.8,
    stock: 14,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',

    description:
      'Sate ayam dengan bumbu kacang khas.',

    composition: [
      'Ayam',
      'Bumbu kacang',
      'Kecap',
    ],

    instructions:
      'Nikmati bersama lontong.'
  },

  // MINUMAN

  {
    id: 7,
    name: 'Orange Juice',
    category: 'Minuman',
    price: 12000,
    rating: 4.5,
    stock: 8,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500',

    description:
      'Jus jeruk segar tanpa pengawet.',

    composition: [
      'Jeruk segar',
      'Es batu',
    ],

    instructions:
      'Kocok sebelum diminum.'
  },

  {
    id: 8,
    name: 'Es Teh Manis',
    category: 'Minuman',
    price: 7000,
    rating: 4.7,
    stock: 25,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',

    description:
      'Teh manis dingin yang menyegarkan.',

    composition: [
      'Teh',
      'Gula',
      'Es batu',
    ],

    instructions:
      'Sajikan dingin.'
  },

  {
    id: 9,
    name: 'Cappuccino',
    category: 'Minuman',
    price: 18000,
    rating: 4.8,
    stock: 12,
    bestSeller: false,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500',

    description:
      'Kopi cappuccino dengan foam lembut.',

    composition: [
      'Espresso',
      'Susu',
      'Foam',
    ],

    instructions:
      'Minum selagi hangat.'
  },

  {
    id: 10,
    name: 'Matcha Latte',
    category: 'Minuman',
    price: 22000,
    rating: 4.9,
    stock: 9,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500',

    description:
      'Minuman matcha premium dengan susu segar.',

    composition: [
      'Matcha',
      'Susu',
      'Es batu',
    ],

    instructions:
      'Aduk sebelum diminum.'
  },

  {
    id: 11,
    name: 'Milkshake Cokelat',
    category: 'Minuman',
    price: 20000,
    rating: 4.7,
    stock: 11,
    bestSeller: false,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500',

    description:
      'Milkshake cokelat creamy.',

    composition: [
      'Susu',
      'Cokelat',
      'Es krim',
    ],

    instructions:
      'Nikmati dingin.'
  },

  // CEMILAN

  {
    id: 12,
    name: 'Kentang Goreng',
    category: 'Cemilan',
    price: 15000,
    rating: 4.7,
    stock: 18,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',

    description:
      'Kentang goreng renyah.',

    composition: [
      'Kentang',
      'Garam',
    ],

    instructions:
      'Nikmati dengan saus.'
  },

  {
    id: 13,
    name: 'Onion Rings',
    category: 'Cemilan',
    price: 16000,
    rating: 4.5,
    stock: 10,
    bestSeller: false,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500',

    description:
      'Cemilan bawang goreng renyah.',

    composition: [
      'Bawang',
      'Tepung',
    ],

    instructions:
      'Sajikan hangat.'
  },

  {
    id: 14,
    name: 'Chicken Nugget',
    category: 'Cemilan',
    price: 17000,
    rating: 4.8,
    stock: 14,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=500',

    description:
      'Nugget ayam renyah.',

    composition: [
      'Ayam',
      'Tepung roti',
    ],

    instructions:
      'Nikmati dengan saus.'
  },

  {
    id: 15,
    name: 'Donat Cokelat',
    category: 'Cemilan',
    price: 12000,
    rating: 4.6,
    stock: 13,
    bestSeller: false,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500',

    description:
      'Donat lembut dengan topping cokelat.',

    composition: [
      'Tepung',
      'Cokelat',
      'Gula',
    ],

    instructions:
      'Sajikan hangat.'
  },

  {
    id: 16,
    name: 'Cheese Cake',
    category: 'Cemilan',
    price: 25000,
    rating: 4.9,
    stock: 7,
    bestSeller: true,
    image: 'https://images.unsplash.com/photo-1524351199432-4b0e76786cba?w=500',

    description:
      'Cheese cake lembut premium.',

    composition: [
      'Keju',
      'Susu',
      'Tepung',
    ],

    instructions:
      'Simpan dingin.'
  },

  {
    id: 17,
    name: 'Brownies',
    category: 'Cemilan',
    price: 18000,
    rating: 4.8,
    stock: 10,
    bestSeller: false,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',

    description:
      'Brownies cokelat lembut.',

    composition: [
      'Cokelat',
      'Tepung',
      'Mentega',
    ],

    instructions:
      'Nikmati dengan kopi.'
  },
]

export default products