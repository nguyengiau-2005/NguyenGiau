import { AppColors } from '@/constants/theme';
import { useRecent } from '@/contexts/RecentContext';
import { formatPrice } from '@/utils/formatPrice';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecentScreen() {
  const router = useRouter();
  const { recent, removeRecent, clearRecent } = useRecent();

  const handleClear = () => {
    Alert.alert('Xóa lịch sử', 'Bạn có muốn xóa toàn bộ sản phẩm đã xem?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => clearRecent() },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {item.img ? (
        <Image source={typeof item.img === 'string' ? (item.img.url ? { uri: item.img.url } : { uri: item.img }) : (item.img.url ? { uri: item.img.url } : item.img)} style={styles.image} />
      ) : (
        <View style={styles.fallback}><Text>📦</Text></View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        {item.variant && <Text style={styles.meta}>{item.variant}</Text>}
        {typeof item.price === 'number' && <Text style={styles.price}>{formatPrice(item.price)}đ</Text>}
      </View>

      <TouchableOpacity style={styles.delete} onPress={() => removeRecent(item.id)}>
        <Trash2 size={18} color={AppColors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (!recent || recent.length === 0) {
    return (
      <View style={styles.containerEmpty}>
        <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={22} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đã xem gần đây</Text>
            <View style={{ width: 28 }} />
          </View>
        </LinearGradient>

        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48 }}>📦</Text>
          <Text style={{ fontSize: 16, marginTop: 12 }}>Bạn chưa xem sản phẩm nào</Text>
          <TouchableOpacity style={styles.shopNow} onPress={() => router.push('/(tabs)' as any)}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đã xem gần đây</Text>
          <TouchableOpacity onPress={handleClear} style={{ width: 28, alignItems: 'flex-end' }}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={recent}
        renderItem={renderItem}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f8' },
  header: { paddingTop: 18, paddingBottom: 14, paddingHorizontal: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  containerEmpty: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  shopNow: { marginTop: 12, backgroundColor: AppColors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 12 },
  image: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#f2f2f2' },
  fallback: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#fafafa', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#222' },
  meta: { fontSize: 12, color: '#888', marginTop: 4 },
  price: { fontSize: 13, color: AppColors.primary, fontWeight: '700', marginTop: 6 },
  delete: { padding: 8 },
});