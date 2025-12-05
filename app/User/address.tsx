import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#ff6b9d', '#c44569']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
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
                <Trash2 size={16} color="#FF6B9D" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="white" />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FF6B9D',
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
    backgroundColor: '#FF6B9D',
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
    backgroundColor: '#FF6B9D',
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
});
