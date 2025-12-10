import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  // Add address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('TP. Hồ Chí Minh');
  const [newDistrict, setNewDistrict] = useState('');
  const [newWard, setNewWard] = useState('');
  const [pasteText, setPasteText] = useState('');

  const handleAddAddress = () => {
    if (!newName.trim() || !newPhone.trim() || !newAddress.trim()) {
      // simple validation
      Alert.alert('Lỗi', 'Vui lòng nhập tên, số điện thoại và địa chỉ');
      return;
    }

    const id = Date.now().toString();
    const addr: Address = {
      id,
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      isDefault: addresses.length === 0, // first becomes default
    };
    setAddresses([addr, ...addresses]);
    setShowAddForm(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  const parsePastedAddress = (text: string) => {
    setPasteText(text);
    // Try to extract phone number
    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{6,}\d)/);
    if (phoneMatch) setNewPhone(phoneMatch[0].trim());

    // Split by commas and assign heuristically
    const parts = text.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      setNewAddress(parts.join(', '));
    }
    if (parts.length >= 3) {
      setNewCity(parts[parts.length - 1]);
      setNewDistrict(parts[parts.length - 2]);
      setNewWard(parts[parts.length - 3]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressLabel}>{address.name}</Text>
              {address.isDefault && <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Mặc định</Text>
              </View>}
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

        {/* Add new address form or button */}
        {showAddForm ? (
          <View style={[styles.addressCard, { backgroundColor: AppColors.surface }]}> 
            <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Thêm địa chỉ mới</Text>
            <TextInput placeholder="Tên (ví dụ: Nhà riêng)" value={newName} onChangeText={setNewName} style={styles.input} />
            <TextInput placeholder="Số điện thoại" value={newPhone} onChangeText={setNewPhone} style={styles.input} keyboardType="phone-pad" />
            <TextInput placeholder="Địa chỉ chi tiết" value={newAddress} onChangeText={setNewAddress} style={[styles.input, { height: 84 }]} multiline />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity onPress={handleAddAddress} style={[styles.addButton, { flex: 1 }]}> 
                <Text style={styles.addButtonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddForm(false)} style={[styles.deleteButton, { flex: 1, alignItems: 'center' }]}> 
                <Text>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(true)}>
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  addressPhone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: AppColors.primary,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
  },
});
