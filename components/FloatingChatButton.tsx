import { AppColors } from '@/constants/theme';
import { useRouter, useSegments } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FloatingChatButton() {
  const router = useRouter();
  const segments = useSegments();
  const last = segments?.[segments.length - 1] ?? '';
  // only show on the home index inside the tabs (e.g. (tabs)/index)
  if (last !== 'index') return null;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.button}
        onPress={() => router.push('/support/chat')}
      >
        <MessageCircle size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 16, bottom: 110, zIndex: 999 },
  button: { width: 56, height: 56, borderRadius: 28, backgroundColor: AppColors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, elevation: 6 },
});
