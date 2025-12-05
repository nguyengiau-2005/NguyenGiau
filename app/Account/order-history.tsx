import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useOrders, Order } from '@/contexts/OrdersContext';
import { Package, X } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const statusColors: any = {
  Delivered: { bg: '#e8f5e9', text: '#4CAF50' },
  Shipped: { bg: '#e3f2fd', text: '#2196F3' },
  Pending: { bg: '#fff3e0', text: '#FF9800' },
  Cancelled: { bg: '#ffebee', text: '#f44336' },
};

const statusTexts: any = {
  Delivered: 'Đã giao',
  Shipped: 'Đang giao',
  Pending: 'Chờ xác nhận',
  Cancelled: 'Đã hủy',
};

export default function OrderHistory() {
  const router = useRouter();
  const { orders } = useOrders();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE8ED', dark: '#1a1a1a' }}
      headerImage={
        <View style={styles.headerWrapper}>
          <ThemedText type="title" style={styles.headerTitle}>Lịch sử mua hàng</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color="#ff6699" />
        </TouchableOpacity>

        {orders.map((order: Order) => {
          const color = statusColors[order.status];
          return (
            <ThemedView key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Package size={24} color="#ff6699" />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold">Đơn hàng #{order.id}</ThemedText>
                    <ThemedText style={styles.orderDate}>{order.date}</ThemedText>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: color.bg }]}>
                  <ThemedText style={[styles.statusText, { color: color.text }]}>
                    {statusTexts[order.status]}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Số lượng:</ThemedText>
                  <ThemedText type="defaultSemiBold">{order.itemCount} sản phẩm</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Tổng cộng:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.totalPrice}>
                    {order.total.toLocaleString('vi-VN')} ₫
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          );
        })}
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
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderDate: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    color: '#999',
    fontSize: 13,
  },
  totalPrice: {
    color: '#ff6699',
    fontSize: 14,
  },
});
