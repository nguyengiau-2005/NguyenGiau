import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Heart, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      Alert.alert('Thành công', 'Đăng nhập thành công', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại.');
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
          <Heart size={60} color="#fff" fill="#fff" />
          <ThemedText type="title" style={styles.headerTitle}>
            Fiora Luxe
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Mỹ phẩm chính hãng, giá tốt
          </ThemedText>
        </LinearGradient>

        <ThemedView style={styles.container}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabel}>
              <Mail size={18} color={AppColors.primaryDark} />
              <ThemedText style={styles.labelText}>Email</ThemedText>
            </View>
            <TextInput
                style={styles.input}
              placeholder="Nhập email của bạn"
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
                placeholder="Nhập mật khẩu"
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

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotContainer} onPress={() => router.push('/auth/forgot')}>
            <ThemedText style={styles.forgotText}>Quên mật khẩu?</ThemedText>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.loginBtnText}>
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </ThemedText>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>Hoặc</ThemedText>
            <View style={styles.divider} />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn}>
              <ThemedText style={[styles.socialText, { color: AppColors.textPrimary }]}>Google</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <ThemedText style={[styles.socialText, { color: AppColors.textPrimary }]}>Facebook</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <ThemedText style={styles.signUpText}>Chưa có tài khoản? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <ThemedText style={[styles.signUpLink, { color: AppColors.primaryDark }]}>Đăng ký ngay</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontFamily: Fonts.rounded,
    fontSize: 32,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
  },
  inputWrapper: {
    marginBottom: 24,
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
  forgotContainer: {
    alignItems: 'flex-end' as const,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: AppColors.primaryDark,
    fontWeight: '600' as const,
  },
  loginBtn: {
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginBottom: 20,
    shadowColor: AppColors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: AppColors.onPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  dividerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.divider,
  },
  dividerText: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  socialContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: AppColors.primaryLight,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  signUpContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  signUpText: {
    fontSize: 13,
    color: AppColors.textMuted,
  },
  signUpLink: {
    fontSize: 13,
    color: AppColors.primaryDark,
    fontWeight: '700' as const,
  },
});
