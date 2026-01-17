import apiUser from '@/api/apiUser';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { sendOtp, verifyOtp } from '../../scripts/mock-auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  
  // Nhận thêm userId từ params để update chính xác vào hàng đó trên Baserow
  const params = useLocalSearchParams() as { 
    userId?: string; 
    identifier?: string; 
    sessionId?: string; 
    otp?: string 
  };
  
  const userId = params.userId || '';
  const identifier = params.identifier || ''; // Có thể là phone hoặc email
  const initialSessionId = params.sessionId || '';
  const otpFromParams = params.otp || '';

  const [sessionIdState, setSessionIdState] = useState(initialSessionId);
  const [resendCooldown, setResendCooldown] = useState<number>(initialSessionId ? 60 : 0);
  const cooldownRef = useRef<number | null>(null);

  const [code, setCode] = useState(otpFromParams);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIC CẬP NHẬT MẬT KHẨU ---
  const handleReset = async () => {
    // 1. Kiểm tra đầu vào
    if (!code || !password || !confirm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      // 2. Xác thực mã OTP trước
      const isOtpValid = await verifyOtp(sessionIdState, code);
      if (!isOtpValid) {
        Alert.alert('Mã không đúng', 'Mã xác thực không chính xác hoặc đã hết hạn');
        setIsLoading(false);
        return;
      }

      // 3. Cập nhật mật khẩu lên Baserow bằng userId (Cách an toàn nhất)
      // Nếu không có userId truyền qua, chúng ta dùng identifier để tìm lại lần nữa
      let targetId = Number(userId);
      
      if (!targetId) {
        const user = identifier.includes('@') 
          ? (await apiUser.getAllUsers({ filters: JSON.stringify({ filters: [{ type: "equal", field: "email", value: identifier }] }) })).results[0]
          : await apiUser.getUserByPhone(identifier);
        
        if (!user) throw new Error("Không tìm thấy tài khoản để cập nhật");
        targetId = user.id;
      }

      // GỌI API PATCH
      await apiUser.updateProfile(targetId, { password: password });
      
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được cập nhật.', [
        { text: 'Đăng nhập ngay', onPress: () => router.push('/auth/login') },
      ]);

    } catch (err: any) {
      console.error('Reset password error:', err);
      Alert.alert('Lỗi', err?.message || 'Không thể lưu mật khẩu mới. Hãy kiểm tra lại kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC ĐẾM NGƯỢC & GỬI LẠI MÃ ---
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown((c) => c - 1);
      }, 1000) as any;
    }
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { sessionId, otp } = await sendOtp(identifier);
      setSessionIdState(sessionId);
      setCode(otp); // Hiển thị mã mới ra cho dễ test
      setResendCooldown(60);
      Alert.alert('Đã gửi lại', `Mã xác thực mới đã được gửi tới ${identifier}`);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gửi lại mã');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Mật khẩu mới</ThemedText>
          <ThemedText style={styles.subtitle}>
            Đặt lại mật khẩu cho: <ThemedText style={{ fontWeight: '800', color: AppColors.primaryDark }}>{identifier}</ThemedText>
          </ThemedText>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              placeholderTextColor={AppColors.textMuted}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              placeholderTextColor={AppColors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              placeholderTextColor={AppColors.textMuted}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.disabled]} 
            onPress={handleReset} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Cập nhật mật khẩu</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleResend} 
            disabled={resendCooldown > 0}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <ThemedText style={{ color: resendCooldown > 0 ? '#999' : AppColors.primaryDark, fontWeight: '700' }}>
              {resendCooldown > 0 ? `Gửi lại mã sau (${resendCooldown}s)` : 'Gửi lại mã xác thực'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8, color: AppColors.primaryDark },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  inputWrapper: { marginBottom: 15 },
  input: {
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    fontSize: 15,
  },
  button: {
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  backLink: { marginTop: 15, alignItems: 'center' },
});