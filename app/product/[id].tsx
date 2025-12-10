import products from '@/constants/products';
import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useRecent } from '@/contexts/RecentContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, MessageCircle, Share2, ShoppingCart } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// This is a single-file product detail screen scaffolded to cover the 13 sections.
// Replace placeholder data & integrate with backend as needed.

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addRecent } = useRecent();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const paramId = Array.isArray(id) ? id[0] : id;

  type ProductType = {
    id: number | string;
    name: string;
    rating: number;
    reviews: number;
    sold: number;
    price: number;
    priceOld: number;
    discountPercent: number;
    images: any[];
    variants: Record<string, string[]>;
    description: string;
    category?: string;
    tags?: string[];
  };

  // Lookup product by id from shared product list
  const product = useMemo<ProductType>(() => {
    const pid = Number(paramId);
    const found = products.find(p => Number(p.id) === pid);
    if (found) return {
      id: found.id,
      name: found.name,
      rating: found.rating ?? 0,
      reviews: (found as any).reviews ?? 0,
      sold: (found as any).sold ?? 0,
      price: found.price,
      priceOld: (found as any).priceOld ?? Math.round(found.price * 1.2),
      discountPercent: found.discount ?? 0,
      images: Array.isArray((found as any).image) ? (found as any).image : [(found as any).image],
      variants: (found as any).variants ?? {},
      description: (found as any).description ?? '',
      category: (found as any).category ?? '',
      tags: (found as any).tags ?? []
    };
    // fallback minimal product
    return {
      id: paramId ?? 'p-1',
      name: 'Sản phẩm không tồn tại',
      rating: 0,
      reviews: 0,
      sold: 0,
      price: 0,
      priceOld: 0,
      discountPercent: 0,
      images: ['https://via.placeholder.com/800x800.png?text=No+Image'],
      variants: {},
      description: '',
      category: '',
      tags: []
    };
  }, [paramId]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<{ [k: string]: string }>({});
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [note, setNote] = useState('');
  const [shippingAddress, setShippingAddress] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const subtotal = useMemo(() => product.price * qty, [product.price, qty]);

  const relatedProducts = useMemo(() => {
    const prodTags = (product as any).tags ?? [];
    const nameLower = product.name.toLowerCase();

    // Prioritize tag intersection, then same category, then keyword match (e.g., "serum")
    const byTag = products.filter(p => (p as any).tags && prodTags.some((t: string) => ((p as any).tags as string[]).includes(t)));
    if (byTag.length > 0) return byTag.filter(p => Number(p.id) !== Number(product.id)).slice(0, 8);

    const cat = (product as any).category ? String((product as any).category).toLowerCase() : '';
    const byCat = products.filter(p => (p as any).category && String((p as any).category).toLowerCase() === cat && Number(p.id) !== Number(product.id));
    if (byCat.length > 0) return byCat.slice(0, 8);

    if (nameLower.includes('serum')) return products.filter(p => p.name.toLowerCase().includes('serum') && Number(p.id) !== Number(product.id)).slice(0, 8);

    return [];
  }, [product]);

  const handleAddToCart = () => {
    // Basic add to cart; CartItem shape: {id, name, price, qty, img}
    addToCart({ id: Number(product.id || 0), name: product.name, price: product.price, qty, img: product.images[0] });
    addRecent({ id: String(product.id), name: product.name, price: product.price, img: product.images[0] });
    Alert.alert('Đã thêm vào giỏ', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/(tabs)/Cart');
  };

  // initialize fav from FavoritesContext
  useEffect(() => {
    const idNum = Number(product.id);
    setFav(isFavorite(idNum));
  }, [product.id, isFavorite]);

  const toggleFavorite = () => {
    const idNum = Number(product.id);
    if (isFavorite(idNum)) {
      removeFavorite(idNum);
      setFav(false);
    } else {
      addFavorite({ id: Number(product.id), name: product.name, price: product.price, rating: product.rating, image: product.images[0] as any });
      setFav(true);
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

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#00000000", "#ffffff00"]} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ChevronLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => setFav(s => !s)} style={styles.iconBtn}>
              <Heart size={22} color={fav ? AppColors.primary : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ sản phẩm')} style={styles.iconBtn}>
              <Share2 size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/Cart') } style={styles.iconBtn}>
              <ShoppingCart size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 2. Banner images (carousel simplified) */}
        <View style={styles.bannerContainer}>
          {(() => {
            const src = product.images[activeImage];
            return <Image source={typeof src === 'string' ? { uri: src } : src} style={styles.bannerImage} />;
          })()}
          <View style={styles.indicatorRow}>
            {product.images.map((_, i) => (
              <View key={i} style={[styles.dot, activeImage === i && styles.dotActive]} />
            ))}
          </View>
        </View>
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, paddingHorizontal: 12 }}>
            {product.images.map((src, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveImage(i)} style={{ marginRight: 8, borderRadius: 8, overflow: 'hidden', borderWidth: activeImage === i ? 2 : 1, borderColor: activeImage === i ? AppColors.primary : '#eee' }}>
                <Image source={typeof src === 'string' ? { uri: src } : src} style={{ width: 72, height: 72 }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 3. Title + rating */}
        <View style={styles.section}>
          <Text style={styles.title}>{product.name}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.rating}>⭐ {product.rating} · {product.reviews.toLocaleString()} đánh giá · {product.sold.toLocaleString()} đã bán</Text>
            <TouchableOpacity onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ') }>
              <Text style={{ color: AppColors.primary }}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Price */}
        <View style={styles.section}>
          <Text style={styles.price}>{product.price.toLocaleString()}đ</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.priceOld}>{product.priceOld.toLocaleString()}đ</Text>
            <Text style={styles.discount}>{product.discountPercent}%</Text>
          </View>
        </View>

        {/* 5. Variant selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phân loại</Text>
          {Object.entries(product.variants).map(([k, opts]) => (
            <View key={k} style={{ marginTop: 8 }}>
              <Text style={styles.variantLabel}>{k}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {opts.map((o: string) => (
                  <Pressable
                    key={o}
                    onPress={() => setSelectedVariant(s => ({ ...s, [k]: o }))}
                    style={[styles.variantPill, selectedVariant[k] === o && styles.variantPillActive]}
                  >
                    <Text style={selectedVariant[k] === o ? styles.variantTextActive : styles.variantText}>{o}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <View style={{ marginTop: 12 }}>
            <Text>Bạn đã chọn: {Object.values(selectedVariant).join(' – ') || 'Chưa chọn'}</Text>
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
            <Text>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(q => q + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
            <Text style={{ marginLeft: 12 }}>Tổng: {subtotal.toLocaleString()}đ</Text>
          </View>
        </View>

        {/* 6. Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khuyến mãi & Voucher</Text>
          <TouchableOpacity onPress={() => Alert.alert('Voucher', 'Thu thập voucher')} style={styles.promoRow}>
            <Text>Giảm 15% cho đơn hàng từ 199k</Text>
              <Text style={{ color: AppColors.primary }}>Thu thập</Text>
          </TouchableOpacity>
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

        {/* 9. Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text numberOfLines={5} style={{ color: '#444' }}>{product.description}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Xem thêm', product.description)}>
            <Text style={{ color: AppColors.primary, marginTop: 8 }}>Xem thêm</Text>
          </TouchableOpacity>
        </View>

        {/* 10. Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
          <View style={styles.specRow}><Text>Thương hiệu</Text><Text>CeraVe</Text></View>
          <View style={styles.specRow}><Text>Xuất xứ</Text><Text>Mỹ</Text></View>
          <View style={styles.specRow}><Text>Dung tích</Text><Text>50ml</Text></View>
          <View style={styles.specRow}><Text>Kết cấu</Text><Text>Cream</Text></View>
        </View>

        {/* 11. Reviews (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá khách hàng</Text>
          <Text style={{ fontWeight: '700' }}>{product.rating} · {product.reviews.toLocaleString()} đánh giá</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '700' }}>⭐⭐⭐⭐⭐</Text>
            <Text>Dưỡng ẩm rất tốt, giao nhanh, hàng chuẩn chính hãng.</Text>
          </View>
        </View>

        {/* 12. Related products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {relatedProducts.length === 0 ? (
              <View style={{ padding: 12 }}><Text style={{ color: '#999' }}>Không có sản phẩm liên quan</Text></View>
            ) : (
              relatedProducts.map((p: any) => (
                <TouchableOpacity key={p.id} style={styles.relatedCard} onPress={() => router.push(`/product/${p.id}`)}>
                  <Image source={typeof p.image === 'string' ? { uri: p.image } : p.image} style={{ width: 100, height: 100 }} />
                  <Text style={{ fontSize: 12, fontWeight: '700', textAlign: 'center' }} numberOfLines={2}>{p.name}</Text>
                  <Text style={{ color: AppColors.primary, fontWeight: '700' }}>{p.price.toLocaleString()}đ</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 13. Sticky bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomIcon}><MessageCircle size={20} color="#333" /></TouchableOpacity>
          <TouchableOpacity style={styles.bottomIcon} onPress={() => setFav(s => !s)}>
          <Heart size={20} color={fav ? AppColors.primary : '#333'} />
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