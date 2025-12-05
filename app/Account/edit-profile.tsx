import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tất cả các trường');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(fullName, phone, user?.avatar);
      Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ff6699" />
        </TouchableOpacity>
        <ThemedText type="title" style={{ flex: 1, textAlign: 'center', marginRight: 24 }}>
          Chỉnh sửa hồ sơ
        </ThemedText>
      </View>

      <ThemedView style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraIcon}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</ThemedText>
        </View>

        {/* Full Name Input */}
        <View style={styles.inputWrapper}>
          <ThemedText style={styles.label}>Họ và tên</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />
        </View>

        {/* Phone Input */}
        <View style={styles.inputWrapper}>
          <ThemedText style={styles.label}>Số điện thoại</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>

        {/* Email Display (Read-only) */}
        <View style={styles.inputWrapper}>
          <ThemedText style={styles.label}>Email (không thể thay đổi)</ThemedText>
          <View style={[styles.input, styles.disabledInput]}>
            <ThemedText style={{ color: '#666' }}>{user?.email}</ThemedText>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && styles.disabledBtn]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <ThemedText style={styles.saveBtnText}>
            {isLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ff6699',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff6699',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    color: '#999',
    fontSize: 12,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: '#ff6699',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
