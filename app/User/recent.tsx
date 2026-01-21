import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useRecent } from '@/contexts/RecentContext';
import { formatCurrencyFull } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShoppingCart, Star, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecentScreen() {
  const router = useRouter();
  const { recent, removeRecent, clearRecent } = useRecent();
  const { addToCart } = useCart();

  const handleClear = () => {
    Alert.alert('Xóa lịch sử', 'Bạn có muốn xóa toàn bộ sản phẩm đã xem?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa tất cả', style: 'destructive', onPress: () => clearRecent() },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      // FIX: Thay đổi pathname khớp với thông báo lỗi của hệ thống
      onPress={() => router.push({ 
        pathname: "/product/[id]", 
        params: { id: item.id } 
      })}
      activeOpacity={0.7}
    >
      {/* Hình ảnh sản phẩm */}
      <View style={styles.imageWrapper}>
        {item.img ? (
          <Image 
            source={{ uri: Array.isArray(item.img) ? item.img?.[0]?.url : (typeof item.img === 'string' ? item.img : 'https://via.placeholder.com/150') }} 
            style={styles.image} 
          />
        ) : (
          <View style={styles.fallback}><Text>📦</Text></View>
        )}
      </View>

      {/* Thông tin chi tiết */}
      <View style={styles.info}>
        <View>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>4.9 | Đã xem {new Date().toLocaleDateString('vi-VN')}</Text>
          </View>
        </View>

        <View style={styles.bottomInfoRow}>
          <Text style={styles.price}>{formatCurrencyFull(item.price)}</Text>
          {item.variant && (
            <View style={styles.tagVariant}>
              <Text style={styles.meta}>{item.variant}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Cột hành động */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => removeRecent(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={16} color="#FF4D4D" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cartBtn} 
          onPress={() => {
            addToCart(item);
            Alert.alert('Thông báo', 'Đã thêm sản phẩm vào giỏ hàng');
          }}
        >
          <ShoppingCart size={18} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sản phẩm đã xem</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={recent}
        renderItem={renderItem}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Bạn chưa xem sản phẩm nào</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 50 : 30, 
    paddingBottom: 20, 
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  clearBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  clearBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },

  listContent: { padding: 16, paddingBottom: 40 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: { backgroundColor: '#F1F2F6', borderRadius: 15, overflow: 'hidden' },
  image: { width: 90, height: 90 },
  fallback: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between', paddingVertical: 2 },
  name: { fontSize: 15, fontWeight: '700', color: '#333', lineHeight: 20 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 11, color: '#999', marginLeft: 4 },
  bottomInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 16, color: AppColors.primary, fontWeight: '800' },
  tagVariant: { backgroundColor: '#FFEEF3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  meta: { fontSize: 10, color: AppColors.primary, fontWeight: '700' },

  actions: { justifyContent: 'space-between', alignItems: 'flex-end', marginLeft: 10 },
  deleteBtn: { padding: 4 },
  cartBtn: { 
    backgroundColor: AppColors.primary, 
    width: 38, 
    height: 38, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
  },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 20 },
  shopBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
  shopBtnText: { color: 'white', fontWeight: '800' }
});