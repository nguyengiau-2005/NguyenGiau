import apiUser from '@/api/apiUser';
import { useAuth } from '@/contexts/Auth';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Interfaces ---
interface LocationItem {
  code: number;
  name: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  full_address: string;
  isDefault: boolean;
}

export default function AddressScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Lấy thông tin user từ Context

  // --- States ---
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('user-address');

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');

  // Location States
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);
  const [selectedP, setSelectedP] = useState<LocationItem | null>(null);
  const [selectedD, setSelectedD] = useState<LocationItem | null>(null);
  const [selectedW, setSelectedW] = useState<LocationItem | null>(null);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<LocationItem[]>([]);
  const [modalType, setModalType] = useState<'P' | 'D' | 'W'>('P');

  // --- 1. Load dữ liệu ban đầu ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProvinces();
      await loadAddressFromBaserow();
      setLoading(false);
    };
    init();
  }, [user]);

  const loadAddressFromBaserow = async () => {
    if (!user?.id) return;
    try {
      // Lấy dữ liệu thật từ apiUser
      const userData = await apiUser.getUserDetail(user.id);
      if (userData.city && userData.address_line) {
        const fullString = `${userData.address_line}, ${userData.ward}, ${userData.district}, ${userData.city}`;
        setAddresses([
          {
            id: 'user-address',
            name: userData.full_name,
            phone: userData.phone,
            full_address: fullString,
            isDefault: true,
          },
        ]);
      }
    } catch (e) {
      console.error('Lỗi load địa chỉ:', e);
    }
  };

  // --- 2. Xử lý API Tỉnh/Thành ---
  const fetchProvinces = async () => {
    try {
      const res = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDistricts = async (pCode: number) => {
    const res = await axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
    setDistricts(res.data.districts);
  };

  const fetchWards = async (dCode: number) => {
    const res = await axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
    setWards(res.data.wards);
  };

  // --- 3. Handlers ---
  const handleSelectLocation = (item: LocationItem) => {
    if (modalType === 'P') {
      setSelectedP(item); setSelectedD(null); setSelectedW(null);
      fetchDistricts(item.code);
    } else if (modalType === 'D') {
      setSelectedD(item); setSelectedW(null);
      fetchWards(item.code);
    } else {
      setSelectedW(item);
    }
    setModalVisible(false);
  };

  const handleSaveAddress = async () => {
    if (!newName || !newPhone || !selectedP || !selectedD || !selectedW || !newAddressLine) {
      return Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin');
    }
    try {
      const payload = {
        city: selectedP.name,
        district: selectedD.name,
        ward: selectedW.name,
        address_line: newAddressLine,
        full_name: newName,
        phone: newPhone,
      };
      if (user?.id) {
        await apiUser.updateProfile(user.id, payload); // Lưu vào Baserow
        await loadAddressFromBaserow();
        setShowAddForm(false);
        Alert.alert('Thành công', 'Địa chỉ đã được cập nhật');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu lên hệ thống');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header trắng chuẩn hình mẫu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#FF4D2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn địa chỉ nhận hàng</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Địa chỉ</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#FF4D2D" style={{ marginTop: 20 }} />
        ) : (
          addresses.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.addressCard}
              onPress={() => setSelectedId(item.id)}
            >
              {/* Radio Button đỏ */}
              <View style={styles.radioBox}>
                <View style={[styles.radioOuter, selectedId === item.id && styles.radioActive]}>
                  {selectedId === item.id && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.addressInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Text style={styles.phoneText}> | {item.phone}</Text>
                </View>
                {/* Tách địa chỉ thành 2 dòng như hình */}
                <Text style={styles.addressText1}>{item.full_address.split(',')[0]}</Text>
                <Text style={styles.addressText2}>
                  {item.full_address.split(',').slice(1).join(',').trim()}
                </Text>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.editBtn} onPress={() => setShowAddForm(true)}>
                <Text style={styles.editText}>Sửa</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {/* Form thêm mới */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <TextInput placeholder="Họ và tên" value={newName} onChangeText={setNewName} style={styles.input} />
            <TextInput placeholder="Số điện thoại" value={newPhone} onChangeText={setNewPhone} style={styles.input} keyboardType="phone-pad" />
            
            <TouchableOpacity style={styles.selector} onPress={() => { setModalType('P'); setModalData(provinces); setModalVisible(true); }}>
              <Text style={{ color: selectedP ? '#000' : '#999' }}>{selectedP ? selectedP.name : 'Tỉnh/Thành phố'}</Text>
              <ChevronDown size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.selector} onPress={() => { setModalType('D'); setModalData(districts); setModalVisible(true); }}>
              <Text style={{ color: selectedD ? '#000' : '#999' }}>{selectedD ? selectedD.name : 'Quận/Huyện'}</Text>
              <ChevronDown size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.selector} onPress={() => { setModalType('W'); setModalData(wards); setModalVisible(true); }}>
              <Text style={{ color: selectedW ? '#000' : '#999' }}>{selectedW ? selectedW.name : 'Phường/Xã'}</Text>
              <ChevronDown size={20} color="#999" />
            </TouchableOpacity>

            <TextInput placeholder="Địa chỉ chi tiết" value={newAddressLine} onChangeText={setNewAddressLine} style={styles.input} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity onPress={handleSaveAddress} style={styles.btnPrimary}><Text style={{ color: 'white', fontWeight: 'bold' }}>Lưu</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.btnSecondary}><Text>Hủy</Text></TouchableOpacity>
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer cố định */}
      {!showAddForm && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addBtnLarge} onPress={() => setShowAddForm(true)}>
            <Plus size={20} color="#FF4D2D" />
            <Text style={styles.addBtnTextLarge}>Thêm Địa Chỉ Mới</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal chọn địa điểm */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn vị trí</Text>
            <FlatList
              data={modalData}
              keyExtractor={(item) => item.code.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectLocation(item)}>
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}><Text>Đóng</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, color: '#333', marginLeft: 10, fontWeight: '500' },
  sectionLabel: { padding: 12 },
  sectionLabelText: { color: '#888', fontSize: 13 },
  content: { flex: 1 },
  // Card địa chỉ chuẩn hình 1
  addressCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  radioBox: { marginRight: 12, marginTop: 4 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1, borderColor: '#CCC',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#FF4D2D' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D2D' },
  addressInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  nameText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  phoneText: { fontSize: 14, color: '#888' },
  addressText1: { fontSize: 13, color: '#444', marginBottom: 2 },
  addressText2: { fontSize: 13, color: '#666' },
  defaultBadge: {
    borderWidth: 1, borderColor: '#FF4D2D',
    paddingHorizontal: 4, paddingVertical: 1,
    marginTop: 8, borderRadius: 2, alignSelf: 'flex-start',
  },
  defaultBadgeText: { color: '#FF4D2D', fontSize: 10 },
  editBtn: { marginLeft: 10 },
  editText: { color: '#888', fontSize: 14 },
  // Footer cố định
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', padding: 15, borderTopWidth: 0.5, borderTopColor: '#DDD',
  },
  addBtnLarge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FF4D2D', paddingVertical: 12, borderRadius: 4,
  },
  addBtnTextLarge: { color: '#FF4D2D', fontSize: 16, marginLeft: 8 },
  // Form & Modal
  formContainer: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 8, elevation: 2 },
  input: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 4, marginBottom: 10, borderWidth: 0.5, borderColor: '#DDD' },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 12, marginBottom: 10, borderWidth: 0.5, borderColor: '#DDD', borderRadius: 4 },
  btnPrimary: { flex: 1, backgroundColor: '#FF4D2D', padding: 12, borderRadius: 4, alignItems: 'center' },
  btnSecondary: { flex: 1, backgroundColor: '#EEE', padding: 12, borderRadius: 4, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', height: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  modalCloseBtn: { marginTop: 10, padding: 15, alignItems: 'center', backgroundColor: '#F1F1F1', borderRadius: 10 },
});