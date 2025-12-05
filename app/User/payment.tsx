import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
}

export default function PaymentScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      details: '**** **** **** 1234',
      isDefault: true,
    },
    {
      id: '2',
      type: 'bank',
      name: 'Ngân hàng Vietcombank',
      details: 'Tài khoản: **** 5678',
      isDefault: false,
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'card':
        return '💳';
      case 'bank':
        return '🏦';
      case 'wallet':
        return '👛';
      default:
        return '💰';
    }
  };

  const handleDeletePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPayments(
      payments.map((p) => ({
        ...p,
        isDefault: p.id === id,
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
          <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {payments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentIcon}>{getIcon(payment.type)}</Text>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentName}>{payment.name}</Text>
                <Text style={styles.paymentInfo}>{payment.details}</Text>
              </View>
              {payment.isDefault && <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Mặc định</Text>
              </View>}
            </View>
            <View style={styles.paymentActions}>
              {!payment.isDefault && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(payment.id)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Đặt làm mặc định</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleDeletePayment(payment.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color="#FF6B9D" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="white" />
          <Text style={styles.addButtonText}>Thêm phương thức thanh toán</Text>
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
  paymentCard: {
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
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  paymentIcon: {
    fontSize: 28,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentInfo: {
    fontSize: 12,
    color: '#999',
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
  paymentActions: {
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
