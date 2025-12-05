
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertCircle, Bell, Flame, Gift, Heart, MapPin, Menu, Search, ShoppingCart, Sparkles, Star, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

/* 💄 Product data from assets */
const products = [
  { id: 1, name: 'BLEMISH - Mụn Control', price: 180000, rating: 4.7, image: require('../../assets/images/product/blemish.jpg'), discount: 15, isBestseller: true },
  { id: 2, name: 'Cell Fusion C - Serum', price: 320000, rating: 4.8, image: require('../../assets/images/product/cellfusion.jpg'), discount: 12, isBestseller: true },
  { id: 3, name: 'Innisfree - Toner', price: 150000, rating: 4.6, image: require('../../assets/images/product/innisfree.jpg'), discount: 10, isBestseller: false },
  { id: 4, name: 'Torriden - Kem Dưỡng', price: 280000, rating: 4.9, image: require('../../assets/images/product/kemduong_torriden.jpg'), discount: 0, isBestseller: true },
  { id: 5, name: 'TIAM - Sữa Rửa Mặt', price: 210000, rating: 4.9, image: require('../../assets/images/product/ruamat_tiam.jpg'), discount: 20, isBestseller: true },
  { id: 6, name: 'Serum Hyaluronic', price: 250000, rating: 4.8, image: require('../../assets/images/product/serum1.jpg'), discount: 8, isBestseller: false },
  { id: 7, name: 'MEDICUBE - Serum', price: 420000, rating: 4.7, image: require('../../assets/images/product/Serum_medicube.jpg'), discount: 25, isBestseller: true },
  { id: 8, name: 'SKIN1004 - Essence', price: 380000, rating: 4.8, image: require('../../assets/images/product/SKIN1004.jpg'), discount: 18, isBestseller: false },
  { id: 9, name: 'COCOON - Sữa Rửa Mặt', price: 165000, rating: 4.9, image: require('../../assets/images/product/suaruamat_cocoon.jpg'), discount: 5, isBestseller: false },
  { id: 10, name: 'Serum Concentrado', price: 290000, rating: 4.8, image: require('../../assets/images/product/serum_concentrado.jpg'), discount: 22, isBestseller: true }
];

const categories = [
  { name: 'Makeup', icon: '💄' },
  { name: 'Skincare', icon: '✨' },
  { name: 'Perfume', icon: '💐' },
  { name: 'Body care', icon: '🧴' },
  { name: 'Hair', icon: '💇' }
];

const banners: Array<{ id: number; image: any }> = [
  { id: 1, image: require('../../assets/images/banner/banner_mega.jpg') },
  { id: 2, image: require('../../assets/images/banner/banner_sale20.jpg') },
  { id: 3, image: require('../../assets/images/banner/banner_shopnow.jpg') }
];

const vouchers = [
  { id: 1, code: 'SAVE50K', discount: '50.000đ', minSpend: 'Mua từ 500k', expiry: 'Hết 31/12', image: require('../../assets/images/vouchers/vouchers_50.png') },
  { id: 2, code: 'WELCOME20', discount: '20%', minSpend: 'Mua từ 300k', expiry: 'Hết 15/12', image: require('../../assets/images/vouchers/vouchers_40.png') },
  { id: 3, code: 'FREESHIP', discount: 'Miễn ship', minSpend: 'Mua từ 200k', expiry: 'Hết 20/12', image: require('../../assets/images/vouchers/vouchers_30.png') }
];

const brands = [
  { id: 1, name: 'Laneige', logo: '🇰🇷' },
  { id: 2, name: 'Dior', logo: '🇫🇷' },
  { id: 3, name: 'SK-II', logo: '🇯🇵' },
  { id: 4, name: 'Shiseido', logo: '🇯🇵' }
];

const articles = [
  { id: 1, title: '5 bước skincare cơ bản', image: '📱', views: '12.5K' },
  { id: 2, title: 'Cách chọn son phù hợp', image: '💄', views: '8.3K' },
  { id: 3, title: 'Xu hướng makeup 2024', image: '✨', views: '15.2K' }
];

const searchSuggestions = ['Serum Vitamin C', 'Kem dưỡng ẩm', 'Sữa rửa mặt', 'Mặt nạ', 'Nước hoa'];
const searchHistory = ['Serum', 'Kem chống nắng'];

export default function HomeScreen() {
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.image,
      qty: 1
    });
    Alert.alert('Thành công', `${product.name} đã được thêm vào giỏ hàng`);
  };

  const handleToggleFavorite = (product: typeof products[0]) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite({
        id: product.id,
        name: product.name,
        price: product.price,
        rating: product.rating,
        image: product.image
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderProductCard = (item: typeof products[0], index: number) => (
    <TouchableOpacity 
      key={index}
      style={{ 
        width: '48%', 
        backgroundColor: '#fff', 
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3
      }}
      activeOpacity={0.85}
    >
      <View style={{ position: 'relative', height: 140, backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
        {item.discount > 0 && (
          <LinearGradient
            colors={["#ff5722", "#ff7043"]}
            style={{ position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}
          >
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>-{item.discount}%</Text>
          </LinearGradient>
        )}
        <TouchableOpacity 
          style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#ffffff90', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => handleToggleFavorite(item)}
        >
          <Heart color="#ff6b9d" size={16} fill={isFavorite(item.id) ? '#ff6b9d' : 'transparent'} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontWeight: '700', fontSize: 12, color: '#333' }} numberOfLines={2}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Star size={12} color="#ffb300" fill="#ffb300" />
          <Text style={{ marginLeft: 3, fontSize: 11, fontWeight: '600', color: '#666' }}>{item.rating}</Text>
        </View>
        <Text style={{ marginTop: 8, fontWeight: '800', fontSize: 13, color: '#ff6b9d' }}>{item.price}đ</Text>
        <TouchableOpacity 
          style={{ marginTop: 8, backgroundColor: '#ff6b9d', paddingVertical: 6, borderRadius: 8, alignItems: 'center' }}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#faf9f8' }} showsVerticalScrollIndicator={false}>
      {/* ====== HEADER / APP BAR ====== */}
      <LinearGradient
        colors={["#ff6b9d", "#c44569"]}
        style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        {/* Top Row: Logo, Menu, Cart, Notification */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            {/* Menu Icon */}
            <TouchableOpacity style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}>
              <Menu size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            {/* Logo / Brand */}
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>💄 BeautyShop</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Notification */}
            <TouchableOpacity style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}>
              <Bell size={20} color="#fff" strokeWidth={1.5} />
            </TouchableOpacity>
            
            {/* Shopping Cart with Badge */}
            <TouchableOpacity 
              style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12, position: 'relative' }}
              onPress={() => router.push('/(tabs)/Cart')}
            >
              <ShoppingCart size={20} color="#fff" strokeWidth={1.5} />
              {/* Badge */}
              <View style={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#ff5722', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>3</Text>
              </View>
            </TouchableOpacity>

            {/* Avatar */}
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

        {/* Greeting Message */}
        <Text style={{ fontSize: 12, color: '#ffffff80', fontWeight: '500', marginBottom: 12 }}>Xin chào {user ? user.fullName : 'bạn'}</Text>

        {/* SEARCH BAR WITH DROPDOWN */}
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}>
            <Search size={20} color="#ff6b9d" strokeWidth={2} />
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
          </View>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 8, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
              {/* Search Suggestions */}
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

              {/* Search History */}
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
              <TouchableOpacity style={{ backgroundColor: '#ff6b9d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' }}>
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
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#ff6b9d' }}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ alignItems: 'center', marginRight: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ====== FLASH SALE ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <Flame size={22} color="#ff5722" />
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>Flash Sale</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#ff5722' }}>Hết 18:00</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          {products.filter(p => p.discount > 15).slice(0, 4).map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ width: 140, marginRight: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
            >
              <View style={{ position: 'relative', height: 120, backgroundColor: '#f5f5f5' }}>
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                <LinearGradient colors={["#ff5722", "#ff7043"]} style={{ position: 'absolute', top: 6, right: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>-{item.discount}%</Text>
                </LinearGradient>
              </View>
              <View style={{ padding: 8 }}>
                <Text style={{ fontWeight: '600', fontSize: 11, color: '#333' }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ marginTop: 4, fontWeight: '700', fontSize: 12, color: '#ff6b9d' }}>{item.price}đ</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ====== VOUCHERS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <Gift size={22} color="#ff6b9d" />
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>Vouchers</Text>
        </View>
        {vouchers.map((voucher, idx) => (
          <TouchableOpacity
            key={idx}
            style={{ marginBottom: 10, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', height: 120, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
          >
            <Image source={voucher.image} style={{ width: '100%', height: '100%' }} />
            <View style={{ position: 'absolute', bottom: 10, right: 10 }}>
              <TouchableOpacity style={{ backgroundColor: '#ff6b9d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>{voucher.code}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ====== FEATURED COLLECTIONS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>Bộ Sưu Tập Nổi Bật</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#ff6b9d' }}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={{ borderRadius: 14, height: 100, padding: 16, marginBottom: 10, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Summer Collection</Text>
          <TouchableOpacity style={{ backgroundColor: '#ffffff30', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Explore →</Text>
          </TouchableOpacity>
        </LinearGradient>
        <LinearGradient colors={["#f093fb", "#f5576c"]} style={{ borderRadius: 14, height: 100, padding: 16, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Premium Brands</Text>
          <TouchableOpacity style={{ backgroundColor: '#ffffff30', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Explore →</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* ====== BEST SELLERS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <TrendingUp size={22} color="#ff6b9d" />
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>Sản Phẩm Bán Chạy</Text>
        </View>
        {products.filter(p => p.isBestseller).slice(0, 3).map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
          >
            <Image source={{ uri: item.image }} style={{ width: 100, height: 100 }} />
            <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#333' }} numberOfLines={2}>{item.name}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: '#ff6b9d' }}>{item.price}đ</Text>
                <TouchableOpacity style={{ backgroundColor: '#ff6b9d', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }} onPress={() => handleAddToCart(item)}>
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
            <Sparkles size={22} color="#ff6b9d" />
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

      {/* ====== BRANDS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 12 }}>Thương Hiệu Nổi Bật</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          {brands.map((brand, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ alignItems: 'center', marginRight: 16, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
            >
              <Text style={{ fontSize: 32, marginBottom: 4 }}>{brand.logo}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ====== ARTICLES / VIDEOS ====== */}
      <View style={{ marginHorizontal: 16, marginTop: 24, marginBottom: 100 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 12 }}>Bài Viết & Videos</Text>
        {articles.map((article, idx) => (
          <TouchableOpacity
            key={idx}
            style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
          >
            <View style={{ width: 100, height: 100, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 40 }}>{article.image}</Text>
            </View>
            <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#333' }} numberOfLines={2}>{article.title}</Text>
              <Text style={{ fontSize: 11, color: '#999' }}>👁 {article.views} views</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}



