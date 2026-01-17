import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Moon,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Truck,
  User,
  Wallet
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Lấy thông tin từ Context thật

  // Mockup data nếu user chưa có (để view đẹp khi dev)
  const displayUser = user || {
    full_name: 'Khách hàng',
    email: 'khachhang@example.com',
    points: 0,
    role: { value: 'User' }
  };

  const [orderStatus] = useState({
    pending: 2,
    shipping: 1,
    delivered: 15,
    cancelled: 0,
  });

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
           await logout();
           // AuthContext sẽ tự redirect, nhưng thêm dòng này cho chắc
           router.replace('/auth/login');
        },
      },
    ]);
  };

  // Component hiển thị item trong menu
  const MenuItem = ({ icon: Icon, title, value, onPress, isLast = false, color = '#333' }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.menuItem, isLast && styles.menuItemNoBorder]}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconBox, { backgroundColor: `${color}15` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <ChevronRight size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[AppColors.primary, AppColors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.topBar}>
            <Text style={styles.headerTitle}>Hồ sơ</Text>
            <View style={styles.topBarIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/user/edit-profile')}>
                <Settings size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Info Block */}
          <View style={styles.userInfoBlock}>
            <View style={styles.avatarContainer}>
              {/* Nếu có avatar thật thì dùng Image, ko thì dùng Text */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {displayUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBadge}>
                <Settings size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.userTextView}>
              <Text style={styles.userName}>{displayUser.full_name}</Text>
              <Text style={styles.userEmail}>{displayUser.email}</Text>
              <View style={styles.pointBadge}>
                <Text style={styles.pointText}>💎 {displayUser.points || 0} Points</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.bodyContainer}>
        
        {/* --- ĐƠN HÀNG (ORDER STATUS) --- */}
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Đơn hàng của tôi</Text>
                <TouchableOpacity onPress={() => router.push('/user/order-history')}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.orderStatusRow}>
                <TouchableOpacity style={styles.statusItem}>
                    <View style={styles.statusIconBadge}>
                        <Package size={24} color={AppColors.primary} />
                        {orderStatus.pending > 0 && <View style={styles.badgeCount}><Text style={styles.badgeText}>{orderStatus.pending}</Text></View>}
                    </View>
                    <Text style={styles.statusLabel}>Chờ xử lý</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statusItem}>
                    <View style={styles.statusIconBadge}>
                        <Truck size={24} color={AppColors.primary} />
                        {orderStatus.shipping > 0 && <View style={styles.badgeCount}><Text style={styles.badgeText}>{orderStatus.shipping}</Text></View>}
                    </View>
                    <Text style={styles.statusLabel}>Đang giao</Text>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.statusItem}>
                    <View style={styles.statusIconBadge}>
                        <ShoppingBag size={24} color={AppColors.primary} />
                        <View style={styles.badgeCount}><Text style={styles.badgeText}>{orderStatus.delivered}</Text></View>
                    </View>
                    <Text style={styles.statusLabel}>Đánh giá</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statusItem}>
                    <View style={styles.statusIconBadge}>
                         {/* Icon trả hàng/hủy */}
                        <HelpCircle size={24} color={AppColors.primary} />
                    </View>
                    <Text style={styles.statusLabel}>Đổi trả</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* --- VÍ & TIỆN ÍCH --- */}
        <View style={styles.sectionCard}>
            <View style={styles.gridMenu}>
                <TouchableOpacity style={styles.gridItem}>
                    <Wallet size={26} color="#FF9F43" />
                    <Text style={styles.gridLabel}>Ví tiền</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.gridItem}>
                    <Ticket size={26} color="#EE5A24" />
                    <Text style={styles.gridLabel}>Vouchers</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.gridItem}>
                    <Heart size={26} color="#FF6B6B" />
                    <Text style={styles.gridLabel}>Yêu thích</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.gridItem}>
                    <MapPin size={26} color="#2e86de" />
                    <Text style={styles.gridLabel}>Địa chỉ</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* --- CÀI ĐẶT TÀI KHOẢN --- */}
        <Text style={styles.groupTitle}>Tài khoản</Text>
        <View style={styles.menuGroup}>
            <MenuItem icon={User} title="Hồ sơ cá nhân" color={AppColors.primary} onPress={() => router.push('/user/edit-profile')} />
            <MenuItem icon={CreditCard} title="Thẻ & Ngân hàng" color="#10ac84" onPress={() => router.push('/user/payment')} />
            <MenuItem icon={MapPin} title="Sổ địa chỉ" color="#f368e0" onPress={() => router.push('/user/address')} isLast />
        </View>

        {/* --- CÀI ĐẶT ỨNG DỤNG --- */}
        <Text style={styles.groupTitle}>Cài đặt & Hỗ trợ</Text>
        <View style={styles.menuGroup}>
            <MenuItem icon={Globe} title="Ngôn ngữ" value="Tiếng Việt" color="#54a0ff" />
            <MenuItem icon={Moon} title="Giao diện tối" value="Tắt" color="#5f27cd" />
            <MenuItem icon={ShieldCheck} title="Chính sách bảo mật" color="#222f3e" />
            <MenuItem icon={HelpCircle} title="Trung tâm trợ giúp" color="#ff9f43" isLast />
        </View>

        {/* --- LOGOUT --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
        <View style={{height: 40}} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Màu nền kiểu iOS Grouped
  },
  // --- HEADER ---
  headerContainer: {
    marginBottom: 10,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.rounded,
    fontWeight: '700',
    color: '#FFF',
  },
  topBarIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconBtn: {
    padding: 5,
  },
  userInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  userTextView: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  pointBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pointText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 12,
  },

  // --- BODY ---
  bodyContainer: {
    paddingHorizontal: 16,
    marginTop: -20, // Kéo lên đè lên header
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  seeAllText: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '600',
  },
  
  // Order Status
  orderStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIconBadge: {
    position: 'relative',
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  badgeCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusLabel: {
    fontSize: 12,
    color: '#636e72',
    textAlign: 'center',
  },

  // Grid Menu
  gridMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },

  // --- MENU GROUP ---
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  menuValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 6,
  },

  // --- FOOTER ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#C7C7CC',
    fontSize: 12,
    marginBottom: 10,
  },
});