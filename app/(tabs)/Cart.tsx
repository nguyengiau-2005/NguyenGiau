import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ShoppingCart as CartIcon, Trash2 } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Cart() {
  const { cart, removeFromCart, updateQty } = useCart();
  const router = useRouter();

  const increase = (id: number) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      updateQty(id, item.qty + 1);
    }
  };

  const decrease = (id: number) => {
    const item = cart.find(item => item.id === id);
    if (item && item.qty > 1) {
      updateQty(id, item.qty - 1);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cart.reduce((count, item) => count + item.qty, 0);

  if (!cart || cart.length === 0) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFDCE1', dark: '#242222' }}
        headerImage={
          <View style={{ alignItems: 'center' as const, paddingVertical: 30 }}>
            <CartIcon size={80} color="#ff6699" />
          </View>
        }
      >
        <ThemedView style={styles.emptyContainer}>
          <CartIcon size={100} color="#ff6699" style={{ opacity: 0.5, marginBottom: 20 }} />
          <ThemedText type="title" style={styles.emptyTitle}>
            Giỏ hàng trống
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Hãy thêm một số sản phẩm để tiếp tục mua sắm
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE8ED', dark: '#1a1a1a' }}
      headerImage={
        <View style={styles.headerWrapper}>
          <CartIcon size={60} color="#ff6699" />
          <ThemedText type="subtitle" style={styles.headerCount}>
            {itemCount} sản phẩm
          </ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Giỏ hàng của bạn
        </ThemedText>
      </ThemedView>

      {/* CART LIST */}
      <View style={styles.cartList}>
        {cart.map((item, index) => (
          <View key={item.id} style={styles.cartItemWrapper}>
            <ThemedView style={styles.cartItem}>
              <Image source={item.img} style={styles.image} />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={styles.itemName}>
                  {item.name}
                </ThemedText>
                <ThemedText style={styles.itemPrice}>
                  ₫{item.price.toLocaleString('vi-VN')}
                </ThemedText>

                {/* Quantity */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity onPress={() => decrease(item.id)} style={styles.qtyBtn}>
                    <ThemedText style={styles.qtyBtnText}>−</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.qtyText}>{item.qty}</ThemedText>
                  <TouchableOpacity onPress={() => increase(item.id)} style={styles.qtyBtn}>
                    <ThemedText style={styles.qtyBtnText}>+</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.subtotal}>
                    = ₫{(item.price * item.qty).toLocaleString('vi-VN')}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                <Trash2 size={18} color="#ff6699" />
              </TouchableOpacity>
            </ThemedView>
          </View>
        ))}
      </View>

      {/* TOTAL */}
      <ThemedView style={styles.totalBox}>
        <View>
          <ThemedText style={styles.totalLabel}>Tổng tiền</ThemedText>
          <ThemedText type="title" style={styles.totalPrice}>
            ₫{totalPrice.toLocaleString('vi-VN')}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => {
          // Navigate to Account tab first, then open checkout modal
          router.push('/Account/checkout');
        }}>
          <CartIcon size={20} color="#fff" />
          <ThemedText style={styles.checkoutText}>Thanh toán</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.rounded,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 14,
    paddingHorizontal: 20,
  },
  headerWrapper: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 40,
  },
  headerCount: {
    marginTop: 8,
    color: '#ff6699',
  },
  titleContainer: {
    alignItems: 'center' as const,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  cartList: {
    marginBottom: 20,
  },

  cartItemWrapper: {
    marginHorizontal: 12,
    marginVertical: 8,
  },

  cartItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginRight: 14,
  },

  itemName: {
    fontSize: 15,
    marginBottom: 4,
  },

  itemPrice: {
    color: '#ff6699',
    fontSize: 13,
    fontWeight: '700' as const,
    marginBottom: 8,
  },

  qtyContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },

  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE8ED',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  qtyBtnText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ff6699',
  },

  qtyText: {
    marginHorizontal: 6,
    fontSize: 15,
    fontWeight: '600' as const,
  },

  subtotal: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#666',
  },

  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE8ED',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  totalBox: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    marginHorizontal: 12,
    marginTop: 24,
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: '#FFE8ED',
    shadowColor: '#ff6699',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  totalLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },

  totalPrice: {
    color: '#ff6699',
    fontSize: 22,
    fontWeight: '700' as const,
  },

  checkoutBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: '#ff6699',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#ff6699',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  checkoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700' as const,
  },
});