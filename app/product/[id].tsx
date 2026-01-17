import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Imports ---
import apiProduct, { Product } from '@/api/apiProduct';
import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { formatPriceFromAPI } from '@/utils/formatPrice';
import toImageSource from '@/utils/toImageSource';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Contexts
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // States
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await apiProduct.getById(Number(id));
          setProduct(data);
          // Mặc định chọn size đầu tiên nếu có
          if (data.product_sizes && data.product_sizes.length > 0) {
            setSelectedSize(data.product_sizes[0].value);
          }
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    // Kiểm tra nếu sản phẩm có size nhưng người dùng chưa chọn (phòng hờ)
    if (product.product_sizes && product.product_sizes.length > 0 && !selectedSize) {
      Alert.alert("Thông báo", "Vui lòng chọn kích thước sản phẩm");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      img: toImageSource(product.image)?.uri || '',
      qty: quantity,
      size: selectedSize || undefined,
    });

    Alert.alert("🛒 Thành công", `Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
  };

  const toggleFavorite = () => {
    if (!product) return;
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: toImageSource(product.image)?.uri || '',
        rating: 5.0 // Giá trị mặc định
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ marginBottom: 10 }}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: AppColors.primary, fontWeight: 'bold' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. HEADER ACTIONS (Nút Back và Heart) */}
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.iconCircle}>
          <Heart
            size={22}
            color={AppColors.primary}
            fill={isFavorite(product.id) ? AppColors.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* 2. ẢNH SẢN PHẨM */}
        <Image source={toImageSource(product.image)} style={styles.mainImage} />

        {/* 3. NỘI DUNG THÔNG TIN (infoSection) */}
        <View style={styles.infoSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.ratingBox}>
              <Star size={16} color="#FFB300" fill="#FFB300" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>

          <Text style={styles.productPrice}>{formatPriceFromAPI(product.price)}</Text>
          <View style={styles.divider} />

          <Text style={styles.descriptionLabel}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>
            {product.description || "Sản phẩm cao cấp thuộc bộ sưu tập Fiora Luxe."}
          </Text>

          {/* CHỌN SIZE */}
          {product.product_sizes && product.product_sizes.length > 0 && (
            <View style={styles.sizeSection}>
              <Text style={styles.label}>Kích thước</Text>
              <View style={styles.sizeList}>
                {product.product_sizes.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.sizeItem, selectedSize === s.value && styles.sizeItemActive]}
                    onPress={() => setSelectedSize(s.value)}
                  >
                    <Text style={[styles.sizeText, selectedSize === s.value && styles.sizeTextActive]}>
                      {s.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* CHỌN SỐ LƯỢNG */}
          <View style={styles.quantitySection}>
            <Text style={styles.label}>Số lượng</Text>
            <View style={styles.quantityStepper}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.stepBtn}>
                <Minus size={18} color="#333" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.stepBtn}>
                <Plus size={18} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View> {/* ĐÓNG infoSection */}
      </ScrollView> {/* ĐÓNG ScrollView */}

      {/* 4. BOTTOM BAR (Thanh toán) */}
      <SafeAreaView style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalPrice}>
              {formatPriceFromAPI(Number(product.price) * quantity)}
            </Text>
          </View>
          <TouchableOpacity style={styles.buyBtn} onPress={handleAddToCart}>
            <ShoppingCart size={20} color="white" />
            <Text style={styles.buyBtnText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View> // ĐÓNG container chính
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  mainImage: { width: width, height: width * 1.2, resizeMode: 'cover' },
  infoSection: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    minHeight: 400
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 15 },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  ratingText: { marginLeft: 4, fontWeight: '700', color: '#FFB300', fontSize: 14 },
  productPrice: { fontSize: 22, fontWeight: '900', color: AppColors.primary, marginTop: 8 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  descriptionLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#666', lineHeight: 22 },
  label: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  sizeSection: { marginTop: 24 },
  sizeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sizeItem: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F0F0F0'
  },
  sizeItemActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  sizeText: { fontWeight: '700', color: '#666', fontSize: 14 },
  sizeTextActive: { color: '#fff' },
  quantitySection: { marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 6
  },
  stepBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  quantityText: { marginHorizontal: 20, fontWeight: '800', fontSize: 18, color: '#1A1A1A' },
  bottomBarContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  totalLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  totalPrice: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
  buyBtn: {
    flexDirection: 'row',
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center',
    gap: 10,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buyBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
});