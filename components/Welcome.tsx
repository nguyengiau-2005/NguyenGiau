import { AppColors } from '@/constants/theme';
import React from 'react';
import { Dimensions, Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  onStart: () => void;
  onSkip?: () => void;
  image?: any;
  title?: string;
  subtitle?: string;
};

export default function Welcome({ onStart, onSkip, image, title, subtitle }: Props) {
  const hero = image || require('../assets/images/welcom/background1.jpg');

  return (
    <ImageBackground source={hero} style={styles.bg} blurRadius={Platform.OS === 'ios' ? 0 : 1}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={hero} style={styles.hero} />
          <Text style={styles.title}>{title || 'Welcome!'}</Text>
          <Text style={styles.subtitle}>{subtitle || 'Join the adventure'}</Text>

          <TouchableOpacity style={styles.startBtn} onPress={onStart}>
            <Text style={styles.startText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
      {onSkip ? (
        <TouchableOpacity style={styles.skip} onPress={onSkip}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      ) : null}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },
  container: { width: '100%', alignItems: 'center' },
  card: { width: Math.min(width * 0.88, 380), backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
  hero: { width: '100%', height: 220, borderRadius: 12, marginBottom: 18, resizeMode: 'cover' },
  title: { fontSize: 22, fontWeight: '800', color: AppColors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 18, textAlign: 'center' },
  startBtn: { backgroundColor: AppColors.onPrimary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999, width: '100%', alignItems: 'center' },
  startText: { color: AppColors.primary, fontWeight: '900', fontSize: 16 },
  skip: { position: 'absolute', top: 48, right: 20 },
  skipText: { color: AppColors.onPrimary, fontWeight: '700' },
});
