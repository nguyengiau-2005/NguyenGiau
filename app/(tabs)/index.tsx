import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Bell,
  Gift,
  Heart,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  X
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Import API Services
import apiCategory, { CategoryData } from '@/api/apiCategory';
import apiProduct, { ProductData } from '@/api/apiProduct';
import apiPromotion, { PromotionData } from '@/api/apiPromotion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Banner data
const banners = [
  { id: 1, image: require('../../assets/images/banner/banner1.jpg'), title: 'Mega Sale' },
  { id: 2, image: require('../../assets/images/banner/banner2.jpg'), title: '20% Off' },
  { id: 3, image: require('../../assets/images/banner/banner3.jpg'), title: 'Shop Now' }
];

// kết nối apiPromotion

const searchSuggestions = ['Serum Vitamin C', 'Kem dưỡng ẩm', 'Sữa rửa mặt', 'Mặt nạ', 'Nước hoa'];
const searchHistory = ['Serum', 'Kem chống nắng'];

export default function HomeScreen() {
  const { addToCart, cart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();

  // States for data
  const [productsList, setProductsList] = useState<ProductData[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryData[]>([]);
  const [promotionsList, setPromotionsList] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States for UI
  const [searchText, setSearchText] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Refs
  const bannerRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);

  // Auto-play settings
  const SLIDE_WIDTH = 280;
  const SLIDE_INTERVAL = 4000;

  // Fetch data from API
  const fetchData = async () => {
    try {
      const [prodRes, catRes, promoRes] = await Promise.all([
        apiProduct.getAllProducts(),
        apiCategory.getAllCategories(),
        apiPromotion.getPublicPromotions()
      ]);
      setProductsList(prodRes.results || []);
      setCategoriesList(catRes.results || []);
      setPromotionsList(promoRes.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-play banner
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % banners.length;
        bannerRef.current?.scrollTo({ x: next * (SLIDE_WIDTH + 12), animated: true });
        return next;
      });
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Cart functionality
  const handleAddToCart = (product: ProductData) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      img: product.image?.[0]?.url || '',
      qty: 1
    });
    Alert.alert('Thành công', `${product.name} đã được thêm vào giỏ hàng`);
  };

  const headerCartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  // Favorites functionality
  const handleToggleFavorite = (product: ProductData) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      Alert.alert('Đã xóa', `${product.name} đã được xóa khỏi danh sách yêu thích`);
    } else {
      addFavorite({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        rating: Number(product.rating) || 5.0,
        image: product.image?.[0]?.url || ''
      });
      Alert.alert('Đã thêm', `${product.name} đã được thêm vào danh sách yêu thích`);
    }
  };

  // Search functionality
  const filteredProducts = productsList.filter(product =>
    (product.name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      // Add to search history (in a real app, this would be saved to storage)
      setShowSearchDropdown(false);
      // Navigate to search results or filter products
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchDropdown(false);
    searchInputRef.current?.blur();
  };

  // Category filtering
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    // In a real app, you would filter products by category
  };

  // Render functions
  const renderBanner = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      key={index}
      style={{
        width: SLIDE_WIDTH,
        height: 140,
        borderRadius: 16,
        marginRight: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4
      }}
    >
      <Image source={item.image} style={{ width: '100%', height: '100%' }} />
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#00000060',
        paddingHorizontal: 16,
        paddingVertical: 12
      }}>
        <TouchableOpacity style={{
          backgroundColor: AppColors.primary,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          alignSelf: 'flex-start'
        }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
            {item.title} →
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item, index }: { item: CategoryData; index: number }) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={{
          alignItems: 'center',
          marginRight: 16,
          paddingHorizontal: 10,
          paddingVertical: 12,
          backgroundColor: selectedCategory === item.id ? AppColors.primary : '#fff',
          borderRadius: 20, // Bo tròn mạnh hơn tạo cảm giác hiện đại
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
          minWidth: 85,
          borderWidth: 1,
          borderColor: selectedCategory === item.id ? AppColors.primary : '#F0F0F0',
        }}
        onPress={() => router.push(`/category/${item.id}` as any)}
      >
        {/* Phần chứa Icon/Emoji */}
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: selectedCategory === item.id ? 'rgba(255,255,255,0.3)' : '#FFF5F7',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 26 }}>
            {item.image_url || '✨'}
          </Text>
        </View>

        <Text style={{
          fontSize: 11,
          fontWeight: '700',
          color: selectedCategory === item.id ? '#fff' : '#444',
          textAlign: 'center',
          textTransform: 'uppercase', // Làm nhãn chữ chuyên nghiệp hơn
          letterSpacing: 0.5
        }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderVoucher = ({ item }: { item: PromotionData }) => {
    // Calculate discount display
    const discountDisplay = item.discount_type.value === 'Percentage'
      ? `${item.discount_value}%`
      : `${Number(item.discount_value).toLocaleString('vi-VN')}đ`;

    return (
      <TouchableOpacity
        style={{
          width: 220,
          height: 84,
          marginRight: 12,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2
        }}
        onPress={() => {
          // Copy voucher code to clipboard or show details
          Alert.alert('Mã giảm giá', `${item.code}\n${item.description}`);
        }}
      >
        {item.image_url && item.image_url.length > 0 ? (
          <Image
            source={{ uri: item.image_url[0].url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: AppColors.primary,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Gift size={32} color="#fff" />
          </View>
        )}
        <View style={{ position: 'absolute', left: 12, top: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>
            {discountDisplay}
          </Text>
          <Text style={{ fontSize: 11, color: '#fff', marginTop: 4 }}>
            Từ {Number(item.min_spend).toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <View style={{ position: 'absolute', right: 10, bottom: 10 }}>
          <TouchableOpacity style={{
            backgroundColor: item.discount_type.color,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
              {item.code}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductCard = ({ item, index }: { item: ProductData; index: number }) => (
    <TouchableOpacity
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
          source={{ uri: item.image?.[0]?.url || 'https://via.placeholder.com/150' }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#ffffff90',
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => handleToggleFavorite(item)}
        >
          <Heart
            color="#FF4D4D"
            size={16}
            fill={isFavorite(item.id) ? '#FF4D4D' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {index < 3 && (
          <View style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: AppColors.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
              #{index + 1}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: 12 }}>
        <Text style={{
          fontWeight: '700',
          fontSize: 12,
          color: '#333',
          marginBottom: 4
        }} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6
        }}>
          <Star size={12} color="#ffb300" fill="#ffb300" />
          <Text style={{
            marginLeft: 3,
            fontSize: 11,
            fontWeight: '600',
            color: '#666'
          }}>
            {item.rating || '5.0'}
          </Text>
        </View>

        <Text style={{
          fontWeight: '800',
          fontSize: 14,
          color: AppColors.primary,
          marginBottom: 8
        }}>
          {Number(item.price).toLocaleString('vi-VN', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
          })}đ
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: AppColors.primaryDark,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#fff'
          }}>
            Thêm vào giỏ
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#faf9f8'
      }}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{
          marginTop: 16,
          color: '#666',
          fontSize: 16,
          fontWeight: '500'
        }}>
          Đang tải dữ liệu...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#faf9f8' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[AppColors.primary, AppColors.primaryLight]}
          style={{
            paddingHorizontal: 16,
            paddingTop: 44,
            paddingBottom: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24
          }}
        >
          {/* Top Bar */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flex: 1
            }}>
              <TouchableOpacity style={{
                backgroundColor: '#ffffff20',
                padding: 8,
                borderRadius: 12
              }}>
                <Menu size={20} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#fff'
              }}>
                🌸 Fiora Luxe
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12
            }}>
              <TouchableOpacity style={{
                backgroundColor: '#ffffff20',
                padding: 8,
                borderRadius: 12
              }}>
                <Bell size={20} color="#fff" strokeWidth={1.5} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#ffffff20',
                  padding: 8,
                  borderRadius: 12,
                  position: 'relative'
                }}
                onPress={() => router.push('/(tabs)/Cart')}
              >
                <ShoppingCart size={20} color="#fff" strokeWidth={1.5} />
                {headerCartCount > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    backgroundColor: '#ff5722',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4
                  }}>
                    <Text style={{
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: '700'
                    }}>
                      {headerCartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {user && user.avatar ? (
                <TouchableOpacity
                  onPress={() => router.push('/user/edit-profile' as any)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: '#fff',
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/user/edit-profile' as any)}
                  style={{
                    backgroundColor: '#ffffff20',
                    padding: 8,
                    borderRadius: 12
                  }}
                >
                  <MapPin size={20} color="#fff" strokeWidth={1.5} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Welcome Message */}
          <Text style={{
            fontSize: 12,
            color: '#ffffff80',
            fontWeight: '500',
            marginBottom: 12
          }}>
            Xin chào {user ? user.full_name : 'bạn'} 👋
          </Text>

          {/* Search Bar */}
          <View style={{ position: 'relative' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 18,
              paddingHorizontal: 14,
              paddingVertical: 12,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2
            }}>
              <Search size={20} color={AppColors.primary} strokeWidth={2} />
              <TextInput
                ref={searchInputRef}
                placeholder="Tìm sản phẩm, thương hiệu..."
                placeholderTextColor="#ccc"
                style={{
                  marginLeft: 10,
                  flex: 1,
                  fontSize: 14,
                  color: '#333'
                }}
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  setShowSearchDropdown(text.length > 0);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={{ padding: 4 }}
                >
                  <X size={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                marginTop: 8,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                maxHeight: 200
              }}>
                {searchText.length > 0 ? (
                  <>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#999',
                      paddingHorizontal: 12,
                      marginBottom: 6
                    }}>
                      Gợi ý tìm kiếm
                    </Text>
                    {searchSuggestions
                      .filter(s => s.toLowerCase().includes(searchText.toLowerCase()))
                      .map((suggestion, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderBottomWidth: idx < searchSuggestions.length - 1 ? 1 : 0,
                            borderBottomColor: '#f0f0f0'
                          }}
                          onPress={() => {
                            setSearchText(suggestion);
                            setShowSearchDropdown(false);
                          }}
                        >
                          <Text style={{ fontSize: 13, color: '#333' }}>
                            🔍 {suggestion}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </>
                ) : (
                  <>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#999',
                      paddingHorizontal: 12,
                      marginBottom: 6
                    }}>
                      Lịch sử tìm kiếm
                    </Text>
                    {searchHistory.map((history, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderBottomWidth: idx < searchHistory.length - 1 ? 1 : 0,
                          borderBottomColor: '#f0f0f0'
                        }}
                        onPress={() => {
                          setSearchText(history);
                          setShowSearchDropdown(false);
                        }}
                      >
                        <Text style={{ fontSize: 13, color: '#333' }}>
                          ⏱ {history}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Banner Carousel */}
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <ScrollView
            ref={bannerRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {banners.map((banner, idx) => renderBanner({ item: banner, index: idx }))}
          </ScrollView>

          {/* Banner Indicators */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 12
          }}>
            {banners.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: bannerIndex === idx ? AppColors.primary : '#ddd',
                  marginHorizontal: 4
                }}
                onPress={() => {
                  setBannerIndex(idx);
                  bannerRef.current?.scrollTo({ x: idx * (SLIDE_WIDTH + 12), animated: true });
                }}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#333'
            }}>
              Danh Mục
            </Text>
            <TouchableOpacity>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: AppColors.primary
              }}>
                Xem tất cả →
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categoriesList}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        {/* Vouchers */}
        <View style={{ marginHorizontal: 12, marginTop: 20 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            gap: 8
          }}>
            <Gift size={25} color={AppColors.primary} />
            <Text style={{
              fontSize: 15,
              fontWeight: '800',
              color: '#333'
            }}>
              Vouchers
            </Text>
          </View>

          <FlatList
            data={promotionsList}
            renderItem={renderVoucher}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        {/* Best Sellers */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            gap: 8
          }}>
            <TrendingUp size={22} color={AppColors.primary} />
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#333'
            }}>
              Sản Phẩm Nổi Bật
            </Text>
          </View>

          <FlatList
            data={productsList.slice(0, 6)}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            scrollEnabled={false}
          />
        </View>

        {/* Product Suggestions */}
        <View style={{ marginHorizontal: 16, marginTop: 24, marginBottom: 20 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            gap: 8
          }}>
            <Sparkles size={22} color="#C9A6FF" />
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#333'
            }}>
              Gợi ý cho bạn
            </Text>
          </View>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={productsList} // Lấy toàn bộ danh sách productsList
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              scrollEnabled={false}
            />
          ) : searchText ? (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40
            }}>
              <AlertCircle color="#999" size={40} strokeWidth={1.5} />
              <Text style={{
                fontSize: 14,
                color: '#999',
                marginTop: 10,
                textAlign: 'center'
              }}>
                Không tìm thấy sản phẩm nào phù hợp với &quot;{searchText}&quot;
              </Text>
            </View>
          ) : (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40
            }}>
              <Sparkles color="#C9A6FF" size={40} strokeWidth={1.5} />
              <Text style={{
                fontSize: 14,
                color: '#999',
                marginTop: 10,
                textAlign: 'center'
              }}>
                Khám phá các sản phẩm được đề xuất dành riêng cho bạn
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}