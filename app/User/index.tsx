import { AppColors } from '@/constants/theme';
import useDeviceLocation from '@/hooks/useDeviceLocation';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  membership: 'bronze' | 'silver' | 'gold';
  points: number;
  avatar?: string;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const [userInfo] = useState<UserInfo>({
    id: 'USR001',
    fullName: 'Nguyễn Giao',
    email: 'nguyengiao@email.com',
    phone: '+84 123 456 789',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    membership: 'gold',
    points: 2500,
  });

  const [orderStatus] = useState({
    pending: 2,
    picking: 1,
    shipping: 3,
    delivered: 15,
    cancelled: 0,
  });

  const membershipColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', onPress: () => {}, style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: () => {
            // Handle logout
            router.replace('/auth/login' as any);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const quickActionButtons = [
    { label: 'Đơn hàng', icon: '📦', route: '/user/order-history', color: '#FF6B6B' },
    { label: 'Ví tiền', icon: '💳', route: '/user/payment', color: '#4ECDC4' },
    { label: 'Vouchers', icon: '🎟️', route: '/user/address', color: '#FFE66D' },
    { label: 'Yêu thích', icon: '❤️', route: '/user/address', color: '#FF85A2' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Gradient */}
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push('/user/edit-profile' as any)}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)' as any)}>
              <Text style={{ fontSize: 20 }}>🛒</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Tài khoản của tôi</Text>
        </View>
      </LinearGradient>

      {/* User Info Card */}
      <View style={styles.userInfoCard}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={() => router.push('/user/edit-profile' as any)}
            style={styles.avatarWrapper}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NG</Text>
            </View>
            <View style={styles.editBadge}>
              <Text>✏️</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.fullName}>{userInfo.fullName}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
          {/* show detected device address as suggestion */}
          {(() => {
            const { address: detectedAddress, loading: locationLoading, fetchLocation } = useDeviceLocation();
            return detectedAddress ? (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Vị trí hiện tại: {locationLoading ? 'Đang lấy...' : detectedAddress}</Text>
                <TouchableOpacity onPress={() => router.push('/user/address' as any)}>
                  <Text style={{ color: AppColors.primary, marginTop: 6 }}>Cập nhật địa chỉ</Text>
                </TouchableOpacity>
              </View>
            ) : null;
          })()}
          <View style={[styles.membershipBadge, { backgroundColor: membershipColors[userInfo.membership] }]}>
            <Text style={styles.membershipText}>
              {userInfo.membership.charAt(0).toUpperCase() + userInfo.membership.slice(1)} • {userInfo.points} pts
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsGrid}>
          {quickActionButtons.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(btn.route as any)}
              style={[styles.quickActionBtn, { backgroundColor: btn.color }]}
            >
              <Text style={styles.quickActionIcon}>{btn.icon}</Text>
              <Text style={styles.quickActionLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Order Status */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
        <View style={styles.statusGrid}>
          {[
            { label: 'Chờ xử lý', count: orderStatus.pending, color: '#FF9999' },
            { label: 'Đang chọn', count: orderStatus.picking, color: '#FFB366' },
            { label: 'Đang giao', count: orderStatus.shipping, color: '#FFD699' },
            { label: 'Đã giao', count: orderStatus.delivered, color: '#99FF99' },
            { label: 'Hủy', count: orderStatus.cancelled, color: '#FF9999' },
          ].map((status, idx) => (
            <View key={idx} style={[styles.statusBox, { backgroundColor: status.color }]}>
              <Text style={styles.statusCount}>{status.count}</Text>
              <Text style={styles.statusLabel}>{status.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Account Management */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
        {[
          { title: 'Chỉnh sửa hồ sơ', icon: '👤', route: '/user/edit-profile' },
          { title: 'Đổi mật khẩu', icon: '🔐', route: '/user/address' },
          { title: 'Địa chỉ giao hàng', icon: '📍', route: '/user/address' },
          { title: 'Phương thức thanh toán', icon: '💳', route: '/user/payment' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(item.route as any)}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Shopping Activity */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hoạt động mua sắm</Text>
        {[
          { title: 'Lịch sử đơn hàng', icon: '📋', route: '/user/order-history' },
          { title: 'Đánh giá của tôi', icon: '⭐', route: '/user/address' },
          { title: 'Sản phẩm xem gần đây', icon: '👀', route: '/user/address' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(item.route as any)}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Support */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hỗ trợ</Text>
        {[
          { title: 'Trung tâm trợ giúp', icon: '❓', route: '/user/address' },
          { title: 'Câu hỏi thường gặp', icon: '❔', route: '/user/address' },
          { title: 'Chính sách hoàn trả', icon: '🔄', route: '/user/address' },
          { title: 'Điều khoản dịch vụ', icon: '📄', route: '/user/address' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(item.route as any)}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Settings */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
        {[
          { title: 'Ngôn ngữ', icon: '🌐', route: '/user/address', value: 'Tiếng Việt' },
          { title: 'Chế độ tối', icon: '🌙', route: '/user/address', value: 'Tắt' },
          { title: 'Phiên bản', icon: 'ℹ️', route: '/user/address', value: 'v1.0.0' },
          { title: 'Gửi phản hồi', icon: '📧', route: '/user/address' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(item.route as any)}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
            {!item.value && <ChevronRight size={20} color="#999" />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    gap: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSection: {
    marginRight: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  membershipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  membershipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  sectionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBox: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statusLabel: {
    fontSize: 10,
    color: 'white',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
    width: 28,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  menuValue: {
    fontSize: 12,
    color: '#999',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});


