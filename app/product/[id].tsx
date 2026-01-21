import ProductAdvisor from '@/components/ProductAdvisor';
import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useRecent } from '@/contexts/RecentContext';
import { formatCurrencyFull } from '@/utils/format';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, MapPin, MessageCircle, ShoppingCart, Star, Truck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Import APIs
import apiCategory, { CategoryData } from '@/api/apiCategory';
import apiProduct, { ProductData } from '@/api/apiProduct';
import apiProductSize, { ProductSizeData } from '@/api/apiProductSize';
import apiPromotion, { PromotionData } from '@/api/apiPromotion';
import apiReview, { ReviewData } from '@/api/apiReview';

export default function ProductDetailScreen() {
  const [sizes, setSizes] = useState<ProductSizeData[]>([]);
  const [selectedSize, setSelectedSize] = useState<ProductSizeData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { addRecent } = useRecent();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const paramId = Array.isArray(id) ? id[0] : id;

  const [similarProducts, setSimilarProducts] = useState<ProductData[]>([]);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  useEffect(() => {
    if (product?.id) {
      apiProductSize.getSizesByProductId(Number(product.id)).then(res => {
        setSizes(res.results);
        if (res.results.length > 0) setSelectedSize(res.results[0]);
      });
    }
  }, [product?.id]);

  useEffect(() => {
    // hide the default native/header shown by the router for this screen
    try { navigation.setOptions?.({ headerShown: false }); } catch (e) { /* ignore if not available */ }

    const fetchProductData = async () => {
      if (!paramId) return;
      try {
        setLoading(true);
        const pid = Number(paramId);
        const productData = await apiProduct.getProductDetail(pid);
        setProduct(productData);

        if (productData.category_id?.[0]) {
          const categoryId = productData.category_id[0].id;
          const [catData, simRes] = await Promise.all([
            apiCategory.getCategoryDetail(categoryId),
            apiProduct.getProductsByCategory(categoryId)
          ]);
          setCategory(catData);
          setSimilarProducts((simRes.results || []).filter((p: ProductData) => p.id !== productData.id));
        }

        const promoData = await apiPromotion.getPublicPromotions();
        setPromotions(promoData.results || []);

        addRecent({
          id: productData.id,
          name: productData.name,
          price: Number(productData.price) || 0,
          img: productData.image?.[0]?.url || ''
        });
        // load reviews for product
        try {
          setLoadingReviews(true);
          const r = await apiReview.getReviewsByProductId(productData.id);
          setReviews(r.results || []);
        } catch (e) {
          console.warn('Không tải được đánh giá:', e);
        } finally {
          setLoadingReviews(false);
        }
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [paramId]);

  const [activeImage, setActiveImage] = useState(0);
  const [fav, setFav] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (product) setFav(isFavorite(product.id));
  }, [product, isFavorite]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) return Alert.alert("Thông báo", "Vui lòng chọn dung tích sản phẩm");
    if (selectedSize.stock < quantity) return Alert.alert("Hết hàng", "Dung tích này hiện đã hết hàng");

    addToCart({
      id: product!.id,
      name: product!.name,
      price: Number(selectedSize.price),
      qty: quantity,
      img: product!.image?.[0]?.url || '',
      volume: `${selectedSize.size_ml}ML`,
      sizeId: selectedSize.id
    });
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
  };

  const toggleFavorite = () => {
    if (!product) return;
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      setFav(false);
    } else {
      addFavorite({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        rating: Number(product.rating) || 5.0,
        image: product.image?.[0]?.url || ''
      });
      setFav(true);
    }
  };

  const fetchLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return setLocationLoading(false);
      const pos = await Location.getCurrentPositionAsync({});
      const rev = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      if (rev?.[0]) {
        const f = rev[0];
        setShippingAddress(`${f.street || ''}, ${f.district || f.subregion || ''}, ${f.city || f.region || ''}`);
      }
    } finally { setLocationLoading(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={AppColors.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* 1. Nút Header nổi (Floating) */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleFavorite} style={styles.circleBtn}>
            <Heart size={22} color={fav ? "#FF4D4D" : "#333"} fill={fav ? "#FF4D4D" : "transparent"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setChatVisible(true)} style={styles.circleBtn}>
            <MessageCircle size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={styles.circleBtn}>
            <ShoppingCart size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[]} scrollEventThrottle={16}>
        <View style={styles.bannerWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const index = Math.round(offset / width);
              setActiveImage(index);
            }}
          >
            {product?.image?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.url }}
                style={{ width: width, height: width, resizeMode: 'contain' }}
              />
            ))}
          </ScrollView>

          <ProductAdvisor visible={chatVisible} onClose={() => setChatVisible(false)} product={product} />

          <View style={styles.imageCounter}>
            <Text style={styles.counterText}>{activeImage + 1}/{product?.image?.length}</Text>
          </View>
        </View>
        {/* 3. Main Info Section */}
        <View style={styles.mainContent}>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatCurrencyFull(selectedSize?.price || product?.price || '0')}</Text>
            <View style={styles.discountBadge}><Text style={styles.discountText}>-15%</Text></View>
          </View>
          <Text style={styles.productName}>{product?.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starBox}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.ratingText}>{product?.rating || '5.0'}</Text>
            </View>
            <Text style={styles.soldText}>Đã bán {product?.sold || 0}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.categoryText}>{category?.name}</Text>
          </View>
        </View>

        {/* 4. Variant Selection */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>Chọn dung tích</Text>
          <View style={styles.sizeGrid}>
            {sizes.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSize(s)}
                style={[styles.sizePill, selectedSize?.id === s.id && styles.sizePillActive]}
              >
                <Text style={[styles.sizePillText, selectedSize?.id === s.id && styles.sizePillTextActive]}>
                  {s.size_ml}ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.qtyContainer}>
            <Text style={styles.qtyLabel}>Số lượng <Text style={styles.stockText}>(Kho: {selectedSize?.stock || 0})</Text></Text>
            <View style={styles.qtyPicker}>
              <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyAction}><Text style={styles.qtyActionText}>-</Text></TouchableOpacity>
              <Text style={styles.qtyNumber}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyAction}><Text style={styles.qtyActionText}>+</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Shipping & Promotions */}
        <View style={styles.whiteCard}>
          <TouchableOpacity style={styles.infoRow} onPress={fetchLocation}>
            <MapPin size={18} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {locationLoading ? 'Đang định vị...' : (shippingAddress || 'Chọn địa chỉ giao hàng')}
            </Text>
            <ChevronLeft size={16} color="#CCC" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.infoRow}>
            <Truck size={18} color="#666" />
            <Text style={styles.infoText}>Miễn phí vận chuyển cho đơn từ 500k</Text>
          </View>
        </View>

        {/* 6. Description */}
        {/* 6. Description */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>Chi tiết sản phẩm</Text>

          <Text
            style={styles.descText}
            numberOfLines={isExpanded ? undefined : 6} // Nếu mở rộng thì không giới hạn dòng
          >
            {product?.description}
          </Text>

          {/* Chỉ hiển thị nút nếu nội dung đủ dài (ví dụ > 150 ký tự) */}
          {product?.description && product.description.length > 150 && (
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => setIsExpanded(!isExpanded)} // Đảo ngược trạng thái khi nhấn
            >
              <Text style={styles.moreText}>
                {isExpanded ? 'Thu gọn nội dung' : 'Xem thêm nội dung'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* 8. Reviews Section */}
        <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
          <Text style={[styles.cardTitle, { marginLeft: 0 }]}>Đánh giá</Text>
          {loadingReviews ? (
            <ActivityIndicator color={AppColors.primary} />
          ) : reviews.length === 0 ? (
            <Text style={{ color: '#666' }}>Chưa có đánh giá cho sản phẩm này.</Text>
          ) : (
            reviews.map((r) => {
              // normalize fields from Baserow which may vary in casing and naming
              const ratingVal = (r as any).Rating ?? (r as any).rating ?? (r as any).rating_value ?? '5';
              const commentVal = (r as any).Comment ?? (r as any).comment ?? '';
              const createdAt = (r as any).created_at ?? (r as any).created ?? (r as any).createdAt ?? null;
              const imagesArr = (r as any).Image ?? (r as any).Images ?? (r as any).image ?? (r as any).image_url ?? [];
              const qty = (r as any).Quantity ?? (r as any).quantity ?? (r as any).quatity ?? undefined;
              const userField = (r as any).User ?? (r as any).user ?? [];
              const userDisplay = (userField && userField[0] && (userField[0].value || userField[0].name)) ? (userField[0].value || userField[0].name) : undefined;

              return (
                <View key={r.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <Text style={{ fontWeight: '700' }}>{userDisplay ? String(userDisplay).charAt(0).toUpperCase() : 'U'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Star size={12} color="#FFB800" fill="#FFB800" />
                        <Text style={{ marginLeft: 6, fontWeight: '700' }}>{ratingVal}</Text>
                        {qty !== undefined && <Text style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>Số lượng: {qty}</Text>}
                      </View>
                      <Text style={{ color: '#999', fontSize: 12 }}>{createdAt ? new Date(createdAt).toLocaleDateString() : ''}</Text>
                    </View>
                  </View>
                  {commentVal ? <Text style={{ color: '#222', marginBottom: 8 }}>{commentVal}</Text> : null}
                  {(imagesArr && Array.isArray(imagesArr) && imagesArr.length > 0) && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {imagesArr.map((img: any, idx: number) => {
                        // image can be a file object with url, or a string filename
                        const uri = typeof img === 'string' ? (img.startsWith('http') ? img : `https://files.baserow.io/user_files/${img}`) : (img && img.url ? img.url : null);
                        if (!uri) return null;
                        return <Image key={idx} source={{ uri }} style={{ width: 120, height: 120, borderRadius: 8, marginRight: 8 }} />;
                      })}
                    </ScrollView>
                  )}
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 100 }} />

        {/* 7. Similar Products */}
        {similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.cardTitle}>Sản phẩm tương tự</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }} // Thêm lề phải để item cuối không bị sát mép
            >
              {similarProducts.map((item) => (
                <TouchableOpacity key={item.id} style={styles.similarCard} onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}>
                  <Image source={{ uri: item.image?.[0]?.url }} style={styles.similarImg} />
                  <View style={styles.simInfo}>
                    <Text style={styles.simName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.simRatingRow}>
                      <View style={styles.simRating}><Star size={12} color="#FFB800" fill="#FFB800" /><Text style={styles.simRatingText}>{item.rating || '5.0'}</Text></View>
                      <Text style={styles.simSold}>· {item.sold || 0}</Text>
                    </View>
                    <Text style={styles.simPrice}>{formatCurrencyFull(item.price)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price) || 0,
                        qty: 1,
                        img: item.image?.[0]?.url || '',
                        volume: '',
                        sizeId: undefined,
                      });
                      Alert.alert('Đã thêm', 'Sản phẩm đã được thêm vào giỏ hàng');
                    }}
                    style={styles.simCartBtn}
                  >
                    <ShoppingCart size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* 8. Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomActions}>
          <View style={styles.vDivider} />
          <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/(tabs)/Cart')}><ShoppingCart size={24} color="#666" /><Text style={styles.chatText}>Giỏ hàng</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}><Text style={styles.addCartText}>Thêm vào giỏ</Text></TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={() => { handleAddToCart(); router.push('/user/checkout') }}><Text style={styles.buyNowText}>Mua ngay</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingHeader: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  headerRight: { flexDirection: 'row', gap: 10 },
  bannerWrapper: { width: width, height: width, backgroundColor: '#FFF' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  imageCounter: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  counterText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  mainContent: { backgroundColor: '#FFF', padding: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  priceText: { fontSize: 28, fontWeight: '900', color: AppColors.primary },
  discountBadge: { backgroundColor: '#FFEEF1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: AppColors.primary, fontSize: 12, fontWeight: '700' },
  productName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', lineHeight: 24, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  starBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#FFB800' },
  soldText: { fontSize: 13, color: '#888', marginLeft: 10 },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#DDD', marginHorizontal: 10 },
  categoryText: { fontSize: 13, color: AppColors.primary, fontWeight: '600' },
  whiteCard: { backgroundColor: '#FFF', marginTop: 12, padding: 16, borderRadius: 20, marginHorizontal: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 16 },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizePill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F5F7F9', borderWidth: 1, borderColor: '#F5F7F9' },
  sizePillActive: { backgroundColor: '#FFF0F3', borderColor: AppColors.primary },
  sizePillText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sizePillTextActive: { color: AppColors.primary, fontWeight: '700' },
  qtyContainer: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyLabel: { fontSize: 14, fontWeight: '600', color: '#444' },
  stockText: { fontSize: 12, color: '#999', fontWeight: '400' },
  qtyPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7F9', borderRadius: 10, padding: 4 },
  qtyAction: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyActionText: { fontSize: 20, color: '#333' },
  qtyNumber: { paddingHorizontal: 15, fontSize: 15, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#555' },
  descText: { fontSize: 14, color: '#666', lineHeight: 22 },
  moreBtn: { alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  moreText: { color: AppColors.primary, fontSize: 13, fontWeight: '600' },
  similarSection: { marginTop: 12, paddingLeft: 16, marginBottom: 20 },
  similarScroll: { paddingRight: 16, marginTop: 10 },

  // ĐÃ FIX: Gộp tương tự similarCard
  similarCard: { width: 150, backgroundColor: '#FFF', borderRadius: 16, padding: 10, marginRight: 12, position: 'relative', overflow: 'hidden', elevation: 2 },
  similarImg: { width: '100%', height: 120, borderRadius: 12, marginBottom: 8, backgroundColor: '#f0f0f0' },
  simInfo: { flex: 1 },
  simName: { fontSize: 13, color: '#222', fontWeight: '700', height: 36 },

  simRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  simRating: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
  simRatingText: { fontSize: 12, color: '#444', marginLeft: 4, fontWeight: '700' },
  simSold: { fontSize: 11, color: '#888' },
  simPrice: { fontSize: 14, fontWeight: '800', color: AppColors.primary, marginTop: 6 },
  simCartBtn: { position: 'absolute', right: 12, bottom: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4 },

  bottomBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', height: 85, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  bottomActions: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chatBtn: { alignItems: 'center', paddingHorizontal: 10 },
  chatText: { fontSize: 10, color: '#666', marginTop: 4 },
  vDivider: { width: 1, height: 24, backgroundColor: '#EEE', marginHorizontal: 5 },
  addCartBtn: { backgroundColor: '#e15c2c', paddingHorizontal: 15, height: 48, justifyContent: 'center', borderRadius: 12, marginRight: 8 },
  addCartText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  buyNowBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 20, height: 48, justifyContent: 'center', borderRadius: 12, flex: 1, alignItems: 'center' },
  buyNowText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});