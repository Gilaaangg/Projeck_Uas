// Backend Food shape:
// { id, name, description, price, imageUrl, categoryId, stock, ratingAverage, ratingCount, category: {name}, store: {...} }
//
// UI lama (dari data/products.js) pakai shape:
// { id, name, category, price, rating, stock, bestSeller, image, description, composition, instructions }
//
// Fungsi ini menjembatani supaya komponen UI yang sudah ada (Home, Menu, ProductDetail)
// tidak perlu diubah-ubah strukturnya.

export function mapFoodToProduct(food) {
  if (!food) return null

  return {
    id: food.id,
    name: food.name,
    category: food.category?.name || 'Lainnya',
    price: Number(food.price),
    rating: Number(food.ratingAverage || 0),
    stock: food.stock ?? 0,
    bestSeller: Number(food.totalSold || 0) > 0 || Number(food.ratingAverage || 0) >= 4.5,
    image: food.imageUrl || 'https://placehold.co/500x400?text=No+Image',
    description: food.description,
    composition: [], // backend belum punya field ini, dikosongkan
    instructions: '', // backend belum punya field ini, dikosongkan
    storeName: food.store?.name || null,
    storeId: food.store?.id || food.storeId || null,
  }
}

export function mapFoodsToProducts(foods = []) {
  return foods.map(mapFoodToProduct)
}
