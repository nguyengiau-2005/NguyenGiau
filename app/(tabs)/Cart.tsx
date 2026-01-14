import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import useDeviceLocation from '@/hooks/useDeviceLocation';
import { formatCurrency, formatPrice } from '@/utils/formatPrice';
import { useRouter } from 'expo-router';
import { ArrowLeft, Gift, Home, MapPin, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SHIPPING_FEE = 15000;
const DISCOUNT_VOUCHER = 50000;

export default function CartScreen() {
  const { cart, removeFromCart, updateQty, updateVolume, setSelectedCheckoutItems } = useCart();
  const router = useRouter();
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { address: detectedAddress, loading: locationLoading, fetchLocation } = useDeviceLocation();

  // Tính toán logic
  const selectedCartItems = useMemo(() => 
    cart.filter(item => selectedItems.includes(`${item.id}-${item.volume ?? '50ml'}`)), 
  [cart, selectedItems]);

  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * 1000) * item.qty, 0);
  const discount = selectedVoucher === 'SAVE50K' ? DISCOUNT_VOUCHER : 0;
  const shippingFee = (totalPrice > 500000 || selectedVoucher === 'FREESHIP' || totalPrice === 0) ? 0 : SHIPPING_FEE;
  const totalPayment = Math.max(0, totalPrice - discount + shippingFee);

  const toggleSelectItem = (key: string) => {
    setSelectedItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) setSelectedItems([]);
    else setSelectedItems(cart.map(item => `${item.id}-${item.volume ?? '50ml'}`));
  };

  if (!cart || cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingCart size={100} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptySubtitle}>Hãy chọn những món quà tuyệt vời cho chính mình nhé!</Text>
        <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.shopNowText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header tối giản */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <ArrowLeft size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <Text style={styles.headerSubtitle}>{cart.length} sản phẩm</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.headerIcon}>
          <Home size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Vị trí giao hàng */}
        <View style={styles.locationCard}>
          <MapPin size={18} color={AppColors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLoading ? 'Đang xác định...' : (detectedAddress || 'Chọn địa chỉ nhận hàng')}
          </Text>
          <TouchableOpacity onPress={fetchLocation}>
            <Text style={styles.changeText}>Thay đổi</Text>
          </TouchableOpacity>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.itemList}>
          {cart.map((item) => {
            const key = `${item.id}-${item.volume ?? '50ml'}`;
            const isSelected = selectedItems.includes(key);
            return (
              <View key={key} style={[styles.itemCard, isSelected && styles.itemCardSelected]}>
                <TouchableOpacity 
                  style={[styles.checkbox, isSelected && styles.checkboxActive]} 
                  onPress={() => toggleSelectItem(key)}
                >
                  {isSelected && <View style={styles.checkInner} />}
                </TouchableOpacity>

                <Image 
                  source={typeof item.img === 'string' ? { uri: item.img } : ('url' in item.img ? { uri: item.img.url } : item.img)} 
                  style={styles.itemImage} 
                />

                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id, item.volume)}>
                      <Trash2 size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.itemVolume}>{item.volume ?? '50ml'}</Text>
                  
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}đ</Text>
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity onPress={() => updateQty(item.id, Math.max(1, item.qty - 1), item.volume)} style={styles.qtyBtn}>
                        <Minus size={14} color="#555" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.qty}</Text>
                      <TouchableOpacity onPress={() => updateQty(item.id, item.qty + 1, item.volume)} style={styles.qtyBtn}>
                        <Plus size={14} color="#555" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Voucher & Summary */}
        <View style={styles.summarySection}>
          <TouchableOpacity 
            style={styles.voucherBtn} 
            onPress={() => {
              Alert.alert('Ưu đãi', 'Chọn mã giảm giá phù hợp', [
                { text: 'SAVE50K', onPress: () => setSelectedVoucher('SAVE50K') },
                { text: 'Miễn phí vận chuyển', onPress: () => setSelectedVoucher('FREESHIP') },
                { text: 'Bỏ chọn', style: 'destructive', onPress: () => setSelectedVoucher(null) },
              ]);
            }}
          >
            <View style={styles.row}>
              <Gift size={20} color={AppColors.primary} />
              <Text style={styles.voucherLabel}>{selectedVoucher || 'Chọn hoặc nhập mã giảm giá'}</Text>
            </View>
            <Text style={styles.changeText}>Chọn mã</Text>
          </TouchableOpacity>

          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Tạm tính</Text>
              <Text style={styles.billValue}>{formatCurrency(totalPrice)}đ</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Phí vận chuyển</Text>
              <Text style={styles.billValue}>{shippingFee === 0 ? 'Miễn phí' : `${formatCurrency(shippingFee)}đ`}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Giảm giá</Text>
                <Text style={[styles.billValue, { color: '#27ae60' }]}>-{formatCurrency(discount)}đ</Text>
              </View>
            )}
            <View style={[styles.billRow, styles.billTotal]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalPayment)}đ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer thanh toán cố định */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.row} onPress={toggleSelectAll}>
          <View style={[styles.checkbox, selectedItems.length === cart.length && styles.checkboxActive]}>
            {selectedItems.length === cart.length && <View style={styles.checkInner} />}
          </View>
          <Text style={styles.selectAllText}>Tất cả</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.checkoutBtn, selectedItems.length === 0 && styles.checkoutDisabled]}
          disabled={selectedItems.length === 0}
          onPress={() => {
            setSelectedCheckoutItems(selectedCartItems);
            router.push('/user/checkout');
          }}
        >
          <Text style={styles.checkoutText}>Thanh toán ({selectedItems.length})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  headerIcon: { padding: 8, borderRadius: 12, backgroundColor: '#F5F5F5' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 12, color: '#999' },

  locationCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FFF', margin: 16, borderRadius: 16, gap: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  locationText: { flex: 1, fontSize: 13, color: '#444' },
  changeText: { fontSize: 13, fontWeight: '700', color: AppColors.primary },

  itemList: { paddingHorizontal: 16 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'transparent' },
  itemCardSelected: { borderColor: AppColors.primary + '30', backgroundColor: AppColors.primary + '05' },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F9F9F9' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  itemVolume: { fontSize: 12, color: '#AAA', marginVertical: 4 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: AppColors.primary },

  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, padding: 4 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8 },
  qtyText: { paddingHorizontal: 12, fontSize: 14, fontWeight: '700' },

  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#DDD', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { borderColor: AppColors.primary, backgroundColor: AppColors.primary },
  checkInner: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#FFF' },

  summarySection: { paddingHorizontal: 16, marginTop: 10 },
  voucherBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voucherLabel: { fontSize: 14, color: '#555' },

  billCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 20 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#777' },
  billValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  billTotal: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15, marginTop: 5 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: '800', color: AppColors.primary },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  selectAllText: { fontSize: 14, fontWeight: '600', color: '#555' },
  checkoutBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 16, minWidth: 180, alignItems: 'center' },
  checkoutDisabled: { backgroundColor: '#EEE' },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#333', marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  shopNowBtn: { marginTop: 30, backgroundColor: AppColors.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  shopNowText: { color: '#FFF', fontWeight: '700' },
});