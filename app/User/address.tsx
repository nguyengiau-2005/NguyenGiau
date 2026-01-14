import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// 1. Import expo-location
import * as Location from 'expo-location';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export default function AddressScreen() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Nhà riêng',
      phone: '+84 123 456 789',
      address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      isDefault: true,
    },
    {
      id: '2',
      name: 'Văn phòng',
      phone: '+84 123 456 789',
      address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      isDefault: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // --- LOGIC XỬ LÝ VỊ TRÍ TRỰC TIẾP ---
  const handleGetCurrentLocation = async () => {
    try {
      setIsLocating(true);

      // Xin quyền truy cập
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Vui lòng cho phép ứng dụng truy cập vị trí trong cài đặt.');
        return;
      }

      // Lấy tọa độ
      let locationData = await Location.getCurrentPositionAsync({});

      // Chuyển tọa độ thành địa chỉ chữ
      let geocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        // Nối chuỗi địa chỉ từ dữ liệu trả về
        const fullAddr = `${addr.name || ''} ${addr.street || ''}, ${addr.district || ''}, ${addr.subregion || ''}, ${addr.region || ''}`.trim().replace(/^,|,$/g, '');

        setNewAddress(fullAddr);
        Alert.alert('Thành công', 'Đã cập nhật địa chỉ từ vị trí hiện tại');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể xác định vị trí của bạn lúc này.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleAddAddress = () => {
    if (!newName.trim() || !newPhone.trim() || !newAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const id = Date.now().toString();
    const addr: Address = {
      id,
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      isDefault: addresses.length === 0,
    };
    setAddresses([addr, ...addresses]);
    setShowAddForm(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressLabel}>{address.name}</Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Mặc định</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressPhone}>{address.phone}</Text>
            <Text style={styles.addressText}>{address.address}</Text>
            <View style={styles.addressActions}>
              {!address.isDefault && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(address.id)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Đặt làm mặc định</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleDeleteAddress(address.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color={AppColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {showAddForm ? (
          <View style={styles.addressCard}>
            <Text style={styles.formTitle}>Thêm địa chỉ mới</Text>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color={AppColors.primary} />
              ) : (
                <MapPin size={16} color={AppColors.primary} />
              )}
              <Text style={styles.locationButtonText}>
                {isLocating ? 'Đang xác vị trí...' : 'Lấy địa chỉ hiện tại'}
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Tên gợi nhớ (Nhà riêng/Văn phòng)"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
            />
            <TextInput
              placeholder="Số điện thoại"
              value={newPhone}
              onChangeText={setNewPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Địa chỉ chi tiết (Số nhà, đường...)"
              value={newAddress}
              onChangeText={setNewAddress}
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
            />

            <View style={styles.formActions}>
              <TouchableOpacity onPress={handleAddAddress} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(true)}>
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 16 },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  addressLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  defaultBadge: { backgroundColor: AppColors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  defaultBadgeText: { fontSize: 10, color: 'white', fontWeight: 'bold' },
  addressPhone: { fontSize: 13, color: '#666', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 16 },
  addressActions: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, paddingVertical: 10, backgroundColor: '#E3F2FD', borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: AppColors.primary, fontSize: 12, fontWeight: '700' },
  deleteButton: { width: 44, height: 40, backgroundColor: '#FFF5F5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
    fontSize: 14
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    marginBottom: 15,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
  },
  locationButtonText: { color: AppColors.primary, fontSize: 13, fontWeight: 'bold' },
  formActions: { flexDirection: 'column', gap: 10, marginTop: 10 },
  saveButton: { backgroundColor: AppColors.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  cancelButton: { paddingVertical: 12, alignItems: 'center' },
  cancelButtonText: { color: '#888', fontWeight: '500' },
});