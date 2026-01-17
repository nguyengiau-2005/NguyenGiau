import apiUser from '@/api/apiUser'; // Import API của bạn
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { sendOtp } from '../../scripts/mock-auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // Sử dụng 'identifier' để nhận cả Phone hoặc Email
  const [isLoading, setIsLoading] = useState(false);

  // Hàm kiểm tra định dạng Email hoặc Phone
  const validateInput = (input: string) => {
    const isEmail = input.includes('@');
    if (isEmail) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    }
    const normalized = input.replace(/\s+/g, '');
    return /^(\+84|0)\d{9,10}$/.test(normalized);
  };

  const handleCheckAndSend = async () => {
    if (!identifier) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email hoặc Số điện thoại');
      return;
    }

    if (!validateInput(identifier)) {
      Alert.alert('Lỗi', 'Định dạng Email hoặc Số điện thoại không hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      // BƯỚC 1: Kiểm tra tài khoản trên Server Baserow
      let userData = null;
      const isEmail = identifier.includes('@');

      if (isEmail) {
        // Tìm user theo email (Sử dụng getAllUsers với filter)
        const response = await apiUser.getAllUsers({
          filters: JSON.stringify({
            filter_type: "AND",
            filters: [{ type: "equal", field: "email", value: identifier }]
          })
        });
        userData = response.results && response.results.length > 0 ? response.results[0] : null;
      } else {
        // Tìm user theo số điện thoại
        userData = await apiUser.getUserByPhone(identifier);
      }

      // BƯỚC 2: Rẽ nhánh xử lý
      if (!userData) {
        // KHÔNG TỒN TẠI -> Báo đăng ký
        Alert.alert(
          'Tài khoản chưa đăng ký',
          'Chúng tôi không tìm thấy tài khoản này trong hệ thống. Bạn có muốn tạo tài khoản mới?',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng ký ngay', onPress: () => router.push('/auth/signup') }
          ]
        );
      } else {
        // CÓ TỒN TẠI -> Gửi OTP
        const { sessionId, otp } = await sendOtp(identifier);
        
        // Hiển thị mã OTP ra màn hình (trong thực tế mã này sẽ gửi qua SMS/Email)
        Alert.alert(
          'Mã xác thực (OTP)',
          `Mã của bạn là: ${otp}\n\n(Lưu ý: Trong thực tế mã này sẽ được bảo mật)`,
          [{
            text: 'Tiếp tục',
            onPress: () => router.push({
              pathname: '/auth/reset-password',
              params: { 
                userId: userData.id, // Truyền ID để PATCH chính xác vào dòng này
                phone: identifier, 
                sessionId: sessionId,
                otp: otp 
              }
            })
          }]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể xác minh tài khoản. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Quên mật khẩu</ThemedText>
          <ThemedText style={styles.subtitle}>
            Nhập Email hoặc Số điện thoại đã đăng ký để khôi phục mật khẩu.
          </ThemedText>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email hoặc Số điện thoại"
              placeholderTextColor={AppColors.textMuted}
              keyboardType="default"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.disabled]} 
            onPress={handleCheckAndSend} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Gửi mã xác thực</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <ThemedText style={{ color: AppColors.primaryDark, fontWeight: '700' }}>
              Quay lại đăng nhập
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 10, color: AppColors.primaryDark },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 30 },
  inputWrapper: { marginBottom: 20 },
  input: {
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 18,
    backgroundColor: '#F9F9F9',
    fontSize: 15,
    color: '#333'
  },
  button: {
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  backLink: { marginTop: 20, alignItems: 'center' },
});