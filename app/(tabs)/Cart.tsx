import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { formatCurrencyFull } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  Gift,
  Home,
  Minus,
  Plus,
  ShoppingCart,
  Trash2
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Khai báo hằng số trực tiếp
const SHIPPING_FEE = 15.000;
const FREE_SHIP_LIMIT = 50.000;

export default function CartScreen() {
  const { cart, removeFromCart, updateQty, setSelectedCheckoutItems } = useCart();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // --- LOGIC TÍNH TOÁN TRỰC TIẾP ---
  const selectedCartItems = cart.filter(item => 
    selectedItems.includes(`${item.id}-${item.volume ?? '50ml'}`)
  );

  // 1. Tính tiền hàng
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // 2. Tính phí ship (Ví dụ: 450k + 15k ship = 465k)
  const shipping = SHIPPING_FEE && subtotal < FREE_SHIP_LIMIT ? SHIPPING_FEE : 0;
  
  // 3. Tổng thanh toán
  const finalTotal = subtotal + shipping;

  const toggleSelectItem = (key: string) => {
    setSelectedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  if (!cart.length) return <EmptyCartView router={router} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ Hàng ({cart.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}><Home size={24} color="#fff" /></TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        
        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          {cart.map((item) => {
            const itemKey = `${item.id}-${item.volume ?? '50ml'}`;
            const isSelected = selectedItems.includes(itemKey);
            return (
              <View key={itemKey} style={styles.productCard}>
                <TouchableOpacity 
                  onPress={() => toggleSelectItem(itemKey)} 
                  style={[styles.checkbox, isSelected && styles.checkboxActive]}
                >
                  {isSelected && <View style={styles.checkInner} />}
                </TouchableOpacity>

                <Image source={{ uri: typeof item.img === 'string' ? item.img : item.img?.[0]?.url }} style={styles.productImg} />

                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productVolume}>{item.volume || '50ml'}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{formatCurrencyFull(item.price)}</Text>
                    <View style={styles.quantityBox}>
                      <TouchableOpacity onPress={() => updateQty(item.id, Math.max(1, item.qty - 1), item.volume)}><Minus size={16} color="#666" /></TouchableOpacity>
                      <Text style={styles.qtyText}>{item.qty}</Text>
                      <TouchableOpacity onPress={() => updateQty(item.id, item.qty + 1, item.volume)}><Plus size={16} color={AppColors.primary} /></TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id, item.volume)}>
                  <Trash2 size={18} color="#FF4D4D" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Voucher Info */}
        <TouchableOpacity style={styles.infoRow} onPress={() => Alert.alert("Voucher", "Voucher sẽ được áp dụng tự động tại đây.")}>
          <View style={styles.rowLeft}>
            <Gift size={20} color={AppColors.primary} />
            <Text style={styles.rowText}>Chọn hoặc nhập mã giảm giá</Text>
          </View>
          <ChevronRight size={20} color="#CCC" />
        </TouchableOpacity>

        {/* Bảng tính toán trực tiếp */}
        <View style={styles.summaryCard}>
          <SummaryLine label="Tổng tiền hàng" value={formatCurrencyFull(subtotal)} />
          <SummaryLine 
            label="Phí vận chuyển" 
            value={shipping === 0 && subtotal > 0 ? "Miễn phí" : shipping} 
            isFree={shipping === 0 && subtotal > 0}
          />
          
          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrencyFull(finalTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomPrice}>{formatCurrencyFull(finalTotal)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.checkoutBtn, !selectedItems.length && styles.btnDisabled]}
          onPress={() => {
            setSelectedCheckoutItems(selectedCartItems);
            // TRUYỀN TỔNG TIỀN QUA PARAMS
            router.push({
              pathname: '/user/checkout',
              params: { totalAmount: finalTotal }
            } as any);
          }}
          disabled={!selectedItems.length}
        >
          <Text style={styles.checkoutText}>Thanh toán ({selectedItems.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Components bổ trợ
const SummaryLine = ({ label, value, isFree }: any) => (
  <View style={styles.summaryLine}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryValue, isFree && { color: '#27ae60' }]}>{value}</Text>
  </View>
);

const EmptyCartView = ({ router }: any) => (
  <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.emptyContainer}>
    <ShoppingCart size={100} color="#ffffff60" />
    <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
    <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
      <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
    </TouchableOpacity>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  section: { padding: 16 },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 12, alignItems: 'center', elevation: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#fff' },
  checkInner: { width: 12, height: 12, borderRadius: 3, backgroundColor: AppColors.primary },
  productImg: { width: 75, height: 75, borderRadius: 15, marginLeft: 12, backgroundColor: '#F1F1F1' },
  productDetails: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: '700', color: '#333' },
  productVolume: { fontSize: 11, color: '#999', marginVertical: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 14, fontWeight: '800', color: AppColors.primary },
  quantityBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, padding: 4, gap: 12 },
  qtyText: { fontSize: 13, fontWeight: '700' },
  deleteBtn: { padding: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, padding: 15, borderRadius: 18, marginBottom: 15, elevation: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowText: { fontSize: 13, fontWeight: '600', color: '#444' },
  summaryCard: { backgroundColor: '#fff', marginHorizontal: 16, padding: 20, borderRadius: 25, elevation: 1 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#888', fontSize: 13, fontWeight: '500' },
  summaryValue: { fontWeight: '700', color: '#333', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '900', color: AppColors.primary },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, paddingBottom: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', elevation: 20 },
  bottomLabel: { color: '#999', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  bottomPrice: { fontSize: 22, fontWeight: '900', color: AppColors.primary },
  checkoutBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 18, minWidth: 140, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#E0E0E0' },
  checkoutText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 20 },
  shopBtn: { marginTop: 30, backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20 },
  shopBtnText: { color: AppColors.primary, fontWeight: '800' }
});