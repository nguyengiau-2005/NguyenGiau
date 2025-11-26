import { Search, MapPin, Bell, Star, Heart } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Product, Screen } from '../../app/(tabs)/index';

interface HomeViewProps {
  onNavigate: (screen: Screen, product?: Product) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

export function HomeView({ onNavigate, favorites, onToggleFavorite }: HomeViewProps) {
  const categories = [
    { id: 'all', name: 'Tất cả', icon: '☕' },
    { id: 'coffee', name: 'Cà phê', icon: '☕' },
    { id: 'tea', name: 'Trà', icon: '🍵' },
    { id: 'juice', name: 'Nước ép', icon: '🥤' },
    { id: 'smoothie', name: 'Sinh tố', icon: '🥛' },
  ];

  const products: Product[] = [
    {
      id: 1,
      name: 'Cà phê đen đá',
      description: 'Cà phê đen nguyên chất, đậm đà',
      price: 29000,
      image: 'https://images.unsplash.com/photo-1592111994951-b5677f384eb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBkcmluayUyMGN1cHxlbnwxfHx8fDE3NjQxNDMzODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'coffee',
      rating: 4.8,
      sold: 1234
    },
    {
      id: 2,
      name: 'Trà sữa trân châu',
      description: 'Trà sữa Taiwan với trân châu mềm dai',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWJibGUlMjB0ZWElMjBkcmlua3xlbnwxfHx8fDE3NjQwOTcwODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'tea',
      rating: 4.9,
      sold: 2156
    },
    {
      id: 3,
      name: 'Sinh tố dâu',
      description: 'Sinh tố dâu tươi, mát lạnh',
      price: 32000,
      image: 'https://images.unsplash.com/photo-1655992590262-aeadeef445b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9vdGhpZSUyMGZydWl0JTIwZHJpbmt8ZW58MXx8fHwxNzY0MTQzMzg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'smoothie',
      rating: 4.7,
      sold: 987
    },
    {
      id: 4,
      name: 'Trà đào cam sả',
      description: 'Trá đào tươi kết hợp cam và sả thơm',
      price: 38000,
      image: 'https://images.unsplash.com/photo-1633703679380-3168a2cac795?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwdGVhJTIwZHJpbmt8ZW58MXx8fHwxNzY0MTM2NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'tea',
      rating: 4.9,
      sold: 1543
    },
    {
      id: 5,
      name: 'Nước ép cam tươi',
      description: 'Nước ép cam nguyên chất 100%',
      price: 30000,
      image: 'https://images.unsplash.com/photo-1666857501405-cfa382726262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqdWljZSUyMGRyaW5rJTIwZ2xhc3N8ZW58MXx8fHwxNzY0MTQzMzg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'juice',
      rating: 4.6,
      sold: 756
    },
    {
      id: 6,
      name: 'Milkshake socola',
      description: 'Sữa lắc socola Bỉ béo ngậy',
      price: 42000,
      image: 'https://images.unsplash.com/photo-1639536564468-ac3900552994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxrc2hha2UlMjBkcmlua3xlbnwxfHx8fDE3NjQwNTMxOTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'smoothie',
      rating: 4.8,
      sold: 1432
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-white" />
            <div>
              <p className="text-orange-100">Giao đến</p>
              <p className="text-white">Quận 1, TP.HCM</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
              3
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm đồ uống..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              className="flex-shrink-0 px-5 py-2 bg-white rounded-full border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-6 mb-4">
        <div className="bg-gradient-to-r from-orange-400 to-red-400 p-5 rounded-2xl text-white">
          <h3 className="text-white mb-2">🎉 Ưu đãi hôm nay</h3>
          <p className="text-white/90 mb-3">Giảm 30% cho đơn hàng đầu tiên</p>
          <button className="px-5 py-2 bg-white text-orange-600 rounded-full">
            Đặt ngay
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="px-6 pb-6">
        <h3 className="text-gray-800 mb-4">Thức uống phổ biến</h3>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onNavigate('product', product)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <div className="relative">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(product.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      favorites.includes(product.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>
              </div>
              <div className="p-3">
                <h4 className="text-gray-800 mb-1 text-left">{product.name}</h4>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-600">{product.rating}</span>
                  <span className="text-gray-400">({product.sold})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600">{product.price.toLocaleString('vi-VN')}đ</span>
                  <button className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    +
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
