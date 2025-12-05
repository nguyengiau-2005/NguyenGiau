import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Camera, ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Nguyễn Giao');
  const [email, setEmail] = useState('nguyengiao@email.com');
  const [phone, setPhone] = useState('+84 123 456 789');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1500);
  };

  const handleChangeAvatar = () => {
    Alert.alert('Thay đổi ảnh đại diện', 'Chọn cách thay đổi ảnh đại diện', [
      { text: 'Chụp ảnh', onPress: () => {} },
      { text: 'Chọn từ thư viện', onPress: () => {} },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#ff6b9d', '#c44569']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>NG</Text>
        </View>
        <TouchableOpacity onPress={handleChangeAvatar} style={styles.cameraButton}>
          <Camera size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChangeAvatar} style={styles.changeAvatarButton}>
          <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        {/* Full Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <View
              style={styles.input}
            >
              <Text style={styles.inputText}>{fullName}</Text>
            </View>
          </View>
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📧</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>{email}</Text>
            </View>
          </View>
        </View>

        {/* Phone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📱</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>{phone}</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={[styles.saveButton, isLoading && { opacity: 0.6 }]}
        >
          <Text style={styles.saveButtonText}>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 50,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  changeAvatarButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FF6B9D',
    borderRadius: 20,
  },
  changeAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
