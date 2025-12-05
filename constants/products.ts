const products = [
  { id: 1, name: 'BLEMISH - Mụn Control', price: 180000, rating: 4.7, image: require('../assets/images/product/blemish.jpg'), discount: 15, isBestseller: true, description: 'Kem điều trị mụn, làm dịu da.', tags: ['acne', 'treatment', 'spot', 'oil-control'] },
  { id: 2, name: 'Cell Fusion C - Serum', price: 320000, rating: 4.8, image: require('../assets/images/product/cellfusion.jpg'), discount: 12, isBestseller: true, description: 'Serum vitamin C giúp sáng da.', category: 'Serum', tags: ['serum','brightening','vitamin-c','antioxidant'] },
  { id: 3, name: 'Innisfree - Toner', price: 150000, rating: 4.6, image: require('../assets/images/product/innisfree.jpg'), discount: 10, isBestseller: false, description: 'Toner dịu nhẹ cho mọi loại da.', tags: ['toner','hydration','pore-care'] },
  { id: 4, name: 'Torriden - Kem Dưỡng', price: 280000, rating: 4.9, image: require('../assets/images/product/kemduong_torriden.jpg'), discount: 0, isBestseller: true, description: 'Kem dưỡng cấp ẩm sâu.', tags: ['moisturizer','hydration','barrier-repair'] },
  { id: 5, name: 'TIAM - Sữa Rửa Mặt', price: 210000, rating: 4.9, image: require('../assets/images/product/ruamat_tiam.jpg'), discount: 20, isBestseller: true, description: 'Sữa rửa mặt làm sạch sâu.', tags: ['cleanser','daily','foam'] },
  { id: 6, name: 'Serum Hyaluronic', price: 250000, rating: 4.8, image: require('../assets/images/product/serum1.jpg'), discount: 8, isBestseller: false, description: 'Serum cấp ẩm Hyaluronic.', category: 'Serum', tags: ['serum','hydration','hyaluronic'] },
  { id: 7, name: 'MEDICUBE - Serum', price: 420000, rating: 4.7, image: require('../assets/images/product/Serum_medicube.jpg'), discount: 25, isBestseller: true, description: 'Serum đặc trị da nhạy cảm.', category: 'Serum', tags: ['serum','sensitive','soothing'] },
  { id: 8, name: 'SKIN1004 - Essence', price: 380000, rating: 4.8, image: require('../assets/images/product/SKIN1004.jpg'), discount: 18, isBestseller: false, description: 'Essence phục hồi da.', tags: ['essence','repair','centella'] },
  { id: 9, name: 'COCOON - Sữa Rửa Mặt', price: 165000, rating: 4.9, image: require('../assets/images/product/suaruamat_cocoon.jpg'), discount: 5, isBestseller: false, description: 'Sữa rửa mặt dịu nhẹ tự nhiên.', tags: ['cleanser','natural','gentle'] },
  { id: 10, name: 'Serum Concentrado', price: 290000, rating: 4.8, image: require('../assets/images/product/serum_concentrado.jpg'), discount: 22, isBestseller: true, description: 'Serum tập trung dưỡng chất.', category: 'Serum', tags: ['serum','concentrated','active'] }
];

export default products;
