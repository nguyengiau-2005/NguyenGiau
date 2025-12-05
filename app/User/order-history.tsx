import { useOrders } from '@/contexts/OrdersContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ChevronLeft,
    Repeat,
    Search,
    ShoppingCart,
    Slash,
    Star,
    Truck
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type OrderStatus = 'all' | 'pending' | 'picking' | 'shipping' | 'delivered' | 'cancelled';

interface ProductItem {
  id: string;
  name: string;
  variant?: string;
  qty: number;
  price: number;
  img?: any; // require(...) or remote uri
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: ProductItem[];
  subTotal: number;
  shipping: number;
  total: number;
  status: Exclude<OrderStatus, 'all'>;
  cancelReason?: string;
}

const TABS: { key: OrderStatus; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'picking', label: 'Chờ lấy hàng' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderStatus>('all');

  // Use orders from OrdersContext
  const { orders } = useOrders();

  const statusColors: Record<Exclude<OrderStatus, 'all'>, { bg: string; text: string }> = {
    pending: { bg: '#FFF4E5', text: '#FF8A00' },
    picking: { bg: '#E8F6FF', text: '#1266F1' },
    shipping: { bg: '#E8F9F0', text: '#0F9D58' },
    delivered: { bg: '#F0F6EA', text: '#2E7D32' },
    cancelled: { bg: '#FDECEA', text: '#C62828' },
  };

  const statusLabels: Record<Exclude<OrderStatus, 'all'>, string> = {
    pending: 'Chờ xác nhận',
    picking: 'Chờ lấy hàng',
    shipping: 'Đang giao',
    delivered: 'Giao thành công',
    cancelled: 'Đã hủy',
  };

  const mapOrderStatusToTab = (s: string): Exclude<OrderStatus, 'all'> => {
    if (s === 'Pending') return 'pending';
    if (s === 'Shipped') return 'shipping';
    if (s === 'Delivered') return 'delivered';
    if (s === 'Cancelled') return 'cancelled';
    return 'pending';
  };

  const filtered = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((o) => mapOrderStatusToTab(o.status as string) === activeTab);
  }, [activeTab, orders]);

  const renderProductPreview = (items: any[]) => {
    const preview = items.slice(0, 3);
    const more = items.length - preview.length;
    return (
      <View style={styles.previewContainer}>
        {preview.map((p) => (
          <View key={String(p.id)} style={styles.previewItem}>
            {p.img ? (
              <Image
                source={typeof p.img === 'string' ? { uri: p.img } : p.img}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.previewFallback}>
                <Text style={styles.previewFallbackText}>📦</Text>
              </View>
            )}
            <View style={styles.previewTextWrap}>
              <Text numberOfLines={1} style={styles.previewName}>
                {p.name}
              </Text>
              <Text style={styles.previewMeta}>{p.variant ?? ''} • x{p.qty}</Text>
            </View>
          </View>
        ))}
        {more > 0 && <Text style={styles.moreText}>+{more} sản phẩm khác</Text>}
      </View>
    );
  };

  const handleAction = (order: Order, action: string) => {
    switch (action) {
      case 'track':
        Alert.alert('Theo dõi', `Mở theo dõi cho ${order.orderNumber}`);
        break;
      case 'contact':
        Alert.alert('Liên hệ', `Liên hệ vận chuyển cho ${order.orderNumber}`);
        break;
      case 'reorder':
        Alert.alert('Mua lại', `Thêm sản phẩm từ ${order.orderNumber} vào giỏ hàng`);
        break;
      case 'review':
        Alert.alert('Đánh giá', `Viết đánh giá cho ${order.orderNumber}`);
        break;
      case 'cancel':
        Alert.alert('Hủy đơn', 'Bạn có muốn hủy đơn này?', [
          { text: 'Không' },
          { text: 'Có', onPress: () => Alert.alert('Đã hủy', 'Đơn hàng đã được hủy') },
        ]);
        break;
      case 'reason':
        Alert.alert('Lý do hủy', order.cancelReason ?? 'Không có thông tin');
        break;
      default:
        break;
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const uiStatus = mapOrderStatusToTab(item.status as string);
    const items = item.items || [];
    // Use stored subtotal/shipping from order, or recalculate if not available
    const subTotal = item.subtotal ?? items.reduce((s: number, it: any) => s + (it.price || 0) * (it.qty || 0), 0);
    const shipping = item.shippingCost ?? Math.max(0, (item.total || 0) - subTotal);

    return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber ?? ('#' + item.id)}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[uiStatus].bg }]}> 
          <Text style={[styles.statusText, { color: statusColors[uiStatus].text }]}> 
            {statusLabels[uiStatus]}
          </Text>
        </View>
      </View>

      {renderProductPreview(items)}

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Tổng tiền hàng</Text>
        <Text style={styles.priceValue}>{subTotal.toLocaleString()}đ</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Phí ship</Text>
        <Text style={styles.priceValue}>{shipping === 0 ? 'Miễn phí' : shipping.toLocaleString() + 'đ'}</Text>
      </View>
      <View style={styles.priceRowAccent}>
        <Text style={styles.priceTotalLabel}>Tổng thanh toán</Text>
        <Text style={styles.priceTotalValue}>{(item.total || 0).toLocaleString()}đ</Text>
      </View>

      <View style={styles.actionsRow}>
        {uiStatus === 'shipping' && (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item, 'track')}>
              <Truck size={16} color="#FF6B9D" />
              <Text style={styles.actionText}>Theo dõi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item, 'contact')}>
              <Text style={styles.actionText}>Liên hệ</Text>
            </TouchableOpacity>
          </>
        )}

        {uiStatus === 'delivered' && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleAction(item, 'reorder')}>
              <Repeat size={16} color="white" />
              <Text style={styles.primaryBtnText}>Mua lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item, 'review')}>
              <Star size={16} color="#FF6B9D" />
              <Text style={styles.actionText}>Viết đánh giá</Text>
            </TouchableOpacity>
          </>
        )}

        {uiStatus === 'cancelled' && (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item, 'reason')}>
              <Slash size={16} color="#C62828" />
              <Text style={styles.actionText}>Lý do hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleAction(item, 'reorder')}>
              <Repeat size={16} color="white" />
              <Text style={styles.primaryBtnText}>Mua lại</Text>
            </TouchableOpacity>
          </>
        )}

        {uiStatus === 'pending' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleAction(item, 'cancel')}>
            <Text style={styles.cancelBtnText}>Hủy đơn</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#ff6b9d", "#c44569"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => Alert.alert('Tìm kiếm', 'Mở tìm kiếm') } style={styles.iconBtn}>
              <Search size={18} color="white" />
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)' as any)} style={styles.iconBtn}>
              <ShoppingCart size={18} color="white" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, activeTab === t.key && styles.tabItemActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Bạn chưa có đơn hàng nào</Text>
          <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/(tabs)' as any)}>
            <Text style={styles.shopNowText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderOrder}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f8' },
  header: { paddingTop: 18, paddingBottom: 16, paddingHorizontal: 14 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { marginLeft: 10 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  tabItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  tabItemActive: { backgroundColor: '#FFEEF3' },
  tabText: { fontSize: 13, color: '#666' },
  tabTextActive: { color: '#FF6B9D', fontWeight: '700' },
  listContent: { padding: 12, paddingBottom: 40 },
  orderCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 6, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderNumber: { fontSize: 14, fontWeight: '700', color: '#222' },
  orderDate: { fontSize: 12, color: '#888' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18 },
  statusText: { fontSize: 12, fontWeight: '700' },
  previewContainer: { marginBottom: 10 },
  previewItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  previewImage: { width: 48, height: 48, borderRadius: 8, marginRight: 10, backgroundColor: '#f0f0f0' },
  previewFallback: { width: 48, height: 48, borderRadius: 8, marginRight: 10, backgroundColor: '#f7f7f7', alignItems: 'center', justifyContent: 'center' },
  previewFallbackText: { fontSize: 18 },
  previewTextWrap: { flex: 1 },
  previewName: { fontSize: 13, fontWeight: '600', color: '#222' },
  previewMeta: { fontSize: 12, color: '#888' },
  moreText: { fontSize: 12, color: '#666', marginTop: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  priceLabel: { fontSize: 12, color: '#666' },
  priceValue: { fontSize: 12, color: '#222' },
  priceRowAccent: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  priceTotalLabel: { fontSize: 14, color: '#222', fontWeight: '700' },
  priceTotalValue: { fontSize: 16, color: '#FF6B9D', fontWeight: '800' },
  actionsRow: { flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: 'white' },
  actionText: { marginLeft: 8, color: '#333' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FF6B9D' },
  primaryBtnText: { color: 'white', marginLeft: 8, fontWeight: '700' },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#F2C2C2' },
  cancelBtnText: { color: '#C62828', fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, color: '#444', marginTop: 12, marginBottom: 12 },
  shopNowBtn: { backgroundColor: '#FF6B9D', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  shopNowText: { color: 'white', fontWeight: '700' },
});
