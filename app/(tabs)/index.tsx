
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertCircle, Flame, Heart, Search, Sparkles, Star, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

/* 💄 Fake product data */
const products = [
  {
    id: 1,
    name: 'Son môi Black Rouge',
    price: 150000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1599305445671-639c8e44ca6f?w=400&h=400&fit=crop',
    discount: 20
  },
  {
    id: 2,
    name: 'Kem dưỡng ẩm Laneige',
    price: 320000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    discount: 15
  },
  {
    id: 3,
    name: 'Dầu gội Pantene',
    price: 95000,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1585314062340-f4dbf0d8bc1e?w=400&h=400&fit=crop',
    discount: 10
  },
  {
    id: 4,
    name: 'Serum Vitamin C',
    price: 280000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    discount: 0
  },
  {
    id: 5,
    name: 'Nước hoa Dior Mini',
    price: 890000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop',
    discount: 0
  },
  {
    id: 6,
    name: 'Sữa rửa mặt CeraVe',
    price: 280000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    discount: 10
  },
  {
    id: 7,
    name: 'Mặt nạ Mediheal',
    price: 45000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1556228014-8c9bac2db08d?w=400&h=400&fit=crop',
    discount: 25
  },
  {
    id: 8,
    name: 'Toner Hada Labo',
    price: 165000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop',
    discount: 12
  },
  {
    id: 9,
    name: 'Mắt kính chống nắng',
    price: 450000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    discount: 5
  },
  {
    id: 10,
    name: 'Kem chống nắng SPF50',
    price: 220000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1599305445671-639c8e44ca6f?w=400&h=400&fit=crop',
    discount: 18
  }
];

const categories = [
  { name: 'Makeup', icon: '💄' },
  { name: 'Skincare', icon: '✨' },
  { name: 'Perfume', icon: '💐' },
  { name: 'Body care', icon: '🧴' },
  { name: 'Hair', icon: '💇' }
];

export default function HomeScreen() {
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#faf9f8' }} showsVerticalScrollIndicator={false}>

      {/* 🔥 Header Gradient sang trọng */}
      <LinearGradient
        colors={["#ff6b9d", "#c44569"]}
        style={{ paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        {/* Top Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 12, color: '#ffffff80', fontWeight: '500' }}>Welcome back</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 4 }}>
              {user ? user.fullName : 'Beauty Store'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {user && user.avatar ? (
              <TouchableOpacity 
                onPress={() => router.push('/Account/edit-profile')}
                style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff', overflow: 'hidden' }}
              >
                <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{ backgroundColor: '#ffffff20', padding: 12, borderRadius: 50, borderWidth: 1.5, borderColor: '#ffffff40' }}
              >
                <Heart color="white" size={24} strokeWidth={1.5} fill="transparent" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 🔍 Search box with icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 }}>
          <Search size={22} color="#ff6b9d" strokeWidth={2} />
          <TextInput 
            placeholder="Tìm mỹ phẩm..." 
            placeholderTextColor="#ccc" 
            style={{ marginLeft: 12, flex: 1, fontSize: 16, color: '#333' }}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </LinearGradient>

      {/* 🎉 Promotional Banner */}
      <View style={{ marginHorizontal: 20, marginTop: 24 }}>
        <LinearGradient
          colors={["#ffd89b", "#ffb366"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Flame color="#ff5722" size={20} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#ff5722', marginLeft: 8 }}>FLASH SALE</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff' }}>Giảm tới 50%</Text>
            <Text style={{ fontSize: 12, color: '#ffffff80', marginTop: 4 }}>Hôm nay hết 18:00</Text>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', width: 80, height: 80, backgroundColor: '#ffffff30', borderRadius: 20 }}>
            <Zap color="#fff" size={40} strokeWidth={1.5} />
          </View>
        </LinearGradient>
      </View>

      {/* 🏆 TOP Bán Chạy - Horizontal Scroll */}
      <View style={{ marginTop: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#333' }}>🔥 Top Bán Chạy</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#ff6b9d' }}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
          {products.slice(0, 5).map((item, i) => (
            <TouchableOpacity
              key={i}
              style={{
                width: 160,
                marginRight: 14,
                backgroundColor: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#f0f0f0'
              }}
              activeOpacity={0.8}
            >
              {/* Image */}
              <View style={{ position: 'relative', height: 140, backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                {item.discount > 0 && (
                  <LinearGradient
                    colors={["#ff5722", "#ff7043"]}
                    style={{ position: 'absolute', top: 8, right: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#fff' }}>-{item.discount}%</Text>
                  </LinearGradient>
                )}
                {/* Top Badge */}
                <LinearGradient
                  colors={["#FFD700", "#FFA500"]}
                  style={{ position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff' }}>TOP {i + 1}</Text>
                </LinearGradient>
              </View>

              {/* Content */}
              <View style={{ padding: 10 }}>
                <Text style={{ fontWeight: '700', fontSize: 12, color: '#333' }} numberOfLines={2}>{item.name}</Text>

                {/* Rating */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Star size={12} color="#ffb300" fill="#ffb300" />
                  <Text style={{ marginLeft: 3, fontSize: 11, fontWeight: '600', color: '#666' }}>{item.rating}</Text>
                </View>

                {/* Price */}
                <Text style={{ marginTop: 8, fontWeight: '900', fontSize: 13, color: '#ff6b9d' }}>
                  {item.price} đ
                </Text>

                {/* Buy Button */}
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    backgroundColor: '#ff6b9d',
                    paddingVertical: 6,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Mua ngay</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#333' }}>Danh mục</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#ff6b9d' }}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{ 
                alignItems: 'center', 
                marginRight: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: '#fff',
                borderRadius: 20,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 6,
                borderWidth: 1,
                borderColor: '#f0f0f0'
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ⭐ Gợi ý hôm nay */}
      <View style={{ marginTop: 28, paddingHorizontal: 20, marginBottom: 100 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#333' }}>Gợi ý hôm nay</Text>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Sản phẩm bán chạy</Text>
          </View>
          <Sparkles color="#ff6b9d" size={24} strokeWidth={1.5} />
        </View>

        {/* Cards sản phẩm */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {filteredProducts.length > 0 ? filteredProducts.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={{ 
                width: '48%', 
                backgroundColor: '#fff', 
                borderRadius: 20,
                marginBottom: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#f5f5f5'
              }}
              activeOpacity={0.8}
            >
              {/* Image Container */}
              <View style={{ position: 'relative', height: 160, backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                {item.discount > 0 && (
                  <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#ff5722', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>-{item.discount}%</Text>
                  </View>
                )}
                {/* Favorite Button */}
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#ffffff80', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => handleToggleFavorite(item)}
                >
                  <Heart color="#ff6b9d" size={18} fill={isFavorite(item.id) ? '#ff6b9d' : 'transparent'} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={{ padding: 12 }}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: '#333' }} numberOfLines={2}>{item.name}</Text>
                
                {/* Rating */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Star size={14} color="#ffb300" fill="#ffb300" />
                  <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#666' }}>{item.rating}</Text>
                </View>

                {/* Price */}
                <Text style={{ marginTop: 10, fontWeight: '900', fontSize: 14, color: '#ff6b9d' }}>
                  {item.price} đ
                </Text>

                {/* Add to cart button */}
                <TouchableOpacity 
                  style={{ 
                    marginTop: 10, 
                    backgroundColor: '#ff6b9d', 
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center'
                  }}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Thêm vào giỏ</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <AlertCircle color="#999" size={40} strokeWidth={1.5} />
              <Text style={{ fontSize: 14, color: '#999', marginTop: 10 }}>Không tìm thấy sản phẩm</Text>
            </View>
          )}
        </View>
      </View>

      {/* 🛒 Floating Cart Button - Removed since cart is now in context */}
      {/* You can view cart by tapping on the Cart tab */}

    </ScrollView>
  );
}

