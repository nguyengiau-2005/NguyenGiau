import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ReturnPolicyScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Chính sách đổi trả</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Điều kiện đổi trả</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>• Sản phẩm chưa qua sử dụng, còn nguyên tem mác.</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>• Thời hạn đổi trả trong vòng 7 ngày kể từ ngày nhận hàng (hoặc theo quy định riêng cho chương trình).</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>• Khách hàng chịu phí vận chuyển trong một số trường hợp.</Text>

          <Text style={{ fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8 }}>Quy trình</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>1. Liên hệ CSKH và cung cấp thông tin đơn hàng, mô tả lỗi hoặc lý do đổi trả.</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>2. Hướng dẫn gửi trả sản phẩm: đóng gói cẩn thận, kèm biên lai và mã đơn hàng.</Text>
          <Text style={{ color: AppColors.textMuted, marginBottom: 8 }}>3. Sau khi nhận và kiểm tra, chúng tôi sẽ xử lý đổi/trả hoặc hoàn tiền theo phương thức đã thanh toán.</Text>

          <Text style={{ fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8 }}>Trường hợp ngoại lệ</Text>
          <Text style={{ color: AppColors.textMuted }}>Sản phẩm bị hư hỏng do vận chuyển, lỗi kỹ thuật từ nhà sản xuất sẽ được xử lý nhanh hơn; sản phẩm khuyến mãi hoặc hàng giảm giá có thể có chính sách riêng.</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/support/chat')} style={{ marginTop: 16, backgroundColor: AppColors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Liên hệ để đổi trả</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
