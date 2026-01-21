import { AppColors } from '@/constants/theme';
import { formatCurrencyFull } from '@/utils/format';
import { Minus, Plus, X } from 'lucide-react-native';

import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  product: any; // Dữ liệu sản phẩm từ API
  onConfirm: (selectedSize: any, quantity: number) => void;
}

export default function ProductVariantModal({ visible, onClose, product, onConfirm }: Props) {
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header: Ảnh và Giá */}
          <View style={styles.modalHeader}>
            <Image 
              source={{ uri: product.image?.[0]?.url }} 
              style={styles.variantImg} 
            />
            <View style={styles.headerInfo}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#999" />
              </TouchableOpacity>
              <Text style={styles.modalPrice}>
                {formatCurrencyFull(selectedSize ? selectedSize.price : product.price)}
              </Text>
              <Text style={styles.modalStock}>Kho: 9987556</Text>
            </View>
          </View>

          {/* Body: Phân loại */}
          <View style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Phân Loại</Text>
            <View style={styles.sizeGroup}>
              {product.product_sizes?.map((size: any) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeItem,
                    selectedSize?.id === size.id && styles.sizeItemActive
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeText,
                    selectedSize?.id === size.id && styles.sizeTextActive
                  ]}>
                    {size.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Số lượng */}
            <View style={styles.qtyRow}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.qtyBox}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={18} color="#666" />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                  <Plus size={18} color={AppColors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer: Nút bấm */}
          <TouchableOpacity 
            style={styles.confirmBtn}
            onPress={() => {
              if(!selectedSize) return Alert.alert("Thông báo", "Vui lòng chọn phân loại");
              onConfirm(selectedSize, quantity);
            }}
          >
            <Text style={styles.confirmBtnText}>Thêm vào Giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  modalHeader: { flexDirection: 'row', marginBottom: 20 },
  variantImg: { width: 100, height: 100, borderRadius: 10, marginTop: -40, backgroundColor: '#fff', borderWidth: 2, borderColor: '#fff', elevation: 5 },
  headerInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  closeBtn: { alignSelf: 'flex-end', padding: 5 },
  modalPrice: { fontSize: 20, fontWeight: '800', color: AppColors.primary, marginTop: 5 },
  modalStock: { fontSize: 13, color: '#999', marginTop: 4 },
  modalBody: { marginVertical: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 12 },
  sizeGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeItem: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#F5F5F5' },
  sizeItemActive: { backgroundColor: '#FFF5F7', borderColor: AppColors.primary },
  sizeText: { fontSize: 13, color: '#333' },
  sizeTextActive: { color: AppColors.primary, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 5 },
  qtyValue: { fontSize: 16, fontWeight: '700' },
  confirmBtn: { backgroundColor: AppColors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});