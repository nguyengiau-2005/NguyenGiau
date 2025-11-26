import { Heart, Star } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Product, Screen } from '../../App';

interface FavoritesViewProps {
  favorites: number[];
  onNavigate: (screen: Screen, product?: Product) => void;
  onToggleFavorite: (id: number) => void;
}

export function FavoritesView({ favorites, onNavigate, onToggleFavorite }: FavoritesViewProps) {
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
      id: 4,
      name: 'Trà đào cam sả',
      description: 'Trá đào tươi kết hợp cam và sả thơm',
      price: 38000,
      image: 'https://images.unsplash.com/photo-1633703679380-3168a2cac795?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwdGVhJTIwZHJpbmt8ZW58MXx8fHwxNzY0MTM2NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'tea',
      rating: 4.9,
      sold: 1543
    },
  ];

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h2 className="text-gray-800">Yêu thích</h2>
        <p className="text-gray-500">{favoriteProducts.length} sản phẩm</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {favoriteProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Heart className="w-24 h-24 text-gray-300 mb-4" />
            <h3 className="text-gray-800 mb-2">Chưa có sản phẩm yêu thích</h3>
            <p className="text-gray-500 text-center mb-6">Hãy thêm các sản phẩm bạn thích vào danh sách</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl"
            >
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onNavigate('product', product)}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-gray-800 mb-1">{product.name}</h4>
                    <p className="text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-600">{product.rating}</span>
                      <span className="text-gray-400">({product.sold})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-600">{product.price.toLocaleString('vi-VN')}đ</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(product.id);
                        }}
                        className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center"
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
