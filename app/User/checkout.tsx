import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrdersContext';
import useDeviceLocation from '@/hooks/useDeviceLocation';
import { formatCurrencyFull } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, MapPin, ShieldCheck, Truck } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function CheckoutScreen() {
  const router = useRouter();
  const { selectedCheckoutItems, clearCart } = useCart();
  const auth = useAuth();
  const { addOrder } = useOrders();
  const { address: detectedAddress, loading: locationLoading, fetchLocation } = useDeviceLocation();

  const cartItems = selectedCheckoutItems || [];

  // --- STATE QUẢN LÝ ---
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [shippingAddress] = useState({
    name: auth.user?.full_name || 'Khách hàng',
    phone: auth.user?.phone || 'Chưa cập nhật',
    address: 'Vui lòng chọn địa chỉ giao hàng',
  });

  // --- LOGIC TÍNH TOÁN TRỰC TIẾP ---
  // 1. Tổng tiền hàng (Ép kiểu Number để tính toán chính xác)
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  // 2. Phí vận chuyển: Miễn phí nếu đơn hàng từ 500k trở lên
  const SHIPPING_PRICE = { standard: 15.000, express: 30.000 };
  const shippingCost = (subtotal >= 500000 || subtotal === 0) ? 0 : SHIPPING_PRICE[shippingMethod];

  // 3. Tổng thanh toán cuối cùng
  const totalPayment = subtotal + shippingCost;

  const handlePlaceOrder = () => {
    if (!auth.isLoggedIn) {
      Alert.alert('Yêu cầu', 'Vui lòng đăng nhập để thanh toán');
      return;
    }

    if (paymentMethod === 'bank') {
      setShowBankModal(true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addOrder(cartItems, 'Pending', undefined, { total: totalPayment, subtotal, shippingCost, paymentMethod });
      clearCart();
      router.push('/user/order-history' as any);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* ====== HEADER ====== */}
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận thanh toán</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ĐỊA CHỈ GIAO HÀNG */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={AppColors.primary} />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <View style={styles.addressBody}>
            <Text style={styles.addressMainText}>{shippingAddress.name} | {shippingAddress.phone}</Text>
            <Text style={styles.addressSubText}>{detectedAddress || shippingAddress.address}</Text>
            <TouchableOpacity onPress={fetchLocation} style={styles.locationTag}>
              <Text style={styles.locationTagText}>
                {locationLoading ? 'Đang định vị...' : '📌 Sử dụng vị trí hiện tại'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PHƯƠNG THỨC VẬN CHUYỂN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Truck size={18} color={AppColors.primary} />
            <Text style={styles.sectionTitle}>Đơn vị vận chuyển</Text>
          </View>

          <ShippingOption
            id="standard"
            title="Tiêu chuẩn"
            desc="Nhận hàng sau 2-3 ngày"
            price={subtotal >= 500000 ? 0 : SHIPPING_PRICE.standard}
            active={shippingMethod}
            setter={setShippingMethod}
          />
          <View style={{ height: 10 }} />
          <ShippingOption
            id="express"
            title="Hỏa tốc"
            desc="Nhận hàng trong 24h"
            price={subtotal >= 500000 ? 0 : SHIPPING_PRICE.express}
            active={shippingMethod}
            setter={setShippingMethod}
          />
        </View>

        {/* THANH TOÁN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CreditCard size={18} color={AppColors.primary} />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.paymentRow}>
            <PaymentOption id="cod" label="Tiền mặt" icon="💵" active={paymentMethod} setter={setPaymentMethod} />
            <PaymentOption id="bank" label="Chuyển khoản" icon="🏦" active={paymentMethod} setter={setPaymentMethod} />
            <PaymentOption id="wallet" label="Ví Fiora" icon="🌸" active={paymentMethod} setter={setPaymentMethod} />
          </View>
        </View>

        {/* DANH SÁCH SẢN PHẨM */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleSmall}>Sản phẩm đã chọn</Text>
          {cartItems.map((item, index) => (
            <View key={item.id + index} style={styles.itemRow}>
              <Image source={{ uri: typeof item.img === 'string' ? item.img : item.img?.[0]?.url }} style={styles.itemImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>Số lượng: {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrencyFull(item.price * item.qty)}</Text>
            </View>
          ))}
        </View>

        {/* CHI TIẾT HÓA ĐƠN LUXE */}
        <View style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tổng tiền hàng</Text>
            <Text style={styles.billValue}>{formatCurrencyFull(subtotal)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Phí vận chuyển</Text>
            <Text style={styles.billValue}>
              {shippingCost === 0 ? 'Miễn phí' : formatCurrencyFull(shippingCost)}
            </Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrencyFull(totalPayment)}</Text>
          </View>
        </View>

        <View style={styles.secureBadge}>
          <ShieldCheck size={14} color="#666" />
          <Text style={styles.secureText}>Thanh toán được bảo mật bởi Fiora Luxe</Text>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER FIXED */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Tổng cộng</Text>
          <Text style={styles.footerPrice}>{formatCurrencyFull(totalPayment)}</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeOrderText}>Đặt hàng ngay</Text>}
        </TouchableOpacity>
      </View>

      {/* MODAL NGÂN HÀNG */}
      <Modal
        visible={!!showBankModal} // Ép kiểu chắc chắn là boolean
        animationType="fade"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bankCard}>
            <Text style={styles.bankTitle}>Quét mã VietQR</Text>
            <View style={styles.qrContainer}>
              <QRCode value={`QR_PAYMENT_${totalPayment}`} size={200} color={AppColors.primary} />
            </View>
            <Text style={styles.bankDetails}>Chủ TK: NGUYEN GIAO | STK: 0123456789</Text>
            <Text style={styles.bankAmount}>Số tiền: {formatCurrencyFull(totalPayment)}</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowBankModal(false)}>
              <Text style={styles.doneBtnText}>Tôi đã chuyển tiền</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- SUB-COMPONENTS ---
const ShippingOption = ({ id, title, desc, price, active, setter }: any) => (
  <TouchableOpacity
    style={[styles.selector, active === id && styles.selectorActive]}
    onPress={() => setter(id)}
  >
    <View>
      <Text style={styles.selectorName}>{title}</Text>
      <Text style={styles.selectorDesc}>{desc}</Text>
    </View>
    <Text style={styles.selectorPrice}>{price === 0 ? 'Miễn phí' : formatCurrencyFull(price)}</Text>
  </TouchableOpacity>
);

const PaymentOption = ({ id, label, icon, active, setter }: any) => (
  <TouchableOpacity
    style={[styles.payOpt, active === id && styles.payOptActive]}
    onPress={() => setter(id)}
  >
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={[styles.payOptText, active === id && { color: AppColors.primary }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  addressBody: { borderLeftWidth: 3, borderLeftColor: AppColors.primary, paddingLeft: 12 },
  addressMainText: { fontWeight: '700', fontSize: 14, color: '#333' },
  addressSubText: { fontSize: 13, color: '#666', marginTop: 4 },
  locationTag: { marginTop: 10, backgroundColor: '#FFF0F5', padding: 6, borderRadius: 8, alignSelf: 'flex-start' },
  locationTagText: { fontSize: 11, color: AppColors.primary, fontWeight: '700' },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },
  selectorActive: { borderColor: AppColors.primary, backgroundColor: '#FFF5F7' },
  selectorName: { fontSize: 13, fontWeight: '700' },
  selectorDesc: { fontSize: 11, color: '#999' },
  selectorPrice: { fontWeight: '800', color: AppColors.primary },
  paymentRow: { flexDirection: 'row', gap: 10 },
  payOpt: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#FAFAFA' },
  payOptActive: { borderColor: AppColors.primary, backgroundColor: '#FFF5F7' },
  payOptText: { fontSize: 11, fontWeight: '700', marginTop: 6, color: '#666' },
  sectionTitleSmall: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 10 },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 15 },
  itemImg: { width: 55, height: 55, borderRadius: 12, backgroundColor: '#F8F8F8' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#333' },
  itemQty: { fontSize: 11, color: '#999', marginTop: 2 },
  itemPrice: { fontWeight: '800', fontSize: 14, color: '#333' },
  billCard: { backgroundColor: '#333', borderRadius: 25, padding: 20, marginTop: 10 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { color: '#AAA', fontSize: 13 },
  billValue: { color: '#FFF', fontWeight: '700' },
  billDivider: { height: 1, backgroundColor: '#444', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  totalValue: { color: AppColors.primary, fontSize: 22, fontWeight: '900' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, paddingBottom: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  footerLabel: { fontSize: 11, color: '#999', fontWeight: '700', textTransform: 'uppercase' },
  footerPrice: { fontSize: 22, fontWeight: '900', color: AppColors.primary },
  placeOrderBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, minWidth: 150, alignItems: 'center' },
  placeOrderText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 25 },
  bankCard: { backgroundColor: '#fff', borderRadius: 30, padding: 25, alignItems: 'center' },
  bankTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, color: '#333' },
  qrContainer: { padding: 15, backgroundColor: '#F9F9F9', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  bankDetails: { fontWeight: '700', color: '#555', fontSize: 13 },
  bankAmount: { fontSize: 24, fontWeight: '900', color: AppColors.primary, marginVertical: 12 },
  doneBtn: { backgroundColor: AppColors.primary, width: '100%', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secureBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 25 },
  secureText: { fontSize: 11, color: '#999', fontWeight: '600' }
});