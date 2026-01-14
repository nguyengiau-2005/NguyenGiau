import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertCircle, Bell, Camera, Gift, Heart, MapPin, Menu, Search, ShoppingCart, Sparkles, Star, TrendingUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Import API Services
import apiCategory, { CategoryData } from '@/api/apiCategory';
import apiProduct, { ProductData } from '@/api/apiProduct';
import apiVoucher, { Voucher } from '@/api/apiVouchers';
import { formatPriceFromAPI } from '@/utils/formatPrice';
import toImageSource from '@/utils/toImageSource';

const banners: { id: number; image: any }[] = [
  { id: 1, image: require('../../assets/images/banner/banner1.jpg') },
  { id: 2, image: require('../../assets/images/banner/banner2.jpg') },
  { id: 3, image: require('../../assets/images/banner/banner4.jpg') }
];

const searchSuggestions = ['Serum Vitamin C', 'Kem dưỡng ẩm', 'Sữa rửa mặt', 'Mặt nạ', 'Nước hoa'];
const searchHistory = ['Serum', 'Kem chống nắng'];

export default function HomeScreen() {
  const { addToCart, cart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();

  // States cho dữ liệu từ API
  const [productsList, setProductsList] = useState<ProductData[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryData[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef<ScrollView | null>(null);

  // Auto-play settings cho Banner
  const SLIDE_WIDTH = 292;
  const SLIDE_INTERVAL = 4000;

  // Gọi API lấy dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, voucherRes] = await Promise.all([
          apiProduct.getAllProducts(),
          apiCategory.getAllCategories(),
          apiVoucher.getVouchers()
        ]);
        setProductsList(prodRes.results);
        setCategoriesList(catRes.results);
        setVouchers(voucherRes);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % banners.length;
        bannerRef.current?.scrollTo({ x: next * SLIDE_WIDTH, animated: true });
        return next;
      });
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (product: ProductData) => {
    const imgUri = toImageSource(product.Image)?.uri || '';
    addToCart({
      id: product.id,
      name: product.Name,
      // SỬA LỖI: Chuyển đổi Price từ string sang number để khớp với kiểu dữ liệu của CartItem
      price: Number(product.Price) || 0,
      img: imgUri,
      qty: 1
    });
    Alert.alert('Thành công', `${product.Name} đã được thêm vào giỏ hàng`);
  };

  const headerCartCount = cart.reduce((sum, it) => sum + (it.qty || 0), 0);

  const handleToggleFavorite = (product: ProductData) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      const favImg = toImageSource(product.Image)?.uri || '';
      addFavorite({
        id: product.id,
        name: product.Name,
        // SỬA LỖI: Chuyển đổi Price sang number
        price: Number(product.Price) || 0,
        // SỬA LỖI: Chuyển rating sang kiểu number (5.0 thay vì "5.0") để khớp với FavoriteItem
        rating: 5.0,
        image: favImg
      });
    }
  };

  const filteredProducts = productsList.filter(product => {
    const q = searchText.trim().toLowerCase();

    // Filter by selected category if any
    if (selectedCategoryId) {
      const hasCat = Array.isArray(product.Categories) && product.Categories.some((c: any) => Number(c.id) === Number(selectedCategoryId));
      if (!hasCat) return false;
    }

    if (!q) return true;

    // Match product name
    if (product.Name && product.Name.toLowerCase().includes(q)) return true;

    // Match linked category names (BaserowLink.value)
    if (Array.isArray(product.Categories) && product.Categories.some((c: any) => (c.value || '').toLowerCase().includes(q))) return true;

    return false;
  });

  const renderProductCard = (item: ProductData, index: number) => (
    <TouchableOpacity
      key={index}
      style={{
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3
      }}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={{ position: 'relative', height: 160, backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
        <Image
          source={toImageSource(item.Image) || { uri: 'https://via.placeholder.com/150' }}
          style={{ width: '100%', height: '100%' }}
        />

        <TouchableOpacity
          style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#ffffff90', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => handleToggleFavorite(item)}
        >
          <Heart color="#C9A6FF" size={16} fill={isFavorite(item.id) ? '#C9A6FF' : 'transparent'} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontWeight: '700', fontSize: 12, color: '#333' }} numberOfLines={2}>{item.Name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Star size={12} color="#ffb300" fill="#ffb300" />
          <Text style={{ marginLeft: 3, fontSize: 11, fontWeight: '600', color: '#666' }}>5.0</Text>
        </View>
        <Text style={{ marginTop: 8, fontWeight: '800', fontSize: 13, color: AppColors.primary }}>{formatPriceFromAPI(item.Price)}</Text>
        <TouchableOpacity
          style={{ marginTop: 8, backgroundColor: AppColors.primaryDark, paddingVertical: 6, borderRadius: 8, alignItems: 'center' }}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf9f8' }}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#faf9f8' }} showsVerticalScrollIndicator={false}>
      {/* ====== HEADER / APP BAR ====== */}
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryLight]}
        style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <TouchableOpacity style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}>
              <Menu size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>🌸 Fiora Luxe</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}>
              <Bell size={20} color="#fff" strokeWidth={1.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12, position: 'relative' }}
              onPress={() => router.push('/(tabs)/Cart')}
            >
              <ShoppingCart size={20} color="#fff" strokeWidth={1.5} />
              <View style={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#ff5722', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{headerCartCount}</Text>
              </View>
            </TouchableOpacity>

            {user && user.avatar ? (
              <TouchableOpacity
                onPress={() => router.push('/user/edit-profile' as any)}
                style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff', overflow: 'hidden' }}
              >
                <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/user/edit-profile' as any)}
                style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}
              >
                <MapPin size={20} color="#fff" strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={{ fontSize: 12, color: '#ffffff80', fontWeight: '500', marginBottom: 12 }}>Xin chào {user ? user.fullName : 'bạn'}</Text>

        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
            <Search size={20} color={AppColors.primary} strokeWidth={2} />
            <TextInput
              placeholder="Tìm sản phẩm, thương hiệu…"
              placeholderTextColor="#ccc"
              style={{ marginLeft: 10, flex: 1, fontSize: 14, color: '#333' }}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setShowSearchDropdown(text.length > 0);
              }}
              onFocus={() => setShowSearchDropdown(true)}
            />
            <TouchableOpacity onPress={() => router.push('/search/image')} style={{ marginLeft: 10 }}>
              <Camera size={20} color={AppColors.primary} />
            </TouchableOpacity>
          </View>

          {showSearchDropdown && (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 8, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
              {searchText.length > 0 && (
                <>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', paddingHorizontal: 12, marginBottom: 6 }}>Gợi ý</Text>
                  {searchSuggestions.filter(s => s.toLowerCase().includes(searchText.toLowerCase())).map((suggestion, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                      onPress={() => {
                        setSearchText(suggestion);
                        setShowSearchDropdown(false);
                      }}
                    >
                      <Text style={{ fontSize: 13, color: '#333' }}>🔍 {suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {searchText.length === 0 && (
                <>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', paddingHorizontal: 12, marginBottom: 6 }}>Lịch sử tìm kiếm</Text>
                  {searchHistory.map((history, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                      onPress={() => {
                        setSearchText(history);
                        setShowSearchDropdown(false);
                      }}
                    >
                      <Text style={{ fontSize: 13, color: '#333' }}>⏱ {history}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      {/* ====== CAROUSEL BANNERS ====== */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, paddingHorizontal: 16 }}>
        {banners.map((banner, idx) => (
          <TouchableOpacity
            key={idx}
            style={{ width: 280, height: 140, borderRadius: 16, marginRight: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}
          >
            <Image source={banner.image} style={{ width: '100%', height: '100%' }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#00000040', paddingHorizontal: 16, paddingVertical: 12 }}>
              <TouchableOpacity style={{ backgroundColor: AppColors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Shop Now →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ====== CATEGORY HORIZONTAL ====== */}
      <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>Danh Mục</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 12, fontWeight: '600', color: AppColors.primary }}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          {categoriesList.map((cat, idx) => {
            return (
              <TouchableOpacity
                key={cat.id || idx}
                // THAY THẾ LOGIC TẠI ĐÂY
                onPress={() => {
                  router.push({
                    pathname: "/category/[id]", // Phải khớp chính xác với tên file app/category/[id].tsx
                    params: { id: cat.id, name: cat.Name }
                  });
                }} style={{
                  alignItems: 'center',
                  marginRight: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: '#fff', // Bỏ điều kiện selectedCategoryId vì chúng ta đã chuyển trang
                  borderRadius: 14,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                }}
              >
                {/* HIỂN THỊ ICON (EMOJI) TỪ BASEROW */}
                <View style={{
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 4,
                  backgroundColor: '#fafafa',
                  borderRadius: 12
                }}>
                  <Text style={{ fontSize: 28 }}>
                    {cat.image}
                  </Text>
                </View>

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>
                  {cat.Name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {/* ====== VOUCHERS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <Gift size={20} color={AppColors.primary} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#333' }}>Vouchers</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 4 }}>
          {vouchers.slice(0, 3).map((voucher, idx) => {
            const imageUrl = voucher.image && voucher.image.length > 0 ? voucher.image[0].url : null;
            return (
              <TouchableOpacity key={idx} style={{ width: 220, height: 84, marginRight: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <LinearGradient
                    colors={[AppColors.primary, AppColors.primaryLight]}
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Gift size={32} color="#fff" />
                  </LinearGradient>
                )}
                <View style={{ position: 'absolute', left: 12, top: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>{voucher.discount}</Text>
                  <Text style={{ fontSize: 11, color: '#fff', marginTop: 4 }}>{voucher.minSpend}</Text>
                </View>
                <View style={{ position: 'absolute', right: 10, bottom: 10 }}>
                  <TouchableOpacity style={{ backgroundColor: AppColors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{voucher.code}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ====== BEST SELLERS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <TrendingUp size={22} color={AppColors.primary} />
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>Sản Phẩm Mới Nhất</Text>
        </View>
        {productsList.slice(0, 5).map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <View style={{ position: 'relative' }}>
              <Image
                source={toImageSource(item.Image) || { uri: 'https://via.placeholder.com/100' }}
                style={{ width: 100, height: 100 }}
              />
              <View style={{ position: 'absolute', left: 8, top: 8, backgroundColor: AppColors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{idx + 1}</Text>
              </View>
            </View>
            <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#333' }} numberOfLines={2}>{item.Name}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: AppColors.primary }}>{formatPriceFromAPI(item.Price)}</Text>
                <TouchableOpacity style={{ backgroundColor: AppColors.primaryDark, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }} onPress={() => handleAddToCart(item)}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>Mua</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ====== SUGGESTIONS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles size={22} color="#C9A6FF" />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>Gợi ý Hôm Nay</Text>
          </View>
        </View>
        {filteredProducts.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 }}>
            {filteredProducts.map((item, idx) => renderProductCard(item, idx))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <AlertCircle color="#999" size={40} strokeWidth={1.5} />
            <Text style={{ fontSize: 14, color: '#999', marginTop: 10 }}>Không tìm thấy sản phẩm</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}