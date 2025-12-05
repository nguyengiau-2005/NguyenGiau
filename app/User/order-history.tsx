import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'picking' | 'shipping' | 'delivered' | 'cancelled';
  items: number;
}

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD001',
      date: '2024-01-15',
      total: 1250000,
      status: 'delivered',
      items: 3,
    },
    {
      id: '2',
      orderNumber: 'ORD002',
      date: '2024-01-20',
      total: 850000,
      status: 'shipping',
      items: 2,
    },
    {
      id: '3',
      orderNumber: 'ORD003',
      date: '2024-01-25',
      total: 2100000,
      status: 'pending',
      items: 4,
    },
  ]);

  const statusColors = {
    pending: { bg: '#FFE0B2', text: '#FF9800' },
    picking: { bg: '#B3E5FC', text: '#0097A7' },
    shipping: { bg: '#C8E6C9', text: '#388E3C' },
    delivered: { bg: '#F0F4C3', text: '#689F38' },
    cancelled: { bg: '#FFCDD2', text: '#D32F2F' },
  };

  const statusLabels = {
    pending: 'Chờ xử lý',
    picking: 'Đang chọn hàng',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[item.status].bg },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusColors[item.status].text },
            ]}
          >
            {statusLabels[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderInfo}>
          {item.items} sản phẩm • Tổng: {item.total.toLocaleString()}đ
        </Text>
      </View>

      <TouchableOpacity style={styles.viewButton}>
        <Eye size={16} color="white" />
        <Text style={styles.viewButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#ff6b9d', '#c44569']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B9D',
    borderRadius: 8,
    paddingVertical: 10,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
