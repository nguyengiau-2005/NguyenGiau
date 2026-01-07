import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertCircle, Bell, ChevronRight, CreditCard, Edit3, FileText, Gift, Globe, Heart, HelpCircle, History, Info, Lock, LogOut, MapPin, MessageSquare, Moon, Package, Settings, ShoppingCart, Wallet } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
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
          Alert.alert('Đã đăng xuất', 'Bạn đã đăng xuất thành công', [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/auth/login');
              },
            },
          ]);
        },
      },
    ]);
  };

  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    // load simple unread count from support chat history (non-user messages)
    (async () => {
      try {
        // optional dependency
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const raw = await AsyncStorage.getItem('support_chat_history_v1');
        if (raw) {
          const msgs = JSON.parse(raw) as Array<{ sender?: string }>;
          const count = msgs.filter(m => m.sender && m.sender !== 'user').length;
          setChatUnread(count);
        }
      } catch (e) {
        // ignore if AsyncStorage not present
      }
    })();
  }, []);
  // Not logged in state
  if (!user) {
    return (
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Tài Khoản</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity>
                <Settings size={24} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Bell size={24} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#ffffff30', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Edit3 size={50} color="#ffffff60" strokeWidth={1} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 12 }}>Bạn chưa đăng nhập</Text>
            <Text style={{ fontSize: 14, color: '#ffffff80', textAlign: 'center', marginBottom: 32 }}>Đăng nhập để quản lý đơn hàng, yêu thích và nhận ưu đãi đặc biệt</Text>

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: AppColors.primary }}>Đăng Nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: 'transparent', borderWidth: 2, borderColor: '#fff', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Đăng Ký</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#faf9f8' }}>
      {/* ====== HEADER ====== */}
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryLight]}
        style={{ paddingHorizontal: 16, paddingTop: 44, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Tài Khoản</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}>
              <Settings size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}>
              <Bell size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 }}
              onPress={() => router.push('/(tabs)/Cart')}
            >
              <ShoppingCart size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ====== USER INFO CARD ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                style={{ position: 'relative' }}
                onPress={() => router.push('/user/edit-profile' as any)}
              >
                <Image
                  source={{ uri: user.avatar || 'https://via.placeholder.com/80' }}
                  style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: AppColors.primary }}
                />
                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: AppColors.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' }}>
                  <Edit3 size={12} color="#fff" strokeWidth={2} />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1, justifyContent: 'space-around' }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 2 }}>{user.fullName}</Text>
                  <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{user.email}</Text>
                  {user.phone && <Text style={{ fontSize: 12, color: '#999' }}>{user.phone}</Text>}
                </View>
                <View style={{ backgroundColor: '#ffe8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: AppColors.primary }}>👑 Thành viên</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: AppColors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
              onPress={() => router.push('/user/edit-profile' as any)}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Chỉnh Sửa Hồ Sơ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ====== QUICK ACTIONS ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
              onPress={() => router.push('/user/order-history' as any)}
            >
              <Package size={28} color={AppColors.primary} strokeWidth={1.5} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#333', marginTop: 6, textAlign: 'center' }}>Đơn hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
              onPress={() => Alert.alert('Ví', 'Số dư: 0đ')}
            >
              <Wallet size={28} color={AppColors.primary} strokeWidth={1.5} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#333', marginTop: 6, textAlign: 'center' }}>Ví</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
              onPress={() => Alert.alert('Voucher', 'Bạn có 0 voucher')}
            >
              <Gift size={28} color={AppColors.primary} strokeWidth={1.5} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#333', marginTop: 6, textAlign: 'center' }}>Voucher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
              onPress={() => router.push('/(tabs)/Favorites')}
            >
              <Heart size={28} color={AppColors.primary} strokeWidth={1.5} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#333', marginTop: 6, textAlign: 'center' }}>Yêu thích</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ====== ORDER STATUS ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 }}>Trạng thái đơn hàng</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            {[
              { label: 'Chờ xác nhận', icon: '📋', color: '#ffa726' },
              { label: 'Chờ lấy', icon: '📦', color: '#42a5f5' },
              { label: 'Đang giao', icon: '🚚', color: '#66bb6a' },
              { label: 'Đã giao', icon: '✓', color: '#29b6f6' },
              { label: 'Đã hủy', icon: '✕', color: '#ef5350' }
            ].map((status, idx) => (
              <TouchableOpacity
                key={idx}
                style={{ flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}
                onPress={() => Alert.alert(status.label, 'Không có đơn hàng')}
              >
                <Text style={{ fontSize: 18, marginBottom: 4 }}>{status.icon}</Text>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#333', textAlign: 'center' }}>{status.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ====== ACCOUNT SECTION ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 }}>Quản lý tài khoản</Text>

          {[
            { icon: Edit3, label: 'Thông tin cá nhân', route: '/user/edit-profile' as any },
            { icon: Lock, label: 'Đổi mật khẩu', route: null },
            { icon: MapPin, label: 'Địa chỉ giao hàng', route: '/user/address' as any },
            { icon: CreditCard, label: 'Phương thức thanh toán', route: '/user/payment' as any }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}
              onPress={() => item.route ? router.push(item.route) : Alert.alert(item.label, 'Tính năng đang phát triển')}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ffe8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <item.icon size={20} color={AppColors.primary} strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#ccc" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ====== PURCHASE ACTIVITY ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 }}>Hoạt động mua sắm</Text>

          {[
            { icon: History, label: 'Lịch sử mua hàng', route: '/user/order-history' as any },
            { icon: FileText, label: 'Đánh giá của tôi', route: null },
            { icon: AlertCircle, label: 'Đã xem gần đây', route: '/user/recent' as any }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}
              onPress={() => item.route ? router.push(item.route) : Alert.alert(item.label, 'Tính năng đang phát triển')}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ffe8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <item.icon size={20} color={AppColors.primary} strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#ccc" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ====== SUPPORT SECTION ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 }}>Hỗ trợ</Text>

          {[
            { icon: HelpCircle, label: 'Trung tâm hỗ trợ', route: '/support/help-center' },
            { icon: MessageSquare, label: 'Chat với CSKH', route: '/support/chat' },
            { icon: Info, label: 'Câu hỏi thường gặp (FAQ)', route: '/support/faq' },
            { icon: FileText, label: 'Điều khoản & Chính sách', route: '/support/policy' },
            { icon: FileText, label: 'Chính sách đổi trả', route: '/support/return_policy' }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}
              onPress={() => {
                if (item.route) {
                  if (item.route === '/support/chat') setChatUnread(0);
                  router.push(item.route as any);
                } else {
                  Alert.alert(item.label, 'Tính năng đang phát triển');
                }
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ffe8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <item.icon size={20} color={AppColors.primary} strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>{item.label}</Text>
                {item.label === 'Chat với CSKH' && chatUnread > 0 && (
                  <View style={{ backgroundColor: '#ff3b30', minWidth: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{chatUnread}</Text>
                  </View>
                )}
              </View>
              <ChevronRight size={20} color="#ccc" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ====== APP SETTINGS ====== */}
        <View style={{ marginHorizontal: 16, marginTop: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 }}>Cài đặt & thông tin</Text>

          {[
            { icon: Info, label: 'Giới thiệu ứng dụng', route: null },
            { icon: MessageSquare, label: 'Gửi phản hồi', route: null },
            { icon: Globe, label: 'Ngôn ngữ', subtext: 'Tiếng Việt' },
            { icon: Moon, label: 'Chế độ tối', subtext: 'Tắt' },
            { icon: AlertCircle, label: 'Phiên bản ứng dụng', subtext: 'v1.0.0' }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}
              onPress={() => Alert.alert(item.label, 'Tính năng đang phát triển')}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ffe8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <item.icon size={20} color={AppColors.primary} strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>{item.label}</Text>
                {item.subtext && <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{item.subtext}</Text>}
              </View>
              <ChevronRight size={20} color="#ccc" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ====== LOGOUT BUTTON ====== */}
        <View style={{ marginHorizontal: 16, marginBottom: 40 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#ff3b30', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#ff3b30', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#fff" strokeWidth={2} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Đăng Xuất</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
    
  );
}



