import { AppColors } from '@/constants/theme';
import useDeviceLocation from '@/hooks/useDeviceLocation';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Edit3,
  Globe,
  Heart,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Package,
  Settings,
  Ticket,
  Truck,
  User,
  XCircle
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserProfileScreen() {
  const router = useRouter();
  const { address: detectedAddress, loading: locationLoading } = useDeviceLocation();

  const [userInfo] = useState({
    fullName: 'Nguyễn Giao',
    email: 'nguyengiao@email.com',
    membership: 'Gold Member',
    points: 2500,
    avatar: null, // Có thể thay bằng URI ảnh thực tế
  });

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn thoát tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', onPress: () => router.replace('/auth/login'), style: 'destructive' },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient 
        colors={[AppColors.primary, AppColors.primaryLight]} 
        style={styles.header}
      >
        <View style={styles.navBar}>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
          <View style={styles.navIcons}>
            <TouchableOpacity style={styles.iconBtn}><Bell size={22} color="white" /></TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => router.push('/user/edit-profile')}
            >
              <Settings size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Card lồng trong Header */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NG</Text>
            </View>
            <TouchableOpacity 
              style={styles.editBadge} 
              onPress={() => router.push('/user/edit-profile')}
            >
              <Edit3 size={14} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo.fullName}</Text>
            <View style={styles.memberBadge}>
              <Text style={styles.memberText}>{userInfo.membership} • {userInfo.points} pts</Text>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={12} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationLoading ? 'Đang định vị...' : (detectedAddress || 'Chưa cập nhật vị trí')}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats / Actions */}
      <View style={styles.quickActions}>
        <ActionItem icon={<CreditCard size={22} color="#4ECDC4" />} label="Ví tiền" />
        <ActionItem icon={<Ticket size={22} color="#FFD93D" />} label="Ưu đãi" />
        <ActionItem icon={<Heart size={22} color="#FF6B6B" />} label="Yêu thích" />
        <ActionItem icon={<Package size={22} color="#6C5CE7" />} label="Đã mua" />
      </View>

      {/* Order Tracking */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Theo dõi đơn hàng</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
        </View>
        <View style={styles.orderStatusGrid}>
          <StatusItem icon={<Package size={24} color="#555" />} label="Chờ xử lý" count={2} />
          <StatusItem icon={<Truck size={24} color="#555" />} label="Đang giao" count={3} />
          <StatusItem icon={<CheckCircle size={24} color="#555" />} label="Hoàn thành" count={15} />
          <StatusItem icon={<XCircle size={24} color="#555" />} label="Đã hủy" count={0} />
        </View>
      </View>

      {/* Menu List - Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản & Bảo mật</Text>
        <MenuItem icon={<User size={20} color={AppColors.primary} />} title="Thông tin cá nhân" route="/user/edit-profile" />
        <MenuItem icon={<MapPin size={20} color={AppColors.primary} />} title="Địa chỉ giao hàng" route="/user/address" />
        <MenuItem icon={<Lock size={20} color={AppColors.primary} />} title="Đổi mật khẩu" route="/user/address" />
      </View>

      {/* Menu List - Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt hệ thống</Text>
        <MenuItem icon={<Globe size={20} color="#555" />} title="Ngôn ngữ" value="Tiếng Việt" />
        <MenuItem icon={<Moon size={20} color="#555" />} title="Chế độ tối" value="Tắt" />
        <MenuItem icon={<HelpCircle size={20} color="#555" />} title="Trung tâm hỗ trợ" />
        <MenuItem icon={<Info size={20} color="#555" />} title="Phiên bản" value="v2.1.0" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#FF5252" />
        <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Sub-components để code gọn sạch hơn
const ActionItem = ({ icon, label }: { icon: any, label: string }) => (
  <TouchableOpacity style={styles.actionItem}>
    <View style={styles.actionIconWrapper}>{icon}</View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const StatusItem = ({ icon, label, count }: { icon: any, label: string, count: number }) => (
  <View style={styles.statusItem}>
    <View>
      {icon}
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </View>
    <Text style={styles.statusLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ icon, title, value, route }: any) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={() => route && router.push(route)}>
      <View style={styles.menuIconWrapper}>{icon}</View>
      <Text style={styles.menuTitle}>{title}</Text>
      {value ? <Text style={styles.menuValue}>{value}</Text> : <ChevronRight size={18} color="#CCC" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white' },
  navIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    position: 'absolute',
    bottom: -50,
    left: 20,
    right: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFB347', padding: 5, borderRadius: 10, borderWidth: 2, borderColor: 'white' },
  
  userInfo: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#2D3436' },
  memberBadge: { backgroundColor: '#FFF9E6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 5, borderWidth: 1, borderColor: '#FFEAA7' },
  memberText: { fontSize: 11, color: '#F39C12', fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText: { fontSize: 12, color: '#636E72', flex: 1 },

  quickActions: { flexDirection: 'row', marginTop: 70, paddingHorizontal: 20, justifyContent: 'space-between' },
  actionItem: { alignItems: 'center', gap: 8 },
  actionIconWrapper: { width: 55, height: 55, backgroundColor: 'white', borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowOpacity: 0.05 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#636E72' },

  section: { backgroundColor: 'white', marginTop: 20, marginHorizontal: 20, borderRadius: 20, padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  seeAll: { fontSize: 13, color: AppColors.primary, fontWeight: '600' },

  orderStatusGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statusItem: { alignItems: 'center', gap: 8 },
  statusLabel: { fontSize: 11, color: '#636E72', fontWeight: '500' },
  badge: { position: 'absolute', top: -5, right: -10, backgroundColor: '#FF7675', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'white' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F2F6' },
  menuIconWrapper: { width: 35 },
  menuTitle: { flex: 1, fontSize: 15, color: '#2D3436', fontWeight: '500' },
  menuValue: { fontSize: 14, color: '#B2BEC3' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 30, paddingVertical: 15, marginHorizontal: 20, backgroundColor: '#FFF5F5', borderRadius: 15, borderWidth: 1, borderColor: '#FFEBEB' },
  logoutText: { color: '#FF5252', fontWeight: '700', fontSize: 15 },
});