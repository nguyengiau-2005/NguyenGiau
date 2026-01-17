import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Camera, ChevronLeft, Lock, Mail, Phone, User } from 'lucide-react-native'; // Thêm icon Users
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  // State quản lý dữ liệu form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam'); // Mặc định là Nam
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // 1. Load dữ liệu từ User Context vào Form
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      // Load giới tính cũ (nếu có), nếu chưa có thì mặc định là 'Nam'
      // Lưu ý: Đảm bảo trong UserData (apiUser.ts) đã có trường gender
      setGender((user as any).gender || 'Nam');

      if (Array.isArray(user.avatar) && user.avatar.length > 0) {
        setAvatarUri(user.avatar[0].url);
      } else if (typeof user.avatar === 'string') {
        setAvatarUri(user.avatar);
      }
    }
  }, [user]);

  // 2. Hàm Lưu thay đổi
  const handleSave = async () => {
    if (!fullName.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
    setIsLoading(true);
    try {
      await updateProfile(fullName.trim(), phone.trim(), gender, avatarUri || undefined);
      setIsLoading(false);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      // LOG CHI TIẾT LỖI Ở ĐÂY
      if (err.response) {
        console.log("LỖI TỪ BASEROW:", JSON.stringify(err.response.data, null, 2));
      } else {
        console.log("LỖI KẾT NỐI:", err.message);
      }
      Alert.alert('Lỗi', 'Cập nhật không thành công. Hãy kiểm tra console.');
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      if (useCamera) {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) return Alert.alert('Lỗi', 'Cần quyền truy cập camera.');
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return Alert.alert('Lỗi', 'Cần quyền truy cập thư viện.');
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert('Ảnh đại diện', 'Chọn phương thức', [
      { text: 'Chụp ảnh', onPress: () => pickImage(true) },
      { text: 'Thư viện ảnh', onPress: () => pickImage(false) },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[AppColors.primary, AppColors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.avatarWrapper}>
            <TouchableOpacity onPress={handleChangeAvatar} activeOpacity={0.9}>
              <View style={styles.avatarContainer}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={14} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChangeAvatar}>
              <Text style={styles.changePhotoText}>Thay đổi ảnh</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.bodyContainer}>
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={AppColors.primary} style={styles.inputIcon} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  placeholder="Nhập họ tên"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Gender Selector (MỚI) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderRow}>
                {['Nam', 'Nữ', 'Khác'].map((item) => {
                  const isSelected = gender === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.genderOption,
                        isSelected && styles.genderOptionSelected
                      ]}
                      onPress={() => setGender(item)}
                    >
                      <Text style={[
                        styles.genderText,
                        isSelected && styles.genderTextSelected
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={AppColors.primary} style={styles.inputIcon} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Email (Read Only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <Mail size={20} color="#999" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{email}</Text>
                <Lock size={16} color="#999" />
              </View>
              <Text style={styles.helperText}>Email không thể thay đổi</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  changePhotoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  bodyContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  disabledInput: {
    backgroundColor: '#F0F0F5',
    borderColor: '#E5E5EA',
  },
  disabledText: {
    flex: 1,
    fontSize: 15,
    color: '#8E8E93',
  },
  helperText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  // STYLES CHO GENDER SELECTOR
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderOptionSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  genderTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
});