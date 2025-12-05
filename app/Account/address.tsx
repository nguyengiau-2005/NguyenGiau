import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Edit, Plus, Trash2, X } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const addresses = [
  { id: 1, name: 'Nhà riêng', address: '123 Đường Lê Lợi, Quận 1, TP.HCM', isDefault: true },
  { id: 2, name: 'Công ty', address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM', isDefault: false },
];

export default function Address() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE8ED', dark: '#1a1a1a' }}
      headerImage={
        <View style={styles.headerWrapper}>
          <ThemedText type="title" style={styles.headerTitle}>Quản lý địa chỉ</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color="#ff6699" />
        </TouchableOpacity>

        {addresses.map(addr => (
          <ThemedView key={addr.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View>
                <ThemedText type="defaultSemiBold">{addr.name}</ThemedText>
                {addr.isDefault && (
                  <ThemedText style={styles.defaultBadge}>Địa chỉ mặc định</ThemedText>
                )}
              </View>
            </View>
            <ThemedText style={styles.addressText}>{addr.address}</ThemedText>
            <View style={styles.addressActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Edit size={16} color="#ff6699" />
                <ThemedText style={styles.actionText}>Sửa</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Trash2 size={16} color="#ff3333" />
                <ThemedText style={{ color: '#ff3333', fontSize: 12, fontWeight: '600' }}>Xóa</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color="#ff6699" />
          <ThemedText style={styles.addBtnText}>Thêm địa chỉ mới</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  headerTitle: {
    color: '#ff6699',
    fontFamily: Fonts.rounded,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE8ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  defaultBadge: {
    color: '#ff6699',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  addressText: {
    color: '#666',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
  },
  actionText: {
    color: '#ff6699',
    fontSize: 12,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFE8ED',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  addBtnText: {
    color: '#ff6699',
    fontWeight: '700',
  },
});
