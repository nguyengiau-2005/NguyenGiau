import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FileText, HelpCircle, Info, MessageSquare } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HelpCenterScreen() {
  const router = useRouter();

  const items: Array<{ icon: React.ComponentType<any>; label: string; route: '/support/faq' | '/support/chat' | '/support/return_policy' | '/support/policy' }> = [
    { icon: HelpCircle, label: 'FAQ', route: '/support/faq' },
    { icon: MessageSquare, label: 'Chat với CSKH', route: '/support/chat' },
    { icon: FileText, label: 'Chính sách đổi trả', route: '/support/return_policy' },
    { icon: Info, label: 'Điều khoản & Chính sách', route: '/support/policy' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Trung tâm hỗ trợ</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {items.map((it, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(it.route)}
            accessibilityRole="button"
            accessibilityLabel={it.label}
            style={{
              backgroundColor: '#fff',
              padding: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: AppColors.primaryLight + '33', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <it.icon size={20} color={AppColors.primary} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111' }}>{it.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontSize: 13, color: AppColors.textMuted }}>Bạn cần hỗ trợ ngay? Gọi hotline: <Text style={{ color: AppColors.primary, fontWeight: '700' }}>1900-0000</Text></Text>
          <TouchableOpacity onPress={() => router.push('/support/chat')} style={{ marginTop: 12, backgroundColor: AppColors.surface, padding: 12, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ color: AppColors.primary, fontWeight: '700' }}>Mở Chat CSKH</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
