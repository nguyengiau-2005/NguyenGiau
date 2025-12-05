import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LogOut, MapPin, CreditCard, Edit3, Package } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Account() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFE8ED', dark: '#242222' }}
        headerImage={
          <View style={{ alignItems: 'center' as const, paddingVertical: 30 }}>
            <ThemedText type="title" style={{ color: '#ff6699' }}>Tài khoản</ThemedText>
          </View>
        }
      >
        <ThemedView style={styles.centerContainer}>
          <ThemedText type="title" style={styles.notLoginTitle}>
            Chưa đăng nhập
          </ThemedText>
          <ThemedText style={styles.notLoginText}>
            Vui lòng đăng nhập để xem thông tin cá nhân và lịch sử mua hàng
          </ThemedText>
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText style={styles.loginBtnText}>Đăng nhập</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signupBtn}
            onPress={() => router.push('/auth/signup')}
          >
            <ThemedText style={styles.signupBtnText}>Tạo tài khoản mới</ThemedText>
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
          <ThemedText type="title" style={styles.headerTitle}>Tài khoản của tôi</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity 
            onPress={() => router.push('edit-profile')}
            style={styles.avatarTouchable}
          >
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.editBadge}>
              <Edit3 size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <ThemedText type="defaultSemiBold" style={styles.userName}>
              {user.fullName}
            </ThemedText>
            <ThemedText style={styles.userEmail}>
              {user.email}
            </ThemedText>
            {user.phone && (
              <ThemedText style={styles.userPhone}>
                {user.phone}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <ThemedView style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('edit-profile')}
          >
            <Edit3 size={20} color="#ff6699" />
            <ThemedText style={styles.menuText}>Chỉnh sửa hồ sơ</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('address')}
          >
            <MapPin size={20} color="#ff6699" />
            <ThemedText style={styles.menuText}>Địa chỉ giao hàng</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('payment')}
          >
            <CreditCard size={20} color="#ff6699" />
            <ThemedText style={styles.menuText}>Phương thức thanh toán</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('order-history')}
          >
            <Package size={20} color="#ff6699" />
            <ThemedText style={styles.menuText}>Lịch sử mua hàng</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            router.replace('/auth/login');
          }}
        >
          <LogOut size={20} color="#fff" />
          <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  notLoginTitle: {
    fontFamily: Fonts.rounded,
    marginBottom: 12,
  },
  notLoginText: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  loginBtn: {
    backgroundColor: '#ff6699',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700' as const,
    fontSize: 16,
  },
  signupBtn: {
    backgroundColor: '#FFE8ED',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  signupBtnText: {
    color: '#ff6699',
    fontWeight: '700' as const,
    fontSize: 16,
  },
  headerWrapper: {
    alignItems: 'center' as const,
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
  profileCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarTouchable: {
    position: 'relative' as const,
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#ff6699',
  },
  editBadge: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6699',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  logoutBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#ff6699',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#ff6699',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700' as const,
    fontSize: 16,
  },
});
