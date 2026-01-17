import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/Auth';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Camera, ChevronLeft, Mail, Phone, User as UserIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUri(user.avatar);
      // Giả sử context có lưu giới tính, nếu không mặc định là 'male'
      if ((user as any).gender) setGender((user as any).gender);
    }
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
    setIsLoading(true);
    try {
      // Truyền thêm giới tính vào hàm update
      await updateProfile(fullName.trim(), phone.trim(), avatarUri);
      setIsLoading(false);
      Alert.alert('Thành công', 'Hồ sơ của bạn đã được cập nhật', [
        { text: 'Xong', onPress: () => router.back() },
      ]);
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể lưu thay đổi');
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      };

      if (useCamera) {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) return Alert.alert('Lỗi', 'Cần quyền máy ảnh');
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return Alert.alert('Lỗi', 'Cần quyền thư viện ảnh');
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets?.[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert('Ảnh đại diện', 'Chọn nguồn ảnh', [
      { text: 'Chụp ảnh', onPress: () => pickImage(true) },
      { text: 'Thư viện ảnh', onPress: () => pickImage(false) },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Gradient */}
      <LinearGradient 
        colors={[AppColors.primary, AppColors.primaryLight]} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangeAvatar} activeOpacity={0.9}>
            <View style={styles.avatarWrapper}>
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
                <Camera size={16} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <View style={styles.inputContainer}>
              <UserIcon size={20} color={AppColors.primary} style={styles.iconStyle} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ví dụ: Nguyễn Văn A"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* GENDER SELECTION */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Giới tính</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity 
                style={[styles.genderBox, gender === 'male' && styles.genderBoxActive]} 
                onPress={() => setGender('male')}
              >
                <View style={[styles.radio, gender === 'male' && styles.radioActive]}>
                   {gender === 'male' && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.genderLabel, gender === 'male' && styles.genderLabelActive]}>Nam</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.genderBox, gender === 'female' && styles.genderBoxActive]} 
                onPress={() => setGender('female')}
              >
                <View style={[styles.radio, gender === 'female' && styles.radioActive]}>
                   {gender === 'female' && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.genderLabel, gender === 'female' && styles.genderLabelActive]}>Nữ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Mail size={20} color="#999" style={styles.iconStyle} />
              <Text style={styles.readOnlyText}>{email}</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={AppColors.primary} style={styles.iconStyle} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.primaryLight]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
  avatarSection: { alignItems: 'center', marginTop: -55, marginBottom: 25 },
  avatarWrapper: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 65,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: AppColors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  formCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 10, marginLeft: 2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  iconStyle: { marginRight: 12 },
  textInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#333', fontWeight: '600' },
  disabledInput: { backgroundColor: '#F1F3F5', borderColor: '#E9ECEF' },
  readOnlyText: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#999', fontWeight: '500' },
  
  // Gender Styles
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#F1F3F5',
  },
  genderBoxActive: { backgroundColor: AppColors.primary + '10', borderColor: AppColors.primary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: AppColors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.primary },
  genderLabel: { fontSize: 15, fontWeight: '600', color: '#666' },
  genderLabelActive: { color: AppColors.primary, fontWeight: '700' },

  footer: { padding: 20, marginTop: 10 },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: { color: 'white', fontSize: 17, fontWeight: '800' },
});