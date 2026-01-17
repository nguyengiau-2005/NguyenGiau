import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useRecent } from '@/contexts/RecentContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, MessageCircle, Share2, ShoppingCart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import APIs
import apiCategory, { CategoryData } from '@/api/apiCategory';
import apiProduct, { ProductData } from '@/api/apiProduct';
import apiPromotion, { PromotionData } from '@/api/apiPromotion';

// This is a single-file product detail screen scaffolded to cover the 13 sections.
// Replace placeholder data & integrate with backend as needed.

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addRecent } = useRecent();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const paramId = Array.isArray(id) ? id[0] : id;

  // State for API data
  const [product, setProduct] = useState<ProductData | null>(null);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!paramId) return;

      try {
        setLoading(true);
        const pid = Number(paramId);

        // Fetch product detail
        const productData = await apiProduct.getProductDetail(pid);
        setProduct(productData);

        // Fetch category if available
        if (productData.category_id && productData.category_id.length > 0) {
          const categoryData = await apiCategory.getCategoryDetail(productData.category_id[0].id);
          setCategory(categoryData);
        }

        // Fetch promotions
        const promoData = await apiPromotion.getPublicPromotions();
        setPromotions(promoData.results || []);

        // Add to recent
        addRecent({
          id: productData.id,
          name: productData.name,
          price: Number(productData.price) || 0,
          img: productData.image?.[0]?.url || ''
        });

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [paramId]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<{ [k: string]: string }>({});
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [note, setNote] = useState('');
  const [shippingAddress, setShippingAddress] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);



  const handleAddToCart = () => {
    if (!product) return;
    // Basic add to cart; CartItem shape: {id, name, price, qty, img}
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      qty,
      img: product.image?.[0]?.url || ''
    });
    Alert.alert('Đã thêm vào giỏ', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/(tabs)/Cart');
  };

  // initialize fav from FavoritesContext
  // --- LOGIC YÊU THÍCH (FAVORITES) ---

  // 1. Đồng bộ state 'fav' với Context mỗi khi sản phẩm thay đổi
  useEffect(() => {
    if (product) {
      setFav(isFavorite(product.id));
    }
  }, [product, isFavorite]);

  // 2. Hàm xử lý khi bấm nút Tim
  const toggleFavorite = () => {
    if (!product) return;

    if (isFavorite(product.id)) {
      // Nếu đã thích -> Xóa
      removeFavorite(product.id);
      setFav(false);
      // Có thể bỏ Alert nếu muốn trải nghiệm mượt hơn
      // Alert.alert('Đã xóa', 'Đã xóa khỏi danh sách yêu thích'); 
    } else {
      // Nếu chưa thích -> Thêm
      addFavorite({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        rating: Number(product.rating) || 5.0,
        image: product.image?.[0]?.url || '' // Lấy ảnh đầu tiên
      });
      setFav(true);
      Alert.alert('Đã lưu', 'Sản phẩm đã được thêm vào mục Yêu thích ❤️');
    }
  };
  // Fetch device location and reverse-geocode to a readable address
  const fetchLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập vị trí bị từ chối', 'Vui lòng cấp quyền vị trí để tự động điền địa chỉ giao hàng.');
        setLocationLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const rev = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      if (rev && rev.length > 0) {
        const first = rev[0];
        const parts = [first.name, first.street, first.city, first.region, first.postalCode].filter(Boolean);
        setShippingAddress(parts.join(', '));
      } else {
        setShippingAddress('Không xác định');
      }
    } catch (err) {
      console.warn('Location error', err);
      Alert.alert('Lỗi vị trí', 'Không thể lấy vị trí thiết bị.');
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    // attempt to fetch location on mount (best-effort)
    fetchLocation();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf9f8' }}>
        <Text>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf9f8' }}>
        <Text>{error || 'Sản phẩm không tồn tại'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12, backgroundColor: AppColors.primary, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#00000000", "#ffffff00"]} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ChevronLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
              <Heart
                size={22}
                color={fav ? "#FF4D4D" : "#fff"} // Đổi màu đỏ khi active
                fill={fav ? "#FF4D4D" : "transparent"} // Đổ màu bên trong
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ sản phẩm')} style={styles.iconBtn}>
              <Share2 size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={styles.iconBtn}>
              <ShoppingCart size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 2. Banner images (carousel simplified) */}
        <View style={styles.bannerContainer}>
          {(() => {
            const src = product.image?.[activeImage]?.url || 'https://via.placeholder.com/400x400.png?text=No+Image';
            return <Image source={{ uri: src }} style={styles.bannerImage} />;
          })()}
          <View style={styles.indicatorRow}>
            {(product.image || []).map((_, i) => (
              <View key={i} style={[styles.dot, activeImage === i && styles.dotActive]} />
            ))}
          </View>
        </View>
        {/* Thumbnails */}
        {(product.image || []).length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, paddingHorizontal: 12 }}>
            {(product.image || []).map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveImage(i)} style={{ marginRight: 8, borderRadius: 8, overflow: 'hidden', borderWidth: activeImage === i ? 2 : 1, borderColor: activeImage === i ? AppColors.primary : '#eee' }}>
                <Image source={{ uri: img.url }} style={{ width: 72, height: 72 }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 3. Title + rating */}
        <View style={styles.section}>
          <Text style={styles.title}>{product.name}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.rating}>⭐ {Number(product.rating) || 5.0} · {category?.name || 'Danh mục'}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ')}>
              <Text style={{ color: AppColors.primary }}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Price */}
        <View style={styles.section}>
          <Text style={styles.price}>{Number(product.price).toLocaleString('vi-VN', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
          })}đ</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.priceOld}>
              {Math.round(Number(product.price) * 1.2).toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.discount}>17%</Text>
          </View>
        </View>

        {/* 5. Quantity selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
            <Text>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(q => q + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
            <Text style={{ marginLeft: 12 }}>Tổng: {(Number(product.price) * qty).toLocaleString('vi-VN', {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3
            })}đ</Text>
          </View>
        </View>

        {/* 6. Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khuyến mãi & Voucher</Text>
          {promotions.length === 0 ? (
            <Text style={{ color: '#999' }}>Không có khuyến mãi nào</Text>
          ) : (
            promotions.slice(0, 3).map((promo) => (
              <TouchableOpacity key={promo.id} onPress={() => Alert.alert('Voucher', promo.description)} style={styles.promoRow}>
                <Text>{promo.name}: {promo.discount_type.value === 'Percentage' ? `${promo.discount_value}%` : `${promo.discount_value}đ`} off</Text>
                <Text style={{ color: AppColors.primary }}>Thu thập</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 7. Shipping info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vận chuyển</Text>
          <Text>Giao đến: {locationLoading ? 'Đang lấy địa chỉ...' : (shippingAddress ?? 'Địa chỉ mặc định')}</Text>
          <TouchableOpacity onPress={fetchLocation}><Text style={{ color: AppColors.primary, marginTop: 6 }}>Cập nhật vị trí</Text></TouchableOpacity>
          <Text style={{ marginTop: 8 }}>Thời gian dự kiến: Giao trong 3-5 ngày</Text>
          <Text>Phí vận chuyển: 15.000đ</Text>
        </View>

        {/* 8. Shop info removed as requested */}

        {/* 7. Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text numberOfLines={5} style={{ color: '#444' }}>{product.description}</Text>
          {product.description && product.description.length > 100 && (
            <TouchableOpacity onPress={() => Alert.alert('Mô tả đầy đủ', product.description)}>
              <Text style={{ color: AppColors.primary, marginTop: 8 }}>Xem thêm</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 8. Ingredients */}
        {product.ingredients && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thành phần</Text>
            <Text style={{ color: '#444' }}>{product.ingredients}</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 13. Sticky bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomIcon}><MessageCircle size={20} color="#333" /></TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
          <Heart
            size={22}
            color={fav ? "#FF4D4D" : "#fff"} // Đổi màu đỏ khi active
            fill={fav ? "#FF4D4D" : "transparent"} // Đổ màu bên trong
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}><Text style={{ color: '#fff' }}>Thêm vào giỏ</Text></TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}><Text style={{ color: '#fff', fontWeight: '800' }}>Mua ngay</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 },
  headerRow: { paddingTop: 36, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 8 },
  scroll: { marginTop: 0 },
  bannerContainer: { height: 360, backgroundColor: '#fafafa', alignItems: 'center', justifyContent: 'center' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  indicatorRow: { position: 'absolute', bottom: 12, flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)', marginHorizontal: 4 },
  dotActive: { backgroundColor: AppColors.primary },
  section: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f2', backgroundColor: AppColors.surface },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#222' },
  rating: { color: '#666' },
  price: { fontSize: 22, fontWeight: '900', color: AppColors.primary },
  priceOld: { textDecorationLine: 'line-through', color: '#999' },
  discount: { color: '#fff', backgroundColor: AppColors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  variantLabel: { fontSize: 13, fontWeight: '700' },
  variantPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: '#eee' },
  variantPillActive: { backgroundColor: AppColors.primaryLight, borderColor: AppColors.primary },
  variantText: { color: '#333' },
  variantTextActive: { color: AppColors.primary, fontWeight: '700' },
  qtyBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center' },
  promoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: AppColors.surface, borderRadius: 8, borderWidth: 1, borderColor: '#f2f2f2' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  relatedCard: { width: 120, marginRight: 12, backgroundColor: AppColors.surface, padding: 8, borderRadius: 8, alignItems: 'center' },
  followBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: AppColors.primary },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, backgroundColor: AppColors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  bottomIcon: { padding: 10, borderRadius: 8, backgroundColor: AppColors.surface },
  cartBtn: { backgroundColor: AppColors.primaryDark, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8 },
  buyBtn: { backgroundColor: '#C8184A', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 8 }
});