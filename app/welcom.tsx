import { AppColors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Sparkles, Star } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('HAS_SEEN_INTRO', 'true');
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      {/* Đổi thanh trạng thái sang màu tối để nhìn rõ trên nền sáng */}
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        // Ảnh nền: Lụa hồng hoặc mây hồng pastel
        source={{ uri: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.background}
      >
        {/* Lớp phủ Gradient: Trắng pha hồng nhạt (Thay vì màu đen) */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.1)', 
            'rgba(255, 245, 248, 0.6)', 
            'rgba(255, 240, 245, 0.95)', 
            '#FFF0F5'
          ]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.content}>

            {/* --- Decorative Floating Icons (Icon bay bổng) --- */}
            <View style={[styles.floatingIcon, { top: height * 0.15, right: 40, transform: [{ rotate: '15deg' }] }]}>
              <Star size={24} color={AppColors.primary} fill={AppColors.primaryLight} opacity={0.6} />
            </View>
            <View style={[styles.floatingIcon, { top: height * 0.25, left: 30, transform: [{ rotate: '-10deg' }] }]}>
              <Sparkles size={30} color={AppColors.disabled} opacity={0.5} />
            </View>

            {/* Upper Section: Brand Logo */}
            <View style={styles.logoSection}>
              <View style={styles.glassCircle}>
                <Sparkles size={36} color={AppColors.primaryDark} />
              </View>
              <Text style={styles.brandTitle}>FIORA LUXE</Text>
              <View style={styles.line} />
              <Text style={styles.brandSubtitle}>DERMATOLOGY BEAUTY</Text>
            </View>

            {/* Bottom Section: Content */}
            <View style={styles.bottomSection}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✨ KHÁM PHÁ VẺ ĐẸP ĐÍCH THỰC</Text>
              </View>

              <Text style={styles.mainTitle}>
                Đánh thức làn da{"\n"}
                <Text style={styles.highlightText}>Tỏa sáng rạng ngời</Text>
              </Text>

              <Text style={styles.description}>
                Trải nghiệm dòng mỹ phẩm cao cấp chiết xuất hoàn toàn từ thiên nhiên. Mang lại vẻ đẹp thuần khiết cho làn da bạn.
              </Text>

              {/* Nút bấm Gradient Hồng/Cam đào */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.buttonContainer}
                onPress={handleGetStarted}
              >
                <LinearGradient
                  colors={AppColors.brandGradient} // Sử dụng gradient từ theme mới
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Khám phá ngay</Text>
                  <View style={styles.iconBox}>
                    <ArrowRight size={20} color={AppColors.primaryDark} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Trusted by 50,000+ Beauty Lovers
              </Text>
            </View>

          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5', // Lavender Blush fallback
  },
  background: {
    width: width,
    height: height,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'space-between',
    position: 'relative',
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  glassCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.6)', // Kính mờ sáng
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  brandTitle: {
    color: AppColors.textPrimary, // Chữ màu Đỏ Rượu/Hồng Đậm
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: 6,
    marginTop: 20,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif', // Font có chân sang trọng
  },
  line: {
    width: 40,
    height: 2,
    backgroundColor: AppColors.primary, // Line màu hồng
    marginVertical: 12,
    borderRadius: 1,
  },
  brandSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bottomSection: {
    marginBottom: 50,
  },
  badge: {
    backgroundColor: 'rgba(244, 143, 177, 0.15)', // Nền hồng nhạt
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  badgeText: {
    color: AppColors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainTitle: {
    color: AppColors.textPrimary, // Màu chữ tối để dễ đọc
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
  },
  highlightText: {
    color: AppColors.primary, // Highlight màu hồng chủ đạo
    fontWeight: '400',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  description: {
    color: AppColors.textSecondary, // Màu xám hồng
    fontSize: 16,
    marginTop: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 35,
    height: 68, // Nút to hơn một chút
    borderRadius: 34,
    overflow: 'hidden',
    shadowColor: AppColors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 32,
    paddingRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  footerText: {
    color: AppColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    fontWeight: '600',
  }
});