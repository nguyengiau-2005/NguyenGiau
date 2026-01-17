import { AppColors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, ShoppingBag } from 'lucide-react-native';
import React from 'react';
import {
    Dimensions,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    // Lưu cờ đã xem intro
    await AsyncStorage.setItem('HAS_SEEN_INTRO', 'true');
    // Chuyển hướng sang trang auth hoặc tabs
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      {/* Hình nền chất lượng cao */}
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/1200x/e5/42/50/e54250035a6b554faf84cfac6e563f10.jpg' }} // Thay bằng ảnh sản phẩm đẹp của bạn
        style={styles.background}
      >
        {/* Lớp phủ Gradient để làm nổi bật text */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.content}>
            
            {/* Logo hoặc Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.iconCircle}>
                <ShoppingBag size={40} color="#fff" strokeWidth={1.5} />
              </View>
              <Text style={styles.brandName}>LUXURY SHOP</Text>
            </View>

            {/* Slogan & Giới thiệu */}
            <View style={styles.textSection}>
              <Text style={styles.title}>
                Nâng tầm phong cách{"\n"}
                <Text style={styles.highlight}>Của chính bạn</Text>
              </Text>
              <Text style={styles.description}>
                Khám phá bộ sưu tập thời trang cao cấp độc quyền. Giao hàng nhanh chóng trong vòng 24h.
              </Text>
            </View>

            {/* Nút bấm */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.button}
              onPress={handleGetStarted}
            >
              <LinearGradient
                colors={[AppColors.primary, AppColors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Bắt đầu ngay</Text>
                <ArrowRight size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Bằng cách tiếp tục, bạn đồng ý với Điều khoản của chúng tôi.
            </Text>

          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 30,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 15,
  },
  textSection: {
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
  },
  highlight: {
    color: AppColors.primaryLight,
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 15,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
  }
});