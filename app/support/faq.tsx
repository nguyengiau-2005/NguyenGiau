import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronDown, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const faqs = [
  { q: 'Làm sao để đặt hàng?', a: 'Chọn sản phẩm, thêm vào giỏ và thanh toán tại trang Giỏ hàng. Hệ thống sẽ gửi email/Xác nhận đơn hàng và mã theo dõi khi đơn được xử lý.' },
  { q: 'Chính sách đổi trả như thế nào?', a: 'Xem chi tiết tại trang Chính sách đổi trả. Thông thường đổi trả trong vòng 7 ngày với điều kiện sản phẩm còn nguyên tem mác.' },
  { q: 'Thời gian giao hàng là bao lâu?', a: 'Tùy khu vực, thông thường 2-5 ngày làm việc. Khu vực xa hoặc during các chương trình khuyến mãi có thể kéo dài hơn.' },
  { q: 'Làm sao để liên hệ CSKH?', a: 'Bạn có thể liên hệ qua hotline, chat trực tiếp trong app hoặc gửi email kèm mã đơn hàng để được hỗ trợ nhanh.' },
  { q: 'Tôi có thể trả tiền khi nhận hàng không?', a: 'Tùy chương trình bán hàng. Hiện tại chúng hỗ trợ thanh toán trực tuyến và có thể có lựa chọn COD cho một số khu vực.' },
];

export default function FAQScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  const toggle = (i: number) => setOpenIdx(prev => (prev === i ? null : i));

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>FAQ</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.surface, padding: 8, borderRadius: 10 }}>
            <Search size={18} color={AppColors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm kiếm câu hỏi..."
              placeholderTextColor={AppColors.textMuted}
              style={{ marginLeft: 8, flex: 1, paddingVertical: 6, color: '#111' }}
            />
          </View>
        </View>

        {filtered.map((f, i) => (
          <View key={i} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 }}>
            <TouchableOpacity onPress={() => toggle(i)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#111', flex: 1 }}>{f.q}</Text>
              <ChevronDown size={18} color={AppColors.textMuted} style={{ transform: [{ rotate: openIdx === i ? '180deg' : '0deg' }] as any }} />
            </TouchableOpacity>
            {openIdx === i ? <Text style={{ color: AppColors.textMuted, marginTop: 8 }}>{f.a}</Text> : null}
          </View>
        ))}

        <Text style={{ color: AppColors.textMuted, marginTop: 8 }}>Nếu bạn không tìm thấy câu trả lời, vui lòng liên hệ CSKH hoặc sử dụng chat trực tiếp.</Text>

        <TouchableOpacity onPress={() => router.push('/support/chat')} style={{ marginTop: 16, backgroundColor: AppColors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Chat với CSKH</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
