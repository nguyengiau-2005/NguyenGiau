import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { sendOtp } from '../../scripts/mock-auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (p: string) => {
    const normalized = p.replace(/\s+/g, '');
    // Accept +84 or 0 prefix and 9-10 remaining digits
    return /^(\+84|0)\d{9,10}$/.test(normalized);
  };

  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại bắt đầu bằng 0 hoặc +84 và đủ chữ số');
      return;
    }

    setIsLoading(true);
    try {
      const { sessionId } = await sendOtp(phone);
      Alert.alert('Đã gửi mã', `Mã xác thực đã được gửi tới ${phone}`);
      // Navigate to reset page with phone & sessionId (sessionId is opaque)
      router.push(`/auth/reset-password?phone=${encodeURIComponent(phone)}&sessionId=${sessionId}`);
    } catch (err) {
      console.warn('sendOtp error', err);
      Alert.alert('Lỗi', 'Không thể gửi mã. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Quên mật khẩu</ThemedText>
          <ThemedText style={styles.subtitle}>Nhập số điện thoại đã đăng ký, chúng tôi sẽ gửi mã xác thực.</ThemedText>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại (ví dụ: 0912345678 hoặc +84912345678)"
              placeholderTextColor={AppColors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity style={[styles.button, isLoading && styles.disabled]} onPress={handleSendCode} disabled={isLoading}>
            <ThemedText style={styles.buttonText}>{isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <ThemedText style={{ color: AppColors.textMuted }}>Quay lại đăng nhập</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  input: {
    borderWidth: 2,
    borderColor: AppColors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: AppColors.surface,
    fontSize: 14,
  },
  button: {
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: AppColors.onPrimary, fontWeight: '800' },
  backLink: { marginTop: 12, alignItems: 'center' },
});
