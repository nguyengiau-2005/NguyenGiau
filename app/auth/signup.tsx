import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền tất cả các trường');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, fullName);
      Alert.alert('Thành công', 'Đăng ký thành công', [
        {
          text: 'OK',
          onPress: () => {
            // Redirect to login
            router.replace('/auth/login');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} bounces={false}>
        <LinearGradient
          colors={[AppColors.primary, AppColors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <ThemedText type="title" style={styles.headerTitle}>
            Tạo Tài Khoản
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Tham gia Fiora Luxe ngay hôm nay
          </ThemedText>
        </LinearGradient>

        <ThemedView style={styles.container}>
          {/* Full Name Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabel}>
              <User size={18} color={AppColors.primaryDark} />
              <ThemedText style={styles.labelText}>Họ và tên</ThemedText>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên"
              placeholderTextColor={AppColors.textMuted}
              value={fullName}
              onChangeText={setFullName}
              editable={!isLoading}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabel}>
              <Mail size={18} color={AppColors.primaryDark} />
              <ThemedText style={styles.labelText}>Email</ThemedText>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor={AppColors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabel}>
              <Lock size={18} color={AppColors.primaryDark} />
              <ThemedText style={styles.labelText}>Mật khẩu</ThemedText>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <Eye size={20} color={AppColors.primaryDark} />
                ) : (
                  <EyeOff size={20} color={AppColors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabel}>
              <Lock size={18} color="#ff6699" />
              <ThemedText style={styles.labelText}>Xác nhận mật khẩu</ThemedText>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <Eye size={20} color={AppColors.primaryDark} />
                ) : (
                  <EyeOff size={20} color={AppColors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signupBtn, isLoading && styles.signupBtnDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <ThemedText style={styles.signupBtnText}>
              {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
            </ThemedText>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>Đã có tài khoản? </ThemedText>
            <TouchableOpacity onPress={() => router.back()}>
              <ThemedText style={[styles.loginLink, { color: AppColors.primaryDark }]}>Đăng nhập</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <ThemedText style={styles.termsText}>
            Bằng cách đăng ký, bạn đồng ý với Điều khoản & Chính sách của chúng tôi
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontFamily: Fonts.rounded,
    fontSize: 28,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
    gap: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  input: {
    borderWidth: 2,
    borderColor: AppColors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: AppColors.surface,
  },
  passwordContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: AppColors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: AppColors.surface,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  signupBtn: {
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: AppColors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  signupBtnDisabled: {
    opacity: 0.6,
  },
  signupBtnText: {
    color: AppColors.onPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  loginContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  loginText: {
    fontSize: 13,
    opacity: 0.6,
  },
  loginLink: {
    fontSize: 13,
    color: AppColors.primaryDark,
    fontWeight: '700' as const,
  },
  termsText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center' as const,
    lineHeight: 18,
  },
});
