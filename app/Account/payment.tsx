import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { CreditCard, Plus, Trash2, X } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const bankAccounts = [
  { id: 1, bank: 'Vietcombank', account: '1234567890', holder: 'Nguyễn Giau', isDefault: true },
  { id: 2, bank: 'Techcombank', account: '9876543210', holder: 'Nguyễn Giau', isDefault: false },
];

export default function Payment() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE8ED', dark: '#1a1a1a' }}
      headerImage={
        <View style={styles.headerWrapper}>
          <ThemedText type="title" style={styles.headerTitle}>Phương thức thanh toán</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color="#ff6699" />
        </TouchableOpacity>

        {bankAccounts.map(account => (
          <ThemedView key={account.id} style={styles.accountCard}>
            <View style={styles.cardHeader}>
              <View style={styles.bankInfo}>
                <CreditCard size={32} color="#ff6699" />
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{account.bank}</ThemedText>
                  <ThemedText style={styles.accountNumber}>Tài khoản: {account.account}</ThemedText>
                </View>
              </View>
              {account.isDefault && (
                <ThemedText style={styles.defaultBadge}>Mặc định</ThemedText>
              )}
            </View>
            <ThemedText style={styles.holderName}>Chủ tài khoản: {account.holder}</ThemedText>
            <TouchableOpacity style={styles.deleteBtn}>
              <Trash2 size={16} color="#ff3333" />
              <ThemedText style={styles.deleteText}>Xóa</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color="#ff6699" />
          <ThemedText style={styles.addBtnText}>Liên kết tài khoản ngân hàng mới</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  headerTitle: {
    color: '#ff6699',
    fontFamily: Fonts.rounded,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE8ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  defaultBadge: {
    color: '#ff6699',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: '#FFE8ED',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  accountNumber: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  holderName: {
    color: '#666',
    fontSize: 13,
    marginBottom: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff3f3',
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  deleteText: {
    color: '#ff3333',
    fontSize: 12,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFE8ED',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  addBtnText: {
    color: '#ff6699',
    fontWeight: '700',
  },
});
