import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { resetPassword, sendOtp, verifyOtp } from '../../scripts/mock-auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as { phone?: string; sessionId?: string };
  const phone = params.phone || '';
  const initialSessionId = params.sessionId || '';
  const [sessionIdState, setSessionIdState] = useState(initialSessionId);
  const [resendCooldown, setResendCooldown] = useState<number>(initialSessionId ? 60 : 0);
  const cooldownRef = useRef<number | null>(null);

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!code || !password || !confirm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const ok = await verifyOtp(sessionIdState, code);
      if (!ok) {
        Alert.alert('Mã không đúng', 'Vui lòng kiểm tra lại mã xác thực');
        return;
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Vui lòng thử lại');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Lỗi', 'Xác nhận mật khẩu không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(sessionIdState, password);
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được cập nhật', [
        { text: 'OK', onPress: () => router.push('/auth/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // start countdown if we have an initial sessionId
    if (initialSessionId) {
      setResendCooldown(60);
    }
  }, [initialSessionId]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current as any);
        cooldownRef.current = null;
      }
      return;
    }

    // start interval
    if (!cooldownRef.current) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current as any);
              cooldownRef.current = null;
            }
            return 0;
          }
          return c - 1;
        });
      }, 1000) as unknown as number;
    }

    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current as any);
        cooldownRef.current = null;
      }
    };
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!phone) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }
    try {
      const { sessionId } = await sendOtp(phone);
      setSessionIdState(sessionId);
      // reset cooldown
      setResendCooldown(60);
      // update URL so it's reproducible (replace current)
      router.replace(`/auth/reset-password?phone=${encodeURIComponent(phone)}&sessionId=${sessionId}`);
      Alert.alert('Đã gửi lại mã', `Mã đã được gửi tới ${phone}`);
    } catch (err) {
      console.warn('resend sendOtp error', err);
      Alert.alert('Lỗi', 'Không thể gửi lại mã. Vui lòng thử lại');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Đặt lại mật khẩu</ThemedText>
          <ThemedText style={styles.subtitle}>Mã xác thực đã được gửi tới: <ThemedText style={{ fontWeight: '800' }}>{phone}</ThemedText></ThemedText>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã xác thực"
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
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor={AppColors.textMuted}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity style={[styles.button, isLoading && styles.disabled]} onPress={handleReset} disabled={isLoading}>
            <ThemedText style={styles.buttonText}>{isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.push('/auth/login')}>
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
    marginBottom: 12,
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
