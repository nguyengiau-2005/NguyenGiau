import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, MessageCircle, ShoppingCart, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import Services & Contexts
import apiProduct, { ProductData } from '@/api/apiProduct';
import apiSize, { SizeData } from '@/api/apiSize';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { formatPriceFromAPI } from '@/utils/formatPrice';
import toImageSource from '@/utils/toImageSource';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [sizes, setSizes] = useState<SizeData[]>([]);
  const [selectedSize, setSelectedSize] = useState<SizeData | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const res = await apiProduct.getAllProducts();
        const found = res.results.find((p) => String(p.id) === String(id));

        if (found) {
          setProduct(found);
          try {
            const productSizes = await apiSize.getSizesByProductId(id as string);
            setSizes(productSizes);
            if (productSizes.length > 0) {
              setSelectedSize(productSizes[0]);
            }
          } catch (sizeErr) {
            console.error("Lỗi lấy danh sách size:", sizeErr);
          }
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  const isFav = product ? isFavorite(product.id) : false;

  const handleToggleFavorite = () => {
    if (!product) return;
    if (isFav) {
      removeFavorite(product.id);
    } else {
      addFavorite({
        id: product.id,
        name: product.Name,
        price: Number(product.Price),
        rating: 5.0,
        image: Array.isArray(product.Image)
          ? (toImageSource(product.Image[0])?.uri || '')
          : (toImageSource(product.Image)?.uri || '')
      });
    }
  };

  const handleAddToCart = (showMsg = true) => {
    if (!product) return false;
    if (sizes.length > 0 && !selectedSize) {
      Alert.alert('Thông báo', 'Vui lòng chọn size sản phẩm');
      return false;
    }

    addToCart({
      id: product.id,
      name: product.Name,
      price: Number(product.Price),
      qty: qty,
      volume: selectedSize ? selectedSize.milion : 'Mặc định',
      img: Array.isArray(product.Image)
        ? (toImageSource(product.Image[0])?.uri || '')
        : (toImageSource(product.Image)?.uri || '')
    });

    if (showMsg) Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
    return true;
  };

  const handleChatWithSeller = () => {
    if (!product) return;

    const imgData = Array.isArray(product.Image) ? product.Image[0] : product.Image;
    const imageUrlString = toImageSource(imgData)?.uri || '';

    router.push({
      pathname: '/support/chat',
      params: {
        productId: String(product.id),
        productName: product.Name,
        productPrice: String(product.Price),
        productImage: imageUrlString,
        fromProduct: 'true'
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: AppColors.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageList = product?.Image ? (Array.isArray(product.Image) ? product.Image : [product.Image]) : [];
  const totalPrice = Number(product.Price) * qty;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Navigation */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={styles.iconBtn}>
          <ShoppingCart size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Slider Images */}
        <View style={styles.imageContainer}>
          <FlatList
            data={imageList}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={toImageSource(item)} style={styles.mainImage} />
            )}
          />
          {imageList.length > 1 && (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{activeImageIndex + 1}/{imageList.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.priceText}>{formatPriceFromAPI(product.Price)}</Text>
          <Text style={styles.productName}>{product.Name}</Text>
          <View style={styles.ratingRow}>
            <Star size={14} color="#FFB300" fill="#FFB300" />
            <Text style={styles.ratingText}>5.0</Text>
            <Text style={styles.soldText}>Đã bán 1.2k+</Text>
          </View>
        </View>

        {/* Size Selection */}
        {sizes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn Size (Dung tích)</Text>
            <View style={styles.sizeRow}>
              {sizes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedSize(item)}
                  style={[styles.sizeChip, selectedSize?.id === item.id && styles.sizeChipActive]}
                >
                  <Text style={[styles.sizeText, selectedSize?.id === item.id && styles.sizeTextActive]}>
                    {item.milion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quantity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(q => q + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>{product.Description || "Sản phẩm chính hãng chất lượng cao."}</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomActionIcons}>
          <TouchableOpacity style={styles.bottomIconBtn} onPress={handleChatWithSeller}>
            <MessageCircle size={22} color="#666" />
            <Text style={styles.iconSubText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomIconBtn} onPress={handleToggleFavorite}>
            <Heart size={22} color={isFav ? AppColors.primary : "#666"} fill={isFav ? AppColors.primary : "transparent"} />
            <Text style={styles.iconSubText}>Thích</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartBtn} onPress={() => handleAddToCart(true)}>
          <Text style={styles.addToCartPrice}>{formatPriceFromAPI(totalPrice)}</Text>
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={() => {
            const success = handleAddToCart(false);
            if (success) router.push('/(tabs)/Cart');
          }}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  imageContainer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, backgroundColor: '#F8F8F8' },
  mainImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: 'cover' },
  imageBadge: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  imageBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  contentSection: { padding: 16, borderBottomWidth: 8, borderBottomColor: '#F5F5F5' },
  priceText: { fontSize: 24, fontWeight: '900', color: AppColors.primary, marginBottom: 8 },
  productName: { fontSize: 18, fontWeight: '600', color: '#333', lineHeight: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  ratingText: { fontWeight: '700', fontSize: 14 },
  soldText: { color: '#888', fontSize: 14 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#F5F5F5' },
  sizeChipActive: { backgroundColor: '#E3F2FD', borderColor: AppColors.primary },
  sizeText: { color: '#666', fontSize: 14 },
  sizeTextActive: { color: AppColors.primary, fontWeight: '700' },
  descriptionText: { fontSize: 14, color: '#666', lineHeight: 22 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  qtyBtn: { width: 36, height: 36, borderWidth: 1, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  qtyBtnText: { fontSize: 20, color: '#333' },
  qtyValue: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 25 },
  bottomActionIcons: { flexDirection: 'row', gap: 18, paddingRight: 10 },
  bottomIconBtn: { alignItems: 'center', justifyContent: 'center' },
  iconSubText: { fontSize: 10, color: '#666', marginTop: 4 },
  addToCartBtn: { flex: 1.3, backgroundColor: '#E3F2FD', height: 52, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  addToCartPrice: { color: AppColors.primary, fontSize: 11, fontWeight: '600', marginBottom: -2 },
  addToCartText: { color: AppColors.primary, fontWeight: '700', fontSize: 13 },
  buyNowBtn: { flex: 1, backgroundColor: AppColors.primary, height: 52, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 8 },
  buyNowText: { color: '#fff', fontWeight: '700', fontSize: 14 }
});