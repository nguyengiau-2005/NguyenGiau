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
import { resetPassword, sendOtp, verifyOtp } from '../../scripts/mock-auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as { phone?: string; sessionId?: string };
  
  // Lấy thông tin từ params
  const phone = params.phone || '';
  
  // QUAN TRỌNG: Khởi tạo state trực tiếp từ params để tránh mất Session khi vừa load
  const [sessionIdState, setSessionIdState] = useState(params.sessionId || '');
  const [resendCooldown, setResendCooldown] = useState<number>(params.sessionId ? 60 : 0);
  const cooldownRef = useRef<any>(null);

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Logic đếm ngược cho nút gửi lại mã
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownRef.current);
  }, [resendCooldown]);

  // Cập nhật sessionIdState nếu params thay đổi (khi nhấn Gửi lại mã)
  useEffect(() => {
    if (params.sessionId && params.sessionId !== sessionIdState) {
      setSessionIdState(params.sessionId);
    }
  }, [params.sessionId, sessionIdState]);

  const handleResend = async () => {
    if (!phone) {
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại');
      return;
    }
    try {
      const { sessionId, code: autoCode } = await sendOtp(phone);
      setSessionIdState(sessionId);
      setResendCooldown(60);
      
      // Hiển thị mã OTP mới (Demo)
      Alert.alert('Mã mới', `Mã xác thực mới của bạn là: ${autoCode}`);
      
      // Cập nhật lại URL mà không làm mới trang
      router.setParams({ sessionId });
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi lại mã. Vui lòng thử lại sau.');
    }
  };

  const handleReset = async () => {
    // 1. Kiểm tra session
    if (!sessionIdState) {
      Alert.alert('Lỗi', 'Phiên làm việc đã hết hạn. Vui lòng quay lại hoặc gửi lại mã.');
      return;
    }

    // 2. Kiểm tra input rỗng
    if (!code || !password || !confirm) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ các trường');
      return;
    }

    // 3. Kiểm tra độ dài và khớp mật khẩu
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      // BƯỚC 1: Xác thực mã OTP với sessionId hiện tại
      const ok = await verifyOtp(sessionIdState, code);
      if (!ok) {
        Alert.alert('Mã không đúng', 'Vui lòng kiểm tra lại mã xác thực đã nhận');
        setIsLoading(false);
        return;
      }

      // BƯỚC 2: Tiến hành cập nhật mật khẩu mới
      await resetPassword(sessionIdState, password);
      
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được thay đổi thành công', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (err: any) {
      // Lỗi "Session not found" sẽ rơi vào đây nếu sessionIdState bị sai hoặc hết hạn trong mock-auth
      Alert.alert('Lỗi hệ thống', err?.message || 'Phiên làm việc không tìm thấy. Thử gửi lại mã.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Đặt lại mật khẩu</ThemedText>
          <ThemedText style={styles.subtitle}>
            Nhập mã xác thực gửi tới <ThemedText style={{ fontWeight: '800', color: AppColors.primary }}>{phone}</ThemedText>
          </ThemedText>

          {/* OTP INPUT */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mã xác thực (6 số)"
              placeholderTextColor={AppColors.textMuted}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              editable={!isLoading}
              maxLength={6}
            />
          </View>

          {/* PASSWORD INPUT */}
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

          {/* CONFIRM PASSWORD INPUT */}
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

          {/* TIMER & RESEND */}
          <View style={styles.resendContainer}>
            {resendCooldown > 0 ? (
              <ThemedText style={styles.cooldownText}>Gửi lại mã sau {resendCooldown}s</ThemedText>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <ThemedText style={styles.resendLink}>Gửi lại mã xác thực</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity 
            style={[styles.button, (isLoading || !code) && styles.disabled]} 
            onPress={handleReset} 
            disabled={isLoading || !code}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Cập nhật mật khẩu</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/auth/login')}>
            <ThemedText style={{ color: AppColors.textMuted }}>Quay lại đăng nhập</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: AppColors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    fontSize: 15,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cooldownText: {
    fontSize: 13,
    color: AppColors.textMuted,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
  },
  button: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: { backgroundColor: '#ccc', shadowOpacity: 0 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  backLink: { marginTop: 20, alignItems: 'center' },
});