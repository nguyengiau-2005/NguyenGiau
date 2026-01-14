import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrdersContext';
import useDeviceLocation from '@/hooks/useDeviceLocation';
import { formatCurrency } from '@/utils/formatPrice';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, ShoppingBag } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface VoucherOption {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  description?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  estimatedDate: string;
  cost: number;
  freeAt?: number;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { selectedCheckoutItems, clearCart } = useCart();
  const auth = useAuth();
  const { addOrder } = useOrders();

  // Nếu không có items từ cart, hiển thị empty state
  const cartItems = selectedCheckoutItems.length > 0 ? selectedCheckoutItems : [];

  const [shippingAddress, setShippingAddress] = useState({
    name: 'Nguyễn Giao',
    phone: '+84 123 456 789',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  });

  const { address: detectedAddress, loading: locationLoading, fetchLocation } = useDeviceLocation();

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherOption | null>(null);
  const [selectedShippingVoucher, setSelectedShippingVoucher] = useState<VoucherOption | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showShippingVoucherModal, setShowShippingVoucherModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankPaymentRef, setBankPaymentRef] = useState<string | null>(null);

  const vouchers: VoucherOption[] = [
    { code: 'SAVE50K', discount: 50000, type: 'fixed', description: 'Giảm 50.000đ' },
    { code: 'SAVE30PERCENT', discount: 30, type: 'percent', description: 'Giảm 30%' },
    { code: 'NEWUSER', discount: 100000, type: 'fixed', description: 'Giảm 100.000đ (Người dùng mới)' },
  ];

  const shippingVouchers: VoucherOption[] = [
    { code: 'FREESHIP', discount: 100, type: 'percent', description: 'Miễn phí vận chuyển' },
    { code: 'SHIP10', discount: 10000, type: 'fixed', description: 'Giảm 10.000đ phí ship' },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * 1000) * item.qty, 0);
  const shippingCost = subtotal > 500000 ? 0 : (shippingMethod === 'standard' ? 15000 : 30000);
  const voucherDiscount = selectedVoucher
    ? selectedVoucher.type === 'fixed'
      ? selectedVoucher.discount
      : (subtotal * selectedVoucher.discount) / 100
    : 0;
  const shippingVoucherDiscount = selectedShippingVoucher
    ? selectedShippingVoucher.type === 'fixed'
      ? Math.min(selectedShippingVoucher.discount, shippingCost)
      : (shippingCost * selectedShippingVoucher.discount) / 100
    : 0;
  const pointsDiscount = usePoints ? 20000 : 0;
  const finalShippingCost = Math.max(0, shippingCost - shippingVoucherDiscount);
  const total = Math.max(0, subtotal + finalShippingCost - voucherDiscount - pointsDiscount);
  const savedAmount = voucherDiscount + shippingVoucherDiscount + pointsDiscount;

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thanh toán</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)' as any)}
            style={styles.continueShoppingBtn}
          >
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handlePlaceOrder = () => {
    // Require login before placing an order
    if (!auth.isLoggedIn) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để đặt hàng', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/auth/login' as any) },
      ]);
      return;
    }

    // If payment method is bank transfer, show QR modal instead of directly placing
    if (paymentMethod === 'bank') {
      // generate a payment reference for this bank transfer session
      const ref = Date.now().toString();
      setBankPaymentRef(ref);
      setShowBankModal(true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addOrder(cartItems, 'Pending', undefined, {
        total,
        subtotal,
        shippingCost: finalShippingCost,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        notes,
        voucherCode: selectedVoucher?.code,
        voucherDiscount,
      });
      clearCart();
      Alert.alert('Thành công', 'Đơn hàng đã được đặt', [
        {
          text: 'Xem lịch sử',
          onPress: () => router.push('/user/order-history' as any),
        },
        {
          text: 'Về trang chủ',
          onPress: () => router.push('/(tabs)' as any),
        },
      ]);
    }, 1500);
  };

  const verifyBankPayment = () => {
    // Simulate verifying the bank transfer after scanning QR / user confirms
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowBankModal(false);
      addOrder(cartItems, 'Paid', bankPaymentRef ?? undefined, {
        total,
        subtotal,
        shippingCost: finalShippingCost,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        notes,
        voucherCode: selectedVoucher?.code,
        voucherDiscount,
      });
      setBankPaymentRef(null);
      clearCart();
      Alert.alert('Thanh toán thành công', 'Chúng tôi đã nhận được chuyển khoản của bạn', [
        { text: 'Xem lịch sử', onPress: () => router.push('/user/order-history' as any) },
      ]);
    }, 1800);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)' as any)}>
            <ShoppingBag size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={AppColors.primary} />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          </View>
          {shippingAddress ? (
            <>
              <View style={styles.addressBox}>
                <Text style={styles.addressName}>{shippingAddress.name}</Text>
                <Text style={styles.addressPhone}>{shippingAddress.phone}</Text>
                <Text style={styles.addressText}>{shippingAddress.address}</Text>
                {detectedAddress && detectedAddress !== shippingAddress.address && (
                  <TouchableOpacity onPress={() => setShippingAddress(s => ({ ...s, address: detectedAddress }))} style={{ marginTop: 8 }}>
                    <Text style={{ color: AppColors.primary }}>Sử dụng địa chỉ hiện tại: {locationLoading ? '...' : detectedAddress}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => router.push('/user/address' as any)}
                  style={styles.changeButton}
                >
                  <Text style={styles.changeButtonText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/user/address' as any)}
              style={styles.addAddressButton}
            >
              <Text style={styles.addAddressIcon}>➕</Text>
              <Text style={styles.addAddressText}>Thêm địa chỉ giao hàng</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shipping Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          {[
            {
              id: 'standard',
              name: 'Giao hàng tiêu chuẩn',
              cost: subtotal > 500000 ? 0 : 15000,
              time: '3-5 ngày',
            },
            {
              id: 'express',
              name: 'Giao hàng nhanh',
              cost: 30000,
              time: '1-2 ngày',
            },
          ].map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setShippingMethod(method.id)}
              style={[styles.radioOption, shippingMethod === method.id && styles.radioOptionSelected]}
            >
              <View
                style={[
                  styles.radioButton,
                  shippingMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {shippingMethod === method.id && <View style={styles.radioButtonInner} />}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{method.name}</Text>
                <Text style={styles.optionTime}>{method.time}</Text>
              </View>
              <Text style={styles.optionPrice}>{method.cost === 0 ? 'Miễn phí' : formatCurrency(method.cost) + 'đ'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {[
            { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '💵' },
            { id: 'wallet', name: 'Ví điện tử', icon: '👛' },
            { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏦' },
            { id: 'points', name: 'Dùng điểm thưởng', icon: '⭐' },
          ].map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setPaymentMethod(method.id)}
              style={[styles.radioOption, paymentMethod === method.id && styles.radioOptionSelected]}
            >
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === method.id && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.optionIcon}>{method.icon}</Text>
              <Text style={styles.optionName}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm ({cartItems.length})</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemImage}>
                {item.img ? (
                  <Image
                    source={typeof item.img === 'string' ? { uri: item.img } : item.img}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.itemImageText}>📦</Text>
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemQuantity}>x{item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.qty)}đ</Text>
            </View>
          ))}
        </View>

        {/* Item Summary Box */}
        <View style={styles.section}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}đ</Text>
            </View>
            {voucherDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá ({selectedVoucher?.code}):</Text>
                <Text style={[styles.summaryValue, { color: AppColors.primary }]}>
                  -{formatCurrency(voucherDiscount)}đ
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vận chuyển:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(shippingCost)}đ</Text>
            </View>
            {shippingVoucherDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm ship ({selectedShippingVoucher?.code}):</Text>
                <Text style={[styles.summaryValue, { color: AppColors.primary }]}>
                  -{formatCurrency(shippingVoucherDiscount)}đ
                </Text>
              </View>
            )}
            {usePoints && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Dùng điểm:</Text>
                <Text style={[styles.summaryValue, { color: AppColors.primary }]}>
                  -{formatCurrency(pointsDiscount)}đ
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPrice}>{formatCurrency(total)}đ</Text>
            </View>
          </View>
        </View>

        {/* Voucher Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          <TouchableOpacity
            onPress={() => setShowVoucherModal(true)}
            style={styles.voucherButton}
          >
            <Text style={styles.voucherIcon}>🎟️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.voucherLabel}>
                {selectedVoucher ? selectedVoucher.code : 'Chọn voucher'}
              </Text>
              {selectedVoucher && (
                <Text style={styles.voucherDiscount}>
                  Tiết kiệm {formatCurrency(voucherDiscount)}đ
                </Text>
              )}
            </View>
            <Text>›</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Voucher Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã giảm giá vận chuyển</Text>
          <TouchableOpacity
            onPress={() => setShowShippingVoucherModal(true)}
            style={styles.voucherButton}
          >
            <Text style={styles.voucherIcon}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.voucherLabel}>
                {selectedShippingVoucher ? selectedShippingVoucher.code : 'Chọn mã freeship'}
              </Text>
              {selectedShippingVoucher && (
                <Text style={styles.voucherDiscount}>
                  Tiết kiệm {formatCurrency(shippingVoucherDiscount)}đ
                </Text>
              )}
            </View>
            <Text>›</Text>
          </TouchableOpacity>
          {shippingVoucherDiscount > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>✓ Đã tiết kiệm {formatCurrency(shippingVoucherDiscount)}đ</Text>
            </View>
          )}
        </View>

        {/* Points Usage Section */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => setUsePoints(!usePoints)}
            style={styles.pointsOption}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, usePoints && styles.checkboxChecked]}>
              {usePoints && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointsLabel}>Dùng 200 điểm = 20.000đ</Text>
              <Text style={styles.pointsBalance}>Số dư: 2.500 điểm</Text>
            </View>
            <Text style={{ color: '#999' }}>{usePoints ? 'Đã chọn' : 'Chọn'}</Text>
          </TouchableOpacity>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú cho người bán</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Thêm ghi chú (tùy chọn)..."
            placeholderTextColor="#ccc"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.notesHelper}>
            Ghi chú sẽ được gửi đến người bán hàng để cải thiện trải nghiệm mua sắm của bạn
          </Text>
        </View>

        {/* Final Summary */}
        <View style={styles.finalSummary}>
          <View style={styles.finalSummaryRow}>
            <Text style={styles.finalLabel}>Tổng thanh toán</Text>
            <Text style={styles.finalPrice}>{formatCurrency(total)}đ</Text>
          </View>
          {savedAmount > 0 && (
            <View style={styles.savingsInfo}>
              <Text style={styles.savingsInfoText}>Bạn đã tiết kiệm {formatCurrency(savedAmount)}đ</Text>
            </View>
          )}
          <Text style={styles.termsText}>Bằng việc đặt hàng bạn đồng ý với điều khoản của cửa hàng</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Tổng</Text>
          <Text style={styles.bottomPrice}>{formatCurrency(total)}đ</Text>
        </View>
        <TouchableOpacity onPress={handlePlaceOrder} disabled={isLoading} activeOpacity={0.9}>
          <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 10 }}>
            <View style={{ paddingVertical: 12, paddingHorizontal: 28, minWidth: 140, alignItems: 'center' }}>
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.checkoutButtonText, { fontWeight: '900' }]}>Đặt hàng</Text>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Voucher Modal */}
      <Modal visible={showVoucherModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn voucher</Text>
              <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={vouchers}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedVoucher(item);
                    setShowVoucherModal(false);
                  }}
                  style={styles.voucherItem}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voucherItemCode}>{item.code}</Text>
                    {item.description && (
                      <Text style={styles.voucherItemDescription}>{item.description}</Text>
                    )}
                  </View>
                  <Text style={styles.voucherItemDiscount}>
                    {item.type === 'fixed'
                      ? `-${formatCurrency(item.discount)}đ`
                      : `-${item.discount}%`}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Shipping Voucher Modal */}
      <Modal visible={showShippingVoucherModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn mã freeship</Text>
              <TouchableOpacity onPress={() => setShowShippingVoucherModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={shippingVouchers}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedShippingVoucher(item);
                    setShowShippingVoucherModal(false);
                  }}
                  style={styles.voucherItem}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voucherItemCode}>{item.code}</Text>
                    {item.description && (
                      <Text style={styles.voucherItemDescription}>{item.description}</Text>
                    )}
                  </View>
                  <Text style={styles.voucherItemDiscount}>
                    {item.type === 'fixed'
                      ? `-${formatCurrency(item.discount)}đ`
                      : `Miễn phí`}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Bank Transfer Modal (QR) */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chuyển khoản ngân hàng</Text>
              <TouchableOpacity onPress={() => setShowBankModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20, alignItems: 'center' }}>
              {bankPaymentRef ? (
                <QRCode
                  value={JSON.stringify({
                    ref: bankPaymentRef,
                    amount: total,
                    account: '0123456789',
                    bank: 'NGUYEN GIAU BANK',
                    beneficiary: 'NguyenGiau Shop',
                  })}
                  size={220}
                />
              ) : (
                <ActivityIndicator size="large" />
              )}
              <Text style={{ fontSize: 14, color: '#333', fontWeight: '600', marginBottom: 6 }}>Quét mã QR để chuyển khoản</Text>
              <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 14 }}>Sử dụng ứng dụng ngân hàng của bạn để quét mã và chuyển tiền vào tài khoản cửa hàng.</Text>
              <Text style={{ fontSize: 13, color: '#444', fontWeight: '700', marginBottom: 12 }}>Số tiền cần chuyển: {formatCurrency(total)}đ</Text>
              <TouchableOpacity onPress={verifyBankPayment} style={[styles.checkoutButton, { minWidth: 180 }]} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.checkoutButtonText}>Tôi đã chuyển tiền</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  addressBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  addressPhone: {
    fontSize: 12,
    color: '#666',
  },
  addressText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  changeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: AppColors.primary,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffe0e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primary,
    borderStyle: 'dashed',
  },
  addAddressIcon: {
    fontSize: 18,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
  radioOptionSelected: {
    backgroundColor: '#ffe0e8',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: AppColors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  optionPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ffe0e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImageText: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 11,
    color: '#999',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  voucherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    gap: 12,
  },
  voucherIcon: {
    fontSize: 20,
  },
  voucherLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  voucherDiscount: {
    fontSize: 11,
    color: AppColors.primary,
    marginTop: 2,
  },
  pointsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pointsBalance: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  notesInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    justifyContent: 'flex-start',
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  notesHelper: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  notesPlaceholder: {
    fontSize: 12,
    color: '#ccc',
  },
  finalSummary: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  finalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  finalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  finalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  termsText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  termsLink: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  checkoutButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  continueShoppingBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
  },
  voucherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  voucherItemCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  voucherItemDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  voucherItemDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  savingsBadge: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f9f7',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  savingsInfo: {
    marginVertical: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f9f7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  savingsInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
});


