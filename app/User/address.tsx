import apiUser from '@/api/apiUser';
import { useAuth } from '@/contexts/Auth';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Check, ChevronDown, ChevronLeft, Edit3, MapPin, Phone, Plus, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AddressScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('user-address');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form & Location States
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedP, setSelectedP] = useState<any | null>(null);
  const [selectedD, setSelectedD] = useState<any | null>(null);
  const [selectedW, setSelectedW] = useState<any | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalType, setModalType] = useState<'P' | 'D' | 'W'>('P');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProvinces(), loadAddressFromBaserow()]);
      setLoading(false);
    };
    init();
  }, [user]);

  const loadAddressFromBaserow = async () => {
    if (!user?.id) return;
    try {
      const userData = await apiUser.getUserDetail(user.id);
      if (userData.city && userData.address_line) {
        const fullString = `${userData.address_line}, ${userData.ward}, ${userData.district}, ${userData.city}`;
        setAddresses([{
          id: 'user-address',
          name: userData.full_name,
          phone: userData.phone,
          full_address: fullString,
          isDefault: true,
        }]);
      }
    } catch (e) { console.error(e); }
  };

  const fetchProvinces = async () => {
    try {
      const res = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSelectLocation = (item: any) => {
    if (modalType === 'P') {
      setSelectedP(item); setSelectedD(null); setSelectedW(null);
      axios.get(`https://provinces.open-api.vn/api/p/${item.code}?depth=2`).then(res => setDistricts(res.data.districts));
    } else if (modalType === 'D') {
      setSelectedD(item); setSelectedW(null);
      axios.get(`https://provinces.open-api.vn/api/d/${item.code}?depth=2`).then(res => setWards(res.data.wards));
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
        await apiUser.updateProfile(user.id, payload);
        await loadAddressFromBaserow();
        setShowAddForm(false);
        Alert.alert('Thành công', 'Địa chỉ đã được cập nhật');
      }
    } catch (e) { Alert.alert('Lỗi', 'Không thể lưu hệ thống'); }
  };

  return (
    <View style={styles.container}>
      {/* Header Profile */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ nhận hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Địa chỉ của tôi</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#FF4D2D" style={{ marginTop: 40 }} size="large" />
        ) : (
          addresses.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              activeOpacity={0.8}
              style={[styles.addressCard, selectedId === item.id && styles.addressCardActive]}
              onPress={() => setSelectedId(item.id)}
            >
              <View style={styles.cardTop}>
                <View style={styles.userInfo}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <View style={styles.vDivider} />
                  <Text style={styles.phoneText}>{item.phone}</Text>
                </View>
                
                <View style={selectedId === item.id ? styles.checkCircle : styles.uncheckCircle}>
                  {selectedId === item.id && <Check size={12} color="white" strokeWidth={4} />}
                </View>
              </View>

              <View style={styles.addressBox}>
                <MapPin size={14} color="#666" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.addressLine1}>{item.full_address.split(',')[0]}</Text>
                  <Text style={styles.addressLine2}>{item.full_address.split(',').slice(1).join(',').trim()}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.editAction} onPress={() => setShowAddForm(true)}>
                  <Edit3 size={14} color="#007AFF" />
                  <Text style={styles.editText}>Sửa địa chỉ</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Thông tin người nhận</Text>
            <View style={styles.inputGroup}>
              <User size={18} color="#999" style={styles.inputIcon} />
              <TextInput placeholder="Họ và tên" value={newName} onChangeText={setNewName} style={styles.fInput} />
            </View>
            <View style={styles.inputGroup}>
              <Phone size={18} color="#999" style={styles.inputIcon} />
              <TextInput placeholder="Số điện thoại" value={newPhone} onChangeText={setNewPhone} style={styles.fInput} keyboardType="phone-pad" />
            </View>

            <Text style={styles.formLabel}>Địa chỉ giao hàng</Text>
            <View style={styles.locationGrid}>
              <TouchableOpacity style={styles.lSelector} onPress={() => { setModalType('P'); setModalData(provinces); setModalVisible(true); }}>
                <Text numberOfLines={1} style={[styles.selText, !selectedP && {color: '#999'}]}>{selectedP ? selectedP.name : 'Tỉnh'}</Text>
                <ChevronDown size={16} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.lSelector} onPress={() => { setModalType('D'); setModalData(districts); setModalVisible(true); }}>
                <Text numberOfLines={1} style={[styles.selText, !selectedD && {color: '#999'}]}>{selectedD ? selectedD.name : 'Huyện'}</Text>
                <ChevronDown size={16} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.lSelector, {width: '100%', marginBottom: 15}]} onPress={() => { setModalType('W'); setModalData(wards); setModalVisible(true); }}>
              <Text style={[styles.selText, !selectedW && {color: '#999'}]}>{selectedW ? selectedW.name : 'Phường / Xã'}</Text>
              <ChevronDown size={16} color="#999" />
            </TouchableOpacity>

            <TextInput 
              placeholder="Số nhà, tên đường cụ thể..." 
              value={newAddressLine} 
              onChangeText={setNewAddressLine} 
              style={styles.detailInput}
              multiline
            />

            <View style={styles.formBtns}>
              <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.cBtn}><Text style={styles.cBtnText}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAddress} style={styles.sBtn}><Text style={styles.sBtnText}>Lưu địa chỉ</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {!showAddForm && (
        <View style={styles.footerSticky}>
          <TouchableOpacity style={styles.floatBtn} onPress={() => setShowAddForm(true)}>
            <Plus size={22} color="white" />
            <Text style={styles.floatBtnText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.mOverlay}>
          <View style={styles.mContent}>
            <View style={styles.mHeader}><View style={styles.mHandle}/></View>
            <FlatList
              data={modalData}
              keyExtractor={(item) => item.code.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.mItem} onPress={() => handleSelectLocation(item)}>
                  <Text style={styles.mItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.mClose}><Text style={styles.mCloseText}>Đóng</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerContainer: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 55 : 35,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  backCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  
  content: { flex: 1 },
  sectionHeader: { padding: 20, paddingBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },

  // Card Design
  addressCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  addressCardActive: { borderColor: '#FF4D2D', backgroundColor: '#FFF9F8' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  nameText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  vDivider: { width: 1, height: 14, backgroundColor: '#DDD', marginHorizontal: 10 },
  phoneText: { fontSize: 15, color: '#666' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF4D2D', alignItems: 'center', justifyContent: 'center' },
  uncheckCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#EEE' },

  addressBox: { flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  addressLine1: { fontSize: 14, fontWeight: '600', color: '#444' },
  addressLine2: { fontSize: 13, color: '#888', marginTop: 2 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  defaultBadge: { backgroundColor: '#FF4D2D15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  defaultBadgeText: { color: '#FF4D2D', fontSize: 11, fontWeight: '700' },
  editAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },

  // Floating Footer
  footerSticky: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: 'rgba(255,255,255,0.9)' },
  floatBtn: { backgroundColor: '#FF4D2D', flexDirection: 'row', height: 55, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#FF4D2D', shadowOpacity: 0.3, shadowRadius: 10 },
  floatBtnText: { color: 'white', fontSize: 16, fontWeight: '800', marginLeft: 10 },

  // Form
  formCard: { backgroundColor: '#FFF', margin: 16, borderRadius: 24, padding: 20, elevation: 5 },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 12, textTransform: 'uppercase' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  inputIcon: { marginRight: 10 },
  fInput: { flex: 1, height: 48, fontSize: 15 },
  locationGrid: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  lSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F7FA', padding: 12, borderRadius: 12 },
  selText: { fontSize: 14, fontWeight: '500' },
  detailInput: { backgroundColor: '#F5F7FA', borderRadius: 12, padding: 15, height: 80, textAlignVertical: 'top', marginBottom: 20 },
  formBtns: { flexDirection: 'row', gap: 12 },
  sBtn: { flex: 2, backgroundColor: '#FF4D2D', height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  sBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  cBtn: { flex: 1, backgroundColor: '#EEE', height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cBtnText: { color: '#666', fontWeight: '600' },

  // Modal
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  mContent: { backgroundColor: '#FFF', height: '75%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  mHeader: { alignItems: 'center', marginBottom: 15 },
  mHandle: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 3 },
  mItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  mItemText: { fontSize: 16, color: '#333' },
  mClose: { marginTop: 10, height: 50, backgroundColor: '#F5F5F5', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  mCloseText: { fontWeight: '700', color: '#666' }
});