import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PolicyScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Điều khoản & Chính sách</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Chính sách bảo mật</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>Chúng tôi cam kết bảo mật thông tin khách hàng. Thông tin thu thập được sử dụng cho mục đích xử lý đơn hàng và chăm sóc khách hàng.</Text>

          <Text style={{ fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8 }}>Điều khoản sử dụng</Text>
          <Text style={{ color: AppColors.textMuted }}>Người dùng đồng ý tuân thủ các điều khoản khi sử dụng dịch vụ. Mọi hành vi lạm dụng có thể dẫn tới khóa tài khoản.</Text>
        </View>

        <View style={{ marginTop: 14, backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Sử dụng dịch vụ</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>Bạn đồng ý cung cấp thông tin chính xác khi tạo đơn hàng và tuân thủ các hướng dẫn về thanh toán, vận chuyển và đổi trả.</Text>

          <Text style={{ fontSize: 14, fontWeight: '700', marginTop: 8, marginBottom: 8 }}>Giới hạn trách nhiệm</Text>
          <Text style={{ color: AppColors.textMuted }}>Chúng tôi sẽ cố gắng đảm bảo thông tin chính xác nhưng không chịu trách nhiệm cho sai sót do nguồn cung cấp hoặc lỗi người dùng.</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/support/chat')} style={{ marginTop: 16, backgroundColor: AppColors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Liên hệ CSKH</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
