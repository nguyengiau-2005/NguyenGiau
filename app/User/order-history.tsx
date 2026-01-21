import apiReview from '@/api/apiReview';
import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
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
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image, Modal, Pressable,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'picking' | 'shipping' | 'delivered' | 'cancelled';

import apiOrder from '@/api/apiOrder';
import apiOrderItem from '@/api/apiOrderItem';
import { formatCurrencyFull } from '@/utils/format';

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
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'picking', label: 'Chờ lấy hàng' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderStatus>('all');

  // Use orders from OrdersContext
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiOrder.getAllOrders();
      // Chuyển đổi dữ liệu từ Baserow sang cấu trúc mà giao diện của bạn cần
      // Sau đó, lấy chi tiết Order Items (có trường image_url) cho mỗi đơn
      const basicOrders = response.results.map((item: any) => ({
        id: item.id,
        orderNumber: item.order_number,
        date: new Date(item.created_at).toLocaleString('vi-VN'),
        status: item.status?.value || 'Pending',
        total: Number(item.total),
        subtotal: Number(item.subtotal),
        shippingCost: Number(item.shipping_cost),
      }));

      // Lấy chi tiết order_items nhưng giới hạn concurrency để tránh 429
      const concurrency = 3;
      const itemsByOrder: any[] = [];
      for (let i = 0; i < basicOrders.length; i += concurrency) {
        const chunk = basicOrders.slice(i, i + concurrency);
        const results = await Promise.all(
          chunk.map(async (o) => {
            try {
              return await apiOrderItem.getItemsByOrder(Number(o.id));
            } catch (e) {
              console.warn('Không lấy được items cho order', o.id, e);
              return [];
            }
          })
        );
        itemsByOrder.push(...results);
        // nhỏ giọt giữa các chunk để giảm tải
        if (i + concurrency < basicOrders.length) {
          await new Promise((res) => setTimeout(res, 300));
        }
      }

      const mappedOrders = basicOrders.map((o, idx) => {
        const items = (itemsByOrder[idx] || []).map((it: any) => ({
          id: String(it.id),
          name: it.product_name,
          variant: '',
          qty: it.quantity,
          price: Number(it.price),
          img: it.image_url || undefined,
        }));

        return {
          id: String(o.id),
          orderNumber: o.orderNumber,
          date: o.date,
          status: o.status,
          total: o.total,
          subtotal: o.subtotal,
          shippingCost: o.shippingCost,
          items,
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  const statusColors: Record<Exclude<OrderStatus, 'all'>, { bg: string; text: string }> = {
    pending: { bg: '#FFF4E5', text: '#FF8A00' },
    confirmed: { bg: '#E3F2FD', text: '#1976D2' },
    picking: { bg: '#E8F6FF', text: '#1266F1' },
    shipping: { bg: '#E8F9F0', text: '#0F9D58' },
    delivered: { bg: '#F0F6EA', text: '#2E7D32' },
    cancelled: { bg: '#FDECEA', text: '#C62828' },
  };

  const statusLabels: Record<Exclude<OrderStatus, 'all'>, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    picking: 'Chờ lấy hàng',
    shipping: 'Đang giao',
    delivered: 'Hoàn tất',
    cancelled: 'Đã hủy',
  };

  const mapOrderStatusToTab = (s: any): Exclude<OrderStatus, 'all'> => {
    // Nếu s là object (do Baserow trả về), lấy trường value
    const statusValue = typeof s === 'object' ? s?.value : s;

    if (statusValue === 'Chờ xác nhận' || statusValue === 'Pending') return 'pending';
    if (statusValue === 'Đã xác nhận' || statusValue === 'Confirmed') return 'confirmed';
    if (statusValue === 'Chờ lấy hàng' || statusValue === 'Picking') return 'picking';
    if (statusValue === 'Đang giao' || statusValue === 'Shipped') return 'shipping';
    if (statusValue === 'Hoàn tất' || statusValue === 'Delivered') return 'delivered';
    if (statusValue === 'Đã hủy' || statusValue === 'Cancelled') return 'cancelled';

    return 'pending';
  };

  const filtered = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((o) => {
      // Ép kiểu o.status về Tab tương ứng trước khi so sánh
      const orderTab = mapOrderStatusToTab(o.status);
      return orderTab === activeTab;
    });
  }, [activeTab, orders]);

  // Reorder + Review states
  const { addToCart } = useCart();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewOrder, setReviewOrder] = useState<number | null>(null);

  const submitReview = async () => {
    try {
      await apiReview.createReview({ product_id: Number(reviewProductId), order_id: Number(reviewOrder), rating: reviewRating, comment: reviewText });
      Alert.alert('Cảm ơn', 'Đánh giá đã được gửi');
      setReviewModalVisible(false);
      setReviewText('');
      setReviewRating(5);
    } catch (e) {
      console.error('Lỗi gửi đánh giá', e);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá');
    }
  };

  const renderProductPreview = (items: any[]) => {
    const preview = items.slice(0, 3);
    const more = items.length - preview.length;
    return (
      <View style={styles.previewContainer}>
        {preview.map((p) => (
          <View key={String(p.id)} style={styles.previewItem}>
            {p.img ? (
              <Image
                source={{ uri: Array.isArray(p.img) ? p.img?.[0]?.url : (typeof p.img === 'string' ? p.img : 'https://via.placeholder.com/150') }}
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
        // add items back to cart
        try {
          order.items.forEach((it: any) => {
            addToCart({ id: Number(it.id), name: it.name, price: Number(it.price) || 0, qty: Number(it.qty) || 1, img: it.img || '', volume: it.variant || '', sizeId: undefined });
          });
          Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
        } catch (e) {
          console.error('Lỗi mua lại:', e);
          Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
        }
        break;
      case 'review':
        // open review modal for first product in order
        if ((order.items || []).length > 0) {
          const first = order.items[0];
          setReviewOrder(Number(order.id));
          setReviewProductId(Number(first.id));
          setReviewModalVisible(true);
        } else {
          Alert.alert('Không có sản phẩm', 'Không tìm thấy sản phẩm để đánh giá');
        }
        break;
      case 'cancel':
        Alert.alert('Hủy đơn', 'Bạn có muốn hủy đơn này?', [
          { text: 'Không' },
          {

            text: 'Có',
            onPress: async () => {
              const orderIdNum = Number(order.id);
              try {
                // 1. Gọi API cập nhật trạng thái trên Baserow
                // Đảm bảo chữ 'Đã hủy' khớp 100% với Option trong Single Select của bạn
                // Baserow may expect the select option in the backend language (English)
                // Use the backend option key 'Cancelled' when updating; keep local label Vietnamese for UI
                await apiOrder.updateOrder(orderIdNum, {
                  status: 'Cancelled'
                });

                // 2. Cập nhật State cục bộ để biến mất khỏi tab hiện tại/hiện ở tab Đã hủy
                setOrders(prev =>
                  prev.map(o => (String(o.id) === String(order.id) ? { ...o, status: 'Đã hủy' } : o))
                );

                Alert.alert('Thành công', 'Đơn hàng đã được hủy');
              } catch (err: any) {
                console.error('Lỗi hủy đơn:', err.response?.data || err.message);
                Alert.alert('Lỗi', 'Không thể hủy đơn. Vui lòng thử lại sau.');
              }
            }
          }
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
          <Text style={styles.priceValue}>{formatCurrencyFull(subTotal)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Phí ship</Text>
          <Text style={styles.priceValue}>{shipping === 0 ? 'Miễn phí' : formatCurrencyFull(shipping)}</Text>
        </View>
        <View style={styles.priceRowAccent}>
          <Text style={styles.priceTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.priceTotalValue}>{formatCurrencyFull(item.total || 0)}</Text>
        </View>

        <View style={styles.actionsRow}>
          {uiStatus === 'shipping' && (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item, 'track')}>
                <Truck size={16} color={AppColors.primary} />
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
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/user/review?orderId=${item.id}`)}>
                <Star size={16} color={AppColors.primary} />
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
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => Alert.alert('Tìm kiếm', 'Mở tìm kiếm')} style={styles.iconBtn}>
              <Search size={18} color="white" />
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)' as any)} style={styles.iconBtn}>
              <ShoppingCart size={18} color="white" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      {/* Tabs - Cho phép lướt ngang */}
      <View style={{ backgroundColor: '#fff' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabItem, activeTab === t.key && styles.tabItemActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

      {/* Review Modal */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Viết đánh giá</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Sản phẩm: {reviewProductId}</Text>
            <TextInput placeholder="Viết nhận xét của bạn..." value={reviewText} onChangeText={setReviewText} style={{ minHeight: 80, borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 8 }} multiline />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 8 }}>Đánh giá:</Text>
                {[1,2,3,4,5].map(n => (
                  <TouchableOpacity key={n} onPress={() => setReviewRating(n)} style={{ marginRight: 6 }}>
                    <Text style={{ color: reviewRating >= n ? '#FFB800' : '#CCC', fontSize: 20 }}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={{ padding: 10, marginRight: 8 }}><Text>Hủy</Text></TouchableOpacity>
                <TouchableOpacity onPress={submitReview} style={{ backgroundColor: AppColors.primary, padding: 10, borderRadius: 8 }}><Text style={{ color: '#fff' }}>Gửi</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f8' },
  header: { paddingTop: 54, paddingBottom: 16, paddingHorizontal: 14 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { marginLeft: 10 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  tabItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  tabItemActive: { backgroundColor: '#FFEEF3' },
  tabText: { fontSize: 13, color: '#666' },
  tabTextActive: { color: AppColors.primary, fontWeight: '700' },
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
  priceTotalValue: { fontSize: 16, color: AppColors.primary, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: 'white' },
  actionText: { marginLeft: 8, color: '#333' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: AppColors.primary },
  primaryBtnText: { color: 'white', marginLeft: 8, fontWeight: '700' },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#F2C2C2' },
  cancelBtnText: { color: '#C62828', fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, color: '#444', marginTop: 12, marginBottom: 12 },
  shopNowBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  shopNowText: { color: 'white', fontWeight: '700' },
});
