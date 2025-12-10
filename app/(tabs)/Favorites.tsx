import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, ShoppingCart, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

export default function FavoritesScreen() {
  const { addToCart } = useCart();
  const { favorites, removeFavorite } = useFavorites();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filteredFavorites, setFilteredFavorites] = useState(favorites);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      img: item.image,
    });
    Alert.alert('Thành công', `${item.name} đã được thêm vào giỏ hàng`);
  };

  const handleSort = (newSort: SortOption) => {
    setSortBy(newSort);
    let sorted = [...favorites];
    
    switch (newSort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sorted = favorites;
    }
    setFilteredFavorites(sorted);
  };

  // Render product card for grid view
  const renderProductCard = (item: any) => (
    <TouchableOpacity 
      key={item.id}
      style={{ 
        flex: 1, 
        backgroundColor: '#fff', 
        borderRadius: 14, 
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        margin: 6
      }}
    >
      <View style={{ position: 'relative', height: 160, backgroundColor: '#f5f5f5' }}>
        <Image source={item.image} style={{ width: '100%', height: '100%' }} />
        {/* Favorite Button */}
        <TouchableOpacity 
          style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#ffffff90', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => {
            removeFavorite(item.id);
            Alert.alert('Đã xóa', `${item.name} đã bị xóa khỏi yêu thích`);
          }}
        >
          <Heart color={AppColors.primary} size={16} fill={AppColors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={{ padding: 10 }}>
        <Text style={{ fontWeight: '700', fontSize: 12, color: '#333', marginBottom: 4 }} numberOfLines={2}>{item.name}</Text>
        
        {/* Rating */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Star size={12} color="#ffb300" fill="#ffb300" />
          <Text style={{ marginLeft: 4, fontSize: 11, fontWeight: '600', color: '#666' }}>{item.rating}</Text>
        </View>

        {/* Price */}
        <Text style={{ fontWeight: '800', fontSize: 13, color: AppColors.primary, marginBottom: 8 }}>{item.price.toLocaleString('vi-VN')}đ</Text>

        {/* Add to cart button */}
        <TouchableOpacity 
          style={{ backgroundColor: AppColors.primaryDark, paddingVertical: 6, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}
          onPress={() => handleAddToCart(item)}
        >
          <ShoppingCart size={12} color="#fff" strokeWidth={2} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Thêm giỏ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render product item for list view
  const renderListItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
    >
      <Image source={item.image} style={{ width: 100, height: 100, borderRadius: 10 }} />
      
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontWeight: '700', fontSize: 13, color: '#333', marginBottom: 4 }} numberOfLines={2}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Star size={12} color="#ffb300" fill="#ffb300" />
              <Text style={{ marginLeft: 3, fontSize: 11, fontWeight: '600', color: '#666' }}>{item.rating}</Text>
            </View>
            <Text style={{ fontSize: 11, color: '#999' }}>Có sẵn</Text>
          </View>
          <Text style={{ fontWeight: '800', fontSize: 14, color: AppColors.primary }}>{item.price.toLocaleString('vi-VN')}đ</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: AppColors.primaryDark, paddingVertical: 6, borderRadius: 8, alignItems: 'center' }}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Thêm giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ width: 32, backgroundColor: '#ffe8f0', paddingVertical: 6, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => {
              removeFavorite(item.id);
              Alert.alert('Đã xóa', `${item.name} đã bị xóa khỏi yêu thích`);
            }}
          >
            <Heart color={AppColors.primary} size={14} fill={AppColors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty state
  if (!favorites || favorites.length === 0) {
    return (
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Yêu Thích</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')}>
              <ShoppingCart size={24} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Heart size={80} color="#ffffff60" strokeWidth={1} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 20 }}>Danh sách yêu thích trống</Text>
          <Text style={{ fontSize: 14, color: '#ffffff80', marginTop: 8, textAlign: 'center' }}>Hãy nhấn biểu tượng ♥ ở sản phẩm để thêm vào danh sách</Text>
          <TouchableOpacity 
            style={{ marginTop: 32, backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: AppColors.primary }}>Khám phá ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#faf9f8' }}>
      {/* ====== HEADER ====== */}
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryLight]}
        style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Yêu Thích</Text>
            <Text style={{ fontSize: 11, color: '#ffffff80', marginTop: 2 }}>{favorites.length} sản phẩm</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')}>
            <ShoppingCart size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ====== FILTER & SORT BAR ====== */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>Sắp xếp</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { label: 'Mới', value: 'newest' },
                { label: 'Giá ↓', value: 'price-high' },
                { label: 'Giá ↑', value: 'price-low' },
                { label: 'Sao', value: 'popular' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{ 
                    paddingHorizontal: 10, 
                    paddingVertical: 6, 
                    borderRadius: 8,
                    backgroundColor: sortBy === option.value ? AppColors.primary : '#ffe8f0'
                  }}
                  onPress={() => handleSort(option.value as SortOption)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: sortBy === option.value ? '#fff' : AppColors.primary }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* View Mode Toggle */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                paddingVertical: 8, 
                borderRadius: 8, 
                alignItems: 'center',
                backgroundColor: viewMode === 'grid' ? AppColors.primary : '#ffe8f0'
              }}
              onPress={() => setViewMode('grid')}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: viewMode === 'grid' ? '#fff' : AppColors.primary }}>⊞ Lưới</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                paddingVertical: 8, 
                borderRadius: 8, 
                alignItems: 'center',
                backgroundColor: viewMode === 'list' ? AppColors.primary : '#ffe8f0'
              }}
              onPress={() => setViewMode('list')}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: viewMode === 'list' ? '#fff' : AppColors.primary }}>☰ Danh sách</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ====== PRODUCTS ====== */}
        <View style={{ paddingHorizontal: 10, paddingBottom: 20 }}>
          {viewMode === 'grid' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {filteredFavorites.map((item: any) => renderProductCard(item))}
            </View>
          ) : (
            <View style={{ paddingHorizontal: 6 }}>
              {filteredFavorites.map((item: any) => renderListItem(item))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
