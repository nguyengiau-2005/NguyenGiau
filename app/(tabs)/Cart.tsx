import { AppColors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import useDeviceLocation from '@/hooks/useDeviceLocation';
import { formatCurrency, formatPrice } from '@/utils/formatPrice';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Gift, Home, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SHIPPING_FEE = 15000;
const DISCOUNT_VOUCHER = 50000;

export default function CartScreen() {
  const { cart, removeFromCart, updateQty, updateVolume, setSelectedCheckoutItems } = useCart();
  const { addFavorite } = useFavorites();
  const router = useRouter();
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const increase = (id: number, volume?: string) => {
    const item = cart.find(item => item.id === id && (item.volume ?? '50ml') === (volume ?? '50ml'));
    if (item) {
      updateQty(id, item.qty + 1, item.volume);
    }
  };

  const decrease = (id: number, volume?: string) => {
    const item = cart.find(item => item.id === id && (item.volume ?? '50ml') === (volume ?? '50ml'));
    if (item && item.qty > 1) {
      updateQty(id, item.qty - 1, item.volume);
    }
  };

  const toggleSelectItem = (key: string) => {
    if (selectedItems.includes(key)) {
      setSelectedItems(selectedItems.filter(itemKey => itemKey !== key));
    } else {
      setSelectedItems([...selectedItems, key]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(cart.map(item => `${item.id}-${item.volume ?? '50ml'}`));
      setSelectAll(true);
    }
  };

  const selectedCartItems = cart.filter(item => selectedItems.includes(`${item.id}-${item.volume ?? '50ml'}`));
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * 1000) * item.qty, 0);
  const discount = selectedVoucher ? (DISCOUNT_VOUCHER) : 0;
  const shippingFee = totalPrice > 500000 ? 0 : SHIPPING_FEE;
  const totalPayment = totalPrice - discount + shippingFee;
  const itemCount = cart.reduce((count, item) => count + item.qty, 0);
  const { address: detectedAddress, loading: locationLoading, fetchLocation } = useDeviceLocation();

  // Empty State
  if (!cart || cart.length === 0) {
    return (
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Giỏ Hàng</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)')}>
              <Home size={24} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <ShoppingCart size={80} color="#ffffff60" strokeWidth={1} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 20 }}>Giỏ hàng của bạn đang trống</Text>
          <Text style={{ fontSize: 14, color: '#ffffff80', marginTop: 8, textAlign: 'center' }}>Hãy thêm một số sản phẩm để tiếp tục mua sắm</Text>
          <TouchableOpacity 
            style={{ marginTop: 32, backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: AppColors.primary }}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      {/* ====== HEADER ====== */}
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryLight]}
        style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Giỏ Hàng</Text>
            <Text style={{ fontSize: 11, color: '#ffffff80', marginTop: 2 }}>{itemCount} sản phẩm</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Home size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ====== CART ITEMS ====== */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {cart.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => router.push(`/product/${item.id}`)}
              style={{ marginBottom: 12, backgroundColor: AppColors.surface, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}
            >
              <View style={{ flexDirection: 'row', padding: 12, gap: 12, alignItems: 'center' }}>
                {/* Checkbox */}
                  <TouchableOpacity 
                  style={{ width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' }}
                  onPress={(e) => { e.stopPropagation?.(); toggleSelectItem(`${item.id}-${item.volume ?? '50ml'}`); }}
                >
                  {selectedItems.includes(`${item.id}-${item.volume ?? '50ml'}`) && (
                    <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: AppColors.primary }} />
                  )}
                </TouchableOpacity>

                {/* Product Image */}
                <Image source={typeof item.img === 'string' ? { uri: item.img } : ('url' in item.img ? { uri: item.img.url } : item.img)} style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: '#fafafa' }} />

                {/* Product Info */}
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: AppColors.textPrimary }} numberOfLines={2}>{item.name}</Text>
                    <Text style={{ marginTop: 6, fontSize: 13, fontWeight: '700', color: AppColors.primary }}>{formatPrice(item.price)}đ</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity 
                        style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' }}
                        onPress={(e) => { e.stopPropagation?.(); decrease(item.id, item.volume); }}
                      >
                        <Minus size={14} color={AppColors.primary} strokeWidth={2} />
                      </TouchableOpacity>
                      <Text style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: '600' }}>{item.qty}</Text>
                      <TouchableOpacity 
                        style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' }}
                        onPress={(e) => { e.stopPropagation?.(); increase(item.id, item.volume); }}
                      >
                        <Plus size={14} color={AppColors.primary} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {/* Volume selector */}
                      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: '#eee' }}>
                        {['50ml', '100ml', '250ml'].map((v) => (
                          <TouchableOpacity key={v} onPress={(e) => { e.stopPropagation?.(); updateVolume(item.id, v, item.volume); }} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: (item.volume ?? '50ml') === v ? AppColors.primary : 'transparent' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: (item.volume ?? '50ml') === v ? '#fff' : AppColors.textPrimary }}>{v}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); removeFromCart(item.id, item.volume); }} style={{ padding: 6 }}>
                        <Trash2 size={18} color={AppColors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ====== VOUCHER SECTION ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: AppColors.surface, padding: 14, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
            onPress={() => {
              Alert.alert('Chọn Voucher', 'Các mã giảm giá có sẵn', [
                { text: 'SAVE50K (-50.000đ)', onPress: () => setSelectedVoucher('SAVE50K') },
                { text: 'FREESHIP (Miễn ship)', onPress: () => setSelectedVoucher('FREESHIP') },
                { text: 'Hủy', onPress: () => setSelectedVoucher(null) },
              ]);
            }}
          >
            <Gift size={20} color={AppColors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: AppColors.textPrimary }}>Chọn Voucher</Text>
              <Text style={{ fontSize: 11, color: AppColors.textMuted, marginTop: 2 }}>{selectedVoucher || 'Không có mã nào được chọn'}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: AppColors.primary }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ====== SHIPPING INFO ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 }}>Thông tin giao hàng</Text>
          <View style={{ backgroundColor: AppColors.surface, padding: 14, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>📍 Giao tới: {locationLoading ? 'Đang lấy địa chỉ...' : (detectedAddress ?? 'Nhà riêng')}</Text>
            <TouchableOpacity onPress={fetchLocation}><Text style={{ color: AppColors.primary, marginTop: 6 }}>Cập nhật vị trí</Text></TouchableOpacity>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>🚚 Phương thức: Giao hàng tiêu chuẩn</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>📅 Dự kiến: 2-3 ngày làm việc</Text>
          </View>
        </View>

        {/* ====== ORDER SUMMARY ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 200 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 10 }}>Tổng kết thanh toán</Text>
          <View style={{ backgroundColor: AppColors.surface, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, color: AppColors.textSecondary }}>Tổng tiền hàng</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: AppColors.textPrimary }}>{formatCurrency(totalPrice)}đ</Text>
            </View>
            {discount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: '#666' }}>Giảm giá</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#27ae60' }}>-{formatCurrency(discount)}đ</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                <Text style={{ fontSize: 13, color: AppColors.textSecondary }}>Phí vận chuyển</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: shippingFee === 0 ? '#27ae60' : AppColors.textPrimary }}>
                {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee) + 'đ'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: AppColors.textPrimary }}>Tổng thanh toán</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: AppColors.primary }}>{formatCurrency(totalPayment)}đ</Text>
            </View>
            {discount > 0 && (
              <Text style={{ fontSize: 11, color: '#27ae60', marginTop: 10 }}>🎉 Bạn tiết kiệm được {formatCurrency(discount)}đ</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ====== BOTTOM CHECKOUT BAR ====== */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: AppColors.surface, borderTopWidth: 1, borderTopColor: AppColors.divider, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            onPress={toggleSelectAll}
          >
            <View 
              style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' }}
            >
              {selectAll && <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: AppColors.primary }} />}
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: AppColors.textPrimary }}>Chọn tất cả</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 15, fontWeight: '700', color: AppColors.primary }}>{selectedItems.length > 0 ? formatCurrency(totalPayment) : '0'}đ</Text>
        </View>

        <TouchableOpacity 
            style={{ 
            backgroundColor: selectedItems.length > 0 ? AppColors.primary : '#ccc', 
            paddingVertical: 14, 
            borderRadius: 10, 
            alignItems: 'center' 
          }}
          onPress={() => {
            if (selectedItems.length === 0) {
              Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 sản phẩm');
              return;
            }
            Alert.alert('Thanh toán', `Thanh toán ${formatCurrency(totalPayment)}đ?`, [
              { text: 'Hủy' },
              { 
                text: 'Xác nhận', 
                onPress: () => {
                  setSelectedCheckoutItems(selectedCartItems);
                  router.push('/user/checkout' as any);
                }
              }
            ]);
          }}
          disabled={selectedItems.length === 0}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

