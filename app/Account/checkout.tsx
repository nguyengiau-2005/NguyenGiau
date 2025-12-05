import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { addOrder } = useOrders();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tất cả thông tin giao hàng');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // create order
      const created = addOrder(cart, 'Pending');
      clearCart();
      Alert.alert('Thành công', 'Đơn hàng đã được tạo!', [
        {
          text: 'Xem lịch sử',
          onPress: () => router.push('/Account/order-history'),
        },
        {
          text: 'Tiếp tục mua',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ff6699" />
        </TouchableOpacity>
        <ThemedText type="title" style={{ flex: 1, textAlign: 'center', marginRight: 24 }}>
          Thanh toán
        </ThemedText>
      </View>

      <ThemedView style={styles.content}>
        {/* Order Summary */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Tóm tắt đơn hàng
        </ThemedText>
        <ThemedView style={styles.summaryCard}>
          {cart.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              <ThemedText style={styles.itemPrice}>
                {item.qty} × {item.price.toLocaleString('vi-VN')} ₫
              </ThemedText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <ThemedText>Tạm tính:</ThemedText>
            <ThemedText>{subtotal.toLocaleString('vi-VN')} ₫</ThemedText>
          </View>
          <View style={styles.totalRow}>
            <ThemedText>Vận chuyển:</ThemedText>
            <ThemedText>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')} ₫`}</ThemedText>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <ThemedText type="defaultSemiBold">Tổng cộng:</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: '#ff6699', fontSize: 16 }}>
              {total.toLocaleString('vi-VN')} ₫
            </ThemedText>
          </View>
        </ThemedView>

        {/* Delivery Address */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Địa chỉ giao hàng
        </ThemedText>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Địa chỉ chi tiết"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />
        </View>
        <TouchableOpacity style={styles.quickLink}>
          <ThemedText style={styles.quickLinkText}>Quản lý địa chỉ</ThemedText>
        </TouchableOpacity>

        {/* Payment Method */}
        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { marginTop: 24 }]}>
          Phương thức thanh toán
        </ThemedText>
        <View style={styles.paymentNote}>
          <Wallet size={20} color="#ff6699" />
          <ThemedText style={styles.paymentText}>💳 Thanh toán khi nhận hàng (COD)</ThemedText>
        </View>
        <TouchableOpacity style={styles.quickLink}>
          <ThemedText style={styles.quickLinkText}>Quản lý phương thức thanh toán</ThemedText>
        </TouchableOpacity>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.placeOrderBtn, isLoading && styles.disabledBtn]}
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          <ThemedText style={styles.placeOrderText}>
            {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 12,
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 13,
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 12,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  quickLink: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFE8ED',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickLinkText: {
    color: '#ff6699',
    fontSize: 13,
    fontWeight: '600',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  paymentText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
  placeOrderBtn: {
    backgroundColor: '#ff6699',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
