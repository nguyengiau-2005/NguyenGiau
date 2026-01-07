import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, MessageCircle, ShoppingCart, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import Services & Contexts
import apiProduct, { ProductData } from '@/api/apiProduct';
import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import toImageSource from '@/utils/toImageSource';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // 1. Lấy dữ liệu sản phẩm từ API khi trang mount
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const res = await apiProduct.getAllProducts();
        const found = res.results.find((p) => String(p.id) === String(id));
        if (found) {
          setProduct(found);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  // 2. Logic Xử lý Yêu thích & Giỏ hàng
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
        image: toImageSource(product.Image)?.uri || ''
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.Name,
      price: Number(product.Price),
      qty: qty,
      img: toImageSource(product.Image)?.uri || ''
    });
    Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
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
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={{color: AppColors.primary}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header Overlay */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={styles.iconBtn}>
            <ShoppingCart size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Hình ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          <Image 
            source={toImageSource(product.Image) || { uri: 'https://via.placeholder.com/400' }} 
            style={styles.mainImage} 
          />
        </View>

        {/* 2. Thông tin giá và tên */}
        <View style={styles.contentSection}>
          <Text style={styles.priceText}>{Number(product.Price).toLocaleString()}đ</Text>
          <Text style={styles.productName}>{product.Name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.starGroup}>
              <Star size={14} color="#FFB300" fill="#FFB300" />
              <Text style={styles.ratingText}>5.0</Text>
            </View>
            <Text style={styles.soldText}>Đã bán 1.2k+</Text>
          </View>
        </View>

        {/* 3. Phân loại (Số lượng) */}
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

        {/* 4. Mô tả sản phẩm (Dữ liệu từ Baserow) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>
            {product.Description || "Sản phẩm chính hãng với công dụng dưỡng da vượt trội, phù hợp cho mọi loại da. Thành phần an toàn, không gây kích ứng."}
          </Text>
        </View>

        {/* 5. Thông số kỹ thuật */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Danh mục</Text>
            <Text style={styles.specValue}>{Array.isArray(product.Categories) ? product.Categories[0]?.value : 'Làm đẹp'}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Tình trạng</Text>
            <Text style={styles.specValue}>Còn hàng</Text>
          </View>
        </View>
      </ScrollView>

      {/* 6. Thanh điều hướng dưới cùng (Sticky Bottom Bar) */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomActionIcons}>
          <TouchableOpacity style={styles.bottomIconBtn}>
            <MessageCircle size={22} color="#666" />
            <Text style={styles.iconSubText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomIconBtn} onPress={handleToggleFavorite}>
            <Heart size={22} color={isFav ? AppColors.primary : "#666"} fill={isFav ? AppColors.primary : "transparent"} />
            <Text style={styles.iconSubText}>Thích</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyNowBtn} onPress={() => { handleAddToCart(); router.push('/(tabs)/Cart'); }}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center', elevation: 2
  },
  imageContainer: { width: '100%', height: 400, backgroundColor: '#F8F8F8' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  contentSection: { padding: 16, borderBottomWidth: 8, borderBottomColor: '#F5F5F5' },
  priceText: { fontSize: 24, fontWeight: '900', color: AppColors.primary, marginBottom: 8 },
  productName: { fontSize: 18, fontWeight: '600', color: '#333', lineHeight: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  starGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontWeight: '700', fontSize: 14 },
  soldText: { color: '#888', fontSize: 14 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  descriptionText: { fontSize: 14, color: '#666', lineHeight: 22 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  qtyBtn: { width: 32, height: 32, borderWidth: 1, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  qtyBtnText: { fontSize: 18, color: '#333' },
  qtyValue: { fontSize: 16, fontWeight: '700' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  specLabel: { color: '#888' },
  specValue: { fontWeight: '500', color: '#333' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 70, backgroundColor: '#fff', flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#EEE'
  },
  bottomActionIcons: { flexDirection: 'row', gap: 15, paddingRight: 10 },
  bottomIconBtn: { alignItems: 'center', justifyContent: 'center' },
  iconSubText: { fontSize: 10, color: '#666', marginTop: 2 },
  addToCartBtn: {
    flex: 1, backgroundColor: '#E1F5FE', height: 45,
    justifyContent: 'center', alignItems: 'center', borderRadius: 4
  },
  addToCartText: { color: AppColors.primary, fontWeight: '700', fontSize: 14 },
  buyNowBtn: {
    flex: 1, backgroundColor: AppColors.primary, height: 45,
    justifyContent: 'center', alignItems: 'center', borderRadius: 4, marginLeft: 8
  },
  buyNowText: { color: '#fff', fontWeight: '700', fontSize: 14 }
});