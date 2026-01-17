import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, ShoppingBag, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image, // Sửa: Viết hoa chữ I
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import các dịch vụ và tiện ích
import apiProduct, { LinkRow, Product } from '@/api/apiProduct';
import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { formatPriceFromAPI } from '@/utils/formatPrice'; // Sửa: Viết hoa chữ P
import toImageSource from '@/utils/toImageSource'; // Sửa: Viết hoa chữ I

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();

  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setLoading(true);
        // Lấy tất cả sản phẩm
        const res = await apiProduct.getAll(); 

        // Lọc sản phẩm theo ID danh mục truyền từ màn hình trước
        const filtered = res.results.filter(product =>
          Array.isArray(product.category_id) &&
          product.category_id.some((c: LinkRow) => Number(c.id) === Number(id))
        );

        setProducts(filtered);
      } catch (error) {
        console.error("Lỗi lọc sản phẩm danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductsByCategory();
  }, [id]);

  const handleToggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      const favImg = toImageSource(product.image)?.uri || '';
      addFavorite({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        rating: 5.0,
        image: favImg
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    const imgUri = toImageSource(product.image)?.uri || '';
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      img: imgUri,
      qty: 1
    });
    Alert.alert('🛒 Thành công', `${product.name} đã được thêm vào giỏ hàng`);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      {/* Hình ảnh sản phẩm */}
      <View style={{ position: 'relative', height: 160, backgroundColor: '#f5f5f5' }}>
        <Image
          source={toImageSource(item.image) || { uri: 'https://via.placeholder.com/150' }}
          style={{ width: '100%', height: '100%' }}
        />
        <TouchableOpacity
          style={{
            position: 'absolute', top: 8, left: 8,
            backgroundColor: '#ffffff90', width: 28, height: 28,
            borderRadius: 14, justifyContent: 'center', alignItems: 'center'
          }}
          onPress={() => handleToggleFavorite(item)}
        >
          <Heart
            color={AppColors.primary} size={16}
            fill={isFavorite(item.id) ? AppColors.primary : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Thông tin sản phẩm */}
      <View style={{ padding: 10 }}>
        <Text style={{ fontWeight: '700', fontSize: 12, color: '#333' }} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Star size={12} color="#ffb300" fill="#ffb300" />
          <Text style={{ marginLeft: 3, fontSize: 11, fontWeight: '600', color: '#666' }}>5.0</Text>
        </View>

        <Text style={{ marginTop: 8, fontWeight: '800', fontSize: 13, color: AppColors.primary }}>
          {formatPriceFromAPI(item.price)}
        </Text>

        <TouchableOpacity
          style={{
            marginTop: 8, backgroundColor: AppColors.primary,
            paddingVertical: 8, borderRadius: 10, alignItems: 'center'
          }}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#faf9f8' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header tùy chỉnh */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 55, paddingHorizontal: 16, paddingBottom: 15,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft color="#333" size={26} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#333', marginRight: 30 }}>
          {name || 'Sản phẩm'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={AppColors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={renderProductItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ flex: 1, marginTop: 100, justifyContent: 'center', alignItems: 'center' }}>
              <ShoppingBag size={80} color="#ddd" strokeWidth={1} />
              <Text style={{ marginTop: 16, color: '#999', fontSize: 15, textAlign: 'center' }}>
                Chưa có sản phẩm trong danh mục này
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}