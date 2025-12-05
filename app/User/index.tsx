import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { ChevronRight, CreditCard, Edit3, History, LogOut, MapPin, User, Wallet } from 'lucide-react-native';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Account() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFE8ED', dark: '#1a1a1a' }}
        headerImage={
          <View style={styles.headerWrapper}>
            <User size={60} color="#ff6699" />
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Tài Khoản
            </ThemedText>
          </View>
        }
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{ marginBottom: 12 }}>Bạn chưa đăng nhập</ThemedText>
          <ThemedText style={{ marginBottom: 20 }}>Vui lòng đăng nhập hoặc đăng ký để tiếp tục.</ThemedText>

          <TouchableOpacity style={[styles.logoutBtn, { marginBottom: 12 }]} onPress={() => router.push('/auth/login')}>
            <ThemedText style={styles.logoutText}>Đăng nhập</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ff6699' }]} onPress={() => router.push('/auth/signup')}>
            <ThemedText style={{ color: '#ff6699', fontWeight: '700' }}>Đăng ký</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE8ED', dark: '#1a1a1a' }}
      headerImage={
        <View style={styles.headerWrapper}>
          <TouchableOpacity onPress={() => router.push('/Account/edit-profile')} style={styles.avatarTouchable}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.editBadge}>
              <Edit3 size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            {user.fullName}
          </ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <ThemedText style={styles.emailIcon}>@</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {user.email}
              </ThemedText>
            </View>
          </View>

          {user.phone && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <ThemedText style={styles.phoneIcon}>☎</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.infoLabel}>Số điện thoại</ThemedText>
                  <ThemedText type="defaultSemiBold">{user.phone}</ThemedText>
                </View>
              </View>
            </>
          )}
        </ThemedView>

        <ThemedText style={styles.menuTitle}>Quản lý tài khoản</ThemedText>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/Account/edit-profile')}
        >
          <View style={styles.menuIcon}>
            <Edit3 size={20} color="#ff6699" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Chỉnh sửa hồ sơ</ThemedText>
            <ThemedText style={styles.menuSubtitle}>Cập nhật thông tin cá nhân</ThemedText>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/Account/address')}
        >
          <View style={styles.menuIcon}>
            <MapPin size={20} color="#ff6699" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Địa chỉ giao hàng</ThemedText>
            <ThemedText style={styles.menuSubtitle}>Quản lý địa chỉ của bạn</ThemedText>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/Account/payment')}
        >
          <View style={styles.menuIcon}>
            <Wallet size={20} color="#ff6699" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Phương thức thanh toán</ThemedText>
            <ThemedText style={styles.menuSubtitle}>Liên kết ngân hàng & ví</ThemedText>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/Account/order-history')}
        >
          <View style={styles.menuIcon}>
            <History size={20} color="#ff6699" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Lịch sử mua hàng</ThemedText>
            <ThemedText style={styles.menuSubtitle}>Xem các đơn hàng của bạn</ThemedText>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/Account/checkout')}
        >
          <View style={styles.menuIcon}>
            <CreditCard size={20} color="#ff6699" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Thanh toán</ThemedText>
            <ThemedText style={styles.menuSubtitle}>Xem giỏ hàng và thanh toán</ThemedText>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#fff" />
          <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    alignItems: 'center' as const,
    paddingVertical: 40,
    gap: 12,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6699',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitle: {
    color: '#ff6699',
    fontFamily: Fonts.rounded,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFE8ED',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emailIcon: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#ff6699',
  },
  phoneIcon: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#ff6699',
  },
  infoLabel: {
    color: '#999',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  menuTitle: {
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFE8ED',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  menuSubtitle: {
    color: '#777',
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 12,
    backgroundColor: '#ff6699',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row' as const,
    gap: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700' as const,
  },
});
