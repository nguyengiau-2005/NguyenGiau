import apiOrder, { CreateOrderPayload } from '@/api/apiOrder';
import apiOrderItem from '@/api/apiOrderItem';
import apiPayment from '@/api/apiPayment';
import apiUser from '@/api/apiUser';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { useCart } from '@/contexts/CartContext';
import useDeviceLocation from '@/hooks/useDeviceLocation';
import { formatCurrencyFull } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  CreditCard,
  Gift,
  MapPin,
  Truck
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

// Hằng số phí ship
const SHIPPING_PRICES = {
  standard: 15.000,
  express: 30.000
};
const FREE_SHIP_LIMIT = 500.000;

const BANK_INFO = {
  BANK_ID: "MB",
  ACCOUNT_NO: "0392986255",
  ACCOUNT_NAME: "NGUYEN THI NGOC GIAU"
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { totalAmount, voucherId } = useLocalSearchParams();
  const { selectedCheckoutItems, clearCart } = useCart();
  const auth = useAuth();
  const { address: detectedAddress, loading: locationLoading, fetchLocation } = useDeviceLocation();

  const cartItems = selectedCheckoutItems || [];

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const [shippingAddress] = useState({
    name: auth.user?.full_name || 'Khách hàng',
    phone: auth.user?.phone || 'Chưa cập nhật',
    address: 'Vui lòng chọn địa chỉ giao hàng',
  });

  const [savedAddresses, setSavedAddresses] = useState<Array<any>>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!auth.user?.id) return;
      try {
        const userData = await apiUser.getUserDetail(auth.user.id);
        if (userData) {
          const full = userData.address_line ? `${userData.address_line}${userData.ward ? ', ' + userData.ward : ''}${userData.district ? ', ' + userData.district : ''}${userData.city ? ', ' + userData.city : ''}` : '';
          const addr = {
            id: 'user-address',
            name: userData.full_name || auth.user?.full_name,
            phone: userData.phone || auth.user?.phone,
            full_address: full || '',
            raw: userData
          };
          setSavedAddresses([addr]);
          setSelectedAddressId(addr.id);
        }
      } catch (e) {
        console.warn('Không thể tải địa chỉ người dùng', e);
      }
    };
    loadSavedAddress();
  }, [auth.user?.id]);

  // --- LOGIC TÍNH TOÁN ---
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  const baseShippingInCart = (subtotal >= FREE_SHIP_LIMIT) ? 0 : SHIPPING_PRICES.standard;
  const passedTotal = Number(totalAmount) || 0;
  const discountAmount = totalAmount ? Math.max(0, (subtotal + baseShippingInCart) - passedTotal) : 0;
  const currentShippingCost = (subtotal >= FREE_SHIP_LIMIT) ? 0 : SHIPPING_PRICES[shippingMethod];
  const finalTotal = Math.max(0, subtotal + currentShippingCost - discountAmount);

  const handlePlaceOrder = async () => {
    if (!auth.isLoggedIn) {
      Alert.alert('Yêu cầu', 'Vui lòng đăng nhập để thanh toán');
      return;
    }
    processOrderApi();
  };

  const processOrderApi = async () => {
    // prefer selected saved address if available
    const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
    const addrLine = selectedAddr?.full_address || detectedAddress || auth.user?.address_line || shippingAddress.address;
    const contactName = selectedAddr?.name || shippingAddress.name;
    const contactPhone = selectedAddr?.phone || shippingAddress.phone;
    const fullAddressStr = `${contactName} - ${contactPhone} - ${addrLine}`;
    const bankSelected = paymentMethod === 'bank';
    setIsLoading(true);
    try {
      // 1. Tạo Order Items (upload ảnh nếu cần) và thu thập tham chiếu ảnh
      const orderItemPromises = cartItems.map(async (item) => {
        let imageRef: string | undefined = undefined;

        // item.img may be a string (URL), an object with uri (local), or an array/object with url
        if (typeof item.img === 'string') {
          imageRef = item.img;
        } else if (item.img?.uri) {
          // upload local image and get name returned by server
          try {
            const uploadedName = await apiUser.uploadFile(item.img.uri);
            // apiUser.uploadFile returns a string filename; use it directly
            imageRef = uploadedName;
          } catch (e) {
            console.warn('Upload ảnh thất bại, dùng fallback:', e);
            imageRef = undefined;
          }
        } else if (Array.isArray(item.img) && item.img[0]) {
          // array of files/objects
          const first = item.img[0];
          imageRef = first?.url || (first as any)?.name || (typeof first === 'string' ? first : undefined);
        } else if (item.img && typeof item.img === 'object') {
          // single object with url or name
          imageRef = (item.img as any).url || (item.img as any).name || undefined;
        }

        const created = await apiOrderItem.createOrderItem({
          product_id: Number(item.id),
          product_name: item.name,
          price: item.price.toString(),
          quantity: item.qty,
          image_url: imageRef,
          product_size_id: item.sizeId ? [Number(item.sizeId)] : []
        });

        return { created, imageRef };
      });

      const createdItemsWithImages = await Promise.all(orderItemPromises);
      const orderItemIds = createdItemsWithImages.map(res => res.created.id);
      const imageArray = createdItemsWithImages.map(x => x.imageRef).filter(Boolean) as Array<string>;

      // 2. Tạo Order
      const payload: CreateOrderPayload = {
        image: imageArray.length > 0 ? imageArray[0] : undefined,
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        status: 'Chờ xác nhận', // Đảm bảo từ này cũng đúng trên Baserow
        payment_method: bankSelected ? 'BANK' : 'COD',
        payment_status: bankSelected ? 'Đã thanh toán' : 'Chưa thanh toán',
        delivery_address: fullAddressStr,
        note: `Voucher: ${voucherId || 'None'}`,
        order_items: orderItemIds,
        subtotal: subtotal.toString(),
        shipping_cost: currentShippingCost.toString(),
        discount: discountAmount.toString(),
        total: finalTotal.toString(),
      };

      // Use the first available image (Baserow expects a single URL string)
      // Debug: log payload image content to help server validation issues
      try { console.log('DEBUG: Order payload.image (sent):', payload.image); } catch (e) {}

      const res = await apiOrder.createOrder(payload);

      if (res && res.id) {
        // fetch server-side detail to ensure created_at/updated_at present
        try {
          const serverOrder = await apiOrder.getOrderDetail(res.id);
          if (bankSelected) {
            setCreatedOrderId(res.id);
            setIsLoading(false);
            setShowBankModal(true);
          } else {
            finishOrderSuccess(serverOrder.created_at);
          }
        } catch (err) {
          // If we can't fetch detail, still continue with response from create
          console.warn('Không lấy được chi tiết order sau khi tạo, dùng dữ liệu trả về từ create:', err);
          if (bankSelected) {
            setCreatedOrderId(res.id);
            setIsLoading(false);
            setShowBankModal(true);
          } else {
            finishOrderSuccess(res.created_at);
          }
        }
      }
    } catch (error: any) {
      console.error("LỖI ĐẶT HÀNG:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể xử lý đơn hàng. Vui lòng kiểm tra lại các tùy chọn.");
      setIsLoading(false);
    }
  };

  const handleConfirmBankTransfer = async () => {
    if (!createdOrderId) return;
    setIsLoading(true);

    try {
      // 1. Ghi nhận vào bảng Payments làm bằng chứng
      await apiPayment.createPayment({
        "Name": `Thanh toán chuyển khoản đơn #${createdOrderId}`,
        "Order Link": [createdOrderId],
        "Transaction ID": `BANK${Date.now()}`,
        "Amount": finalTotal.toString(),
        "Payment Method": "Bank",
        "Status": "Success",
        "Payment Date": new Date().toISOString()
      });

      // 2. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH "ĐÃ THANH TOÁN"
      await apiOrder.updateOrder(createdOrderId, {
        payment_status: 'Đã thanh toán' // Đảm bảo từ này khớp 100% với Baserow
      });

      setShowBankModal(false);

      // 3. Lấy thông tin đơn hàng đã cập nhật để hiển thị ngày tạo chính xác
      const updatedOrder = await apiOrder.getOrderDetail(createdOrderId);
      finishOrderSuccess(updatedOrder.created_at);

    } catch (error: any) {
      console.error("Lỗi xác nhận thanh toán:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng. Vui lòng liên hệ hỗ trợ.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tìm đến hàm finishOrderSuccess và sửa thành:
  const finishOrderSuccess = (ngayTao?: string) => {
    clearCart();
    const thoiGianHienThi = formatDate(ngayTao); // Sử dụng hàm formatDate vừa tạo

    Alert.alert(
      "Thành công",
      `Đơn hàng đã được tạo thành công vào lúc: ${thoiGianHienThi}!`,
      [
        { text: "Về trang chủ", onPress: () => router.replace('/(tabs)') }
      ]
    );
  };
  const qrCodeUrl = `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-compact2.png?amount=${finalTotal}&addInfo=DH${createdOrderId || '0000'}&accountName=${BANK_INFO.ACCOUNT_NAME}`;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận thanh toán</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. ĐỊA CHỈ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={AppColors.primary} />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <View style={styles.addressBody}>
            {savedAddresses.length > 0 ? (
              savedAddresses.map((a) => (
                <TouchableOpacity key={a.id} onPress={() => setSelectedAddressId(a.id)} style={[styles.savedAddressRow, selectedAddressId === a.id && styles.savedAddressActive]}>
                  <Text style={styles.addressMainText}>{a.name} | {a.phone}</Text>
                  <Text style={styles.addressSubText} numberOfLines={2}>{a.full_address || 'Chưa có địa chỉ chi tiết'}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                <Text style={styles.addressMainText}>{shippingAddress.name} | {shippingAddress.phone}</Text>
                <Text style={styles.addressSubText}>{detectedAddress || auth.user?.address_line || shippingAddress.address}</Text>
              </>
            )}

            <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
              <TouchableOpacity onPress={fetchLocation} style={styles.locationTag} disabled={locationLoading}>
                <Text style={styles.locationTagText}>{locationLoading ? '⏳ Đang định vị...' : '📌 Cập nhật vị trí hiện tại'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/user/address')} style={[styles.locationTag, { backgroundColor: '#F0F0F0' }]}>
                <Text style={[styles.locationTagText, { color: '#333' }]}>Chọn/Sửa địa chỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. SẢN PHẨM */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleSmall}>Sản phẩm ({cartItems.length})</Text>
          {cartItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.itemRow}>
              <Image
                source={{ uri: typeof item.img === 'string' ? item.img : item.img?.[0]?.url }}
                style={styles.itemImg}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>Phân loại: {item.volume || 'Tiêu chuẩn'}</Text>
                <Text style={styles.itemQty}>x{item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrencyFull(Number(item.price) * item.qty)}</Text>
            </View>
          ))}
        </View>

        {/* 3. VOUCHER */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Gift size={18} color={AppColors.primary} />
            <Text style={styles.sectionTitle}>Ưu đãi Fiora</Text>
          </View>
          {discountAmount > 0 ? (
            <View style={styles.voucherAppliedBox}>
              <View>
                <Text style={styles.voucherCodeText}>{voucherId ? `Mã: ${voucherId}` : 'Voucher đã áp dụng'}</Text>
                <Text style={styles.voucherStatusText}>Đã áp dụng thành công</Text>
              </View>
              <Text style={styles.voucherDiscountValue}>-{formatCurrencyFull(discountAmount)}</Text>
            </View>
          ) : (
            <Text style={styles.noVoucherText}>Không có mã giảm giá nào được chọn</Text>
          )}
        </View>

        {/* 4. VẬN CHUYỂN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Truck size={18} color={AppColors.primary} />
            <Text style={styles.sectionTitle}>Đơn vị vận chuyển</Text>
          </View>
          <ShippingOption
            id="standard"
            title="Tiêu chuẩn"
            desc="Nhận hàng sau 2-3 ngày"
            price={subtotal >= FREE_SHIP_LIMIT ? 0 : SHIPPING_PRICES.standard}
            active={shippingMethod}
            setter={setShippingMethod}
          />
          <View style={{ height: 10 }} />
          <ShippingOption
            id="express"
            title="Hỏa tốc"
            desc="Nhận hàng trong 24h"
            price={subtotal >= FREE_SHIP_LIMIT ? 0 : SHIPPING_PRICES.express}
            active={shippingMethod}
            setter={setShippingMethod}
          />
        </View>

        {/* 5. THANH TOÁN */}
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

        {/* 6. CHI TIẾT HÓA ĐƠN */}
        <View style={styles.billCard}>
          <BillRow label="Tổng tiền hàng" value={formatCurrencyFull(subtotal)} />
          <BillRow
            label="Phí vận chuyển"
            value={currentShippingCost === 0 ? 'Miễn phí' : formatCurrencyFull(currentShippingCost)}
          />
          {discountAmount > 0 && (
            <BillRow
              label="Voucher giảm giá"
              value={`-${formatCurrencyFull(discountAmount)}`}
              isDiscount
            />
          )}
          <View style={styles.billDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrencyFull(finalTotal)}</Text>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Tổng cộng</Text>
          <Text style={styles.footerPrice}>{formatCurrencyFull(finalTotal)}</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeOrderText}>Đặt hàng ngay</Text>}
        </TouchableOpacity>
      </View>

      {/* MODAL BANK */}
      <Modal visible={showBankModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bankCard}>
            <Text style={styles.bankTitle}>Quét mã VietQR</Text>
            <View style={styles.qrContainer}>
              <Image source={{ uri: qrCodeUrl }} style={{ width: 250, height: 320 }} resizeMode="contain" />
            </View>
            <Text style={styles.bankDetails}>MB Bank - {formatCurrencyFull(finalTotal)}</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={handleConfirmBankTransfer} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.doneBtnText}>Tôi đã chuyển tiền</Text>}
            </TouchableOpacity>
            {!isLoading && (
              <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setShowBankModal(false)}>
                <Text style={{ color: '#666' }}>Quay lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


// Đặt đoạn này ở phía trên, ngoài CheckoutScreen component
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'Đang cập nhật...';
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
// --- SUB-COMPONENTS ---
const ShippingOption = ({ id, title, desc, price, active, setter }: any) => (
  <TouchableOpacity style={[styles.selector, active === id && styles.selectorActive]} onPress={() => setter(id)}>
    <View>
      <Text style={styles.selectorName}>{title}</Text>
      <Text style={styles.selectorDesc}>{desc}</Text>
    </View>
    <Text style={styles.selectorPrice}>{price === 0 ? 'Miễn phí' : formatCurrencyFull(price)}</Text>
  </TouchableOpacity>
);

const PaymentOption = ({ id, label, icon, active, setter }: any) => (
  <TouchableOpacity style={[styles.payOpt, active === id && styles.payOptActive]} onPress={() => setter(id)}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={[styles.payOptText, active === id && { color: AppColors.primary }]}>{label}</Text>
  </TouchableOpacity>
);

const BillRow = ({ label, value, isDiscount }: any) => (
  <View style={styles.billRow}>
    <Text style={styles.billLabel}>{label}</Text>
    <Text style={[styles.billValue, isDiscount && { color: AppColors.primary }]}>{value}</Text>
  </View>
);

// --- STYLES ---
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
  savedAddressRow: { paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, backgroundColor: '#FFF' },
  savedAddressActive: { borderWidth: 1, borderColor: AppColors.primary, backgroundColor: '#F8FBFF' },
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
  voucherAppliedBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF5F7', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: AppColors.primaryLight },
  voucherCodeText: { fontSize: 13, fontWeight: '700', color: '#333' },
  voucherStatusText: { fontSize: 11, color: '#27ae60', marginTop: 2 },
  voucherDiscountValue: { fontSize: 14, fontWeight: '800', color: AppColors.primary },
  noVoucherText: { fontSize: 13, color: '#999', fontStyle: 'italic' },
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
  qrContainer: { padding: 5, backgroundColor: '#F9F9F9', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  bankDetails: { fontWeight: '700', color: '#555', fontSize: 13 },
  doneBtn: { backgroundColor: AppColors.primary, width: '100%', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});