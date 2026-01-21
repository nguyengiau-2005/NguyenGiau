import apiOrder from '@/api/apiOrder';
import apiOrderItem from '@/api/apiOrderItem';
import apiReview from '@/api/apiReview';
import apiUser from '@/api/apiUser';
import { useAuth } from '@/contexts/Auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronLeft, Video } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ReviewPage() {
  const { orderId: paramOrderId, productId: paramProductId } = useLocalSearchParams();
  const router = useRouter();
  const orderId = Number(Array.isArray(paramOrderId) ? paramOrderId[0] : paramOrderId);
  const auth = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [sizeRating, setSizeRating] = useState<'standard' | 'tight' | 'loose'>('standard');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!orderId) return setLoading(false);
      try {
        const res = await apiOrder.getOrderDetail(orderId);
        // Baserow often returns link rows for `order_items`; fetch full items
        let items: any[] = [];
        try {
          items = await apiOrderItem.getItemsByOrder(orderId);
        } catch (err) {
          console.warn('Không lấy được chi tiết order_items:', err);
        }

        const fullOrder = { ...res, order_items: items };
        setOrder(fullOrder as any);
      } catch (e) {
        console.warn('Không tải được đơn hàng:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const pickImage = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImagePicker = require('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Vui lòng cấp quyền truy cập ảnh để thêm hình.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
        selectionLimit: 1,
      });

      // Newer expo returns res.assets array
      const uri = res?.uri || (res.assets && res.assets[0] && res.assets[0].uri);
      if (!uri) return;

      // Upload and store returned filename/url
      try {
        const uploadedName = await apiUser.uploadFile(uri);
        // If API returns a name (filename), we produce a full URL if possible, otherwise use the name
        // Try to build a CDN URL if your backend expects it — for now store the returned name
        setImages(prev => [...prev, uploadedName]);
      } catch (err) {
        console.warn('Upload ảnh thất bại', err);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      }
    } catch (e) {
      console.warn('Image picker error', e);
      Alert.alert('Lỗi', 'Vui lòng cài đặt expo-image-picker');
    }
  };

  const pickVideo = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImagePicker = require('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Vui lòng cấp quyền truy cập để thêm video.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.7,
        allowsEditing: false,
        selectionLimit: 1,
      });
      const uri = res?.uri || (res.assets && res.assets[0] && res.assets[0].uri);
      if (!uri) return;
      try {
        const uploadedName = await apiUser.uploadFile(uri);
        setVideos(prev => [...prev, uploadedName]);
      } catch (err) {
        console.warn('Upload video thất bại', err);
        Alert.alert('Lỗi', 'Không thể tải video lên. Vui lòng thử lại.');
      }
    } catch (e) {
      console.warn('Video picker error', e);
      Alert.alert('Lỗi', 'Vui lòng cài đặt expo-image-picker');
    }
  };

  const getRatingText = (val: number) => {
    const map: any = { 1: 'Tệ', 2: 'Không hài lòng', 3: 'Bình thường', 4: 'Hài lòng', 5: 'Tuyệt vời' };
    return map[val];
  };

  const submit = async () => {
    if (!order) return Alert.alert('Lỗi', 'Không tìm thấy đơn hàng');
    const prod = order.order_items && order.order_items[0];
    if (!prod) return Alert.alert('Lỗi', 'Không tìm thấy sản phẩm để đánh giá');

    setSubmitting(true);
    try {
      // prefer the linked product row id if available
      const productRowId = prod.product_id ?? prod.id;
      const qty = prod.quantity ?? prod.qty ?? undefined;
      const media = [] as string[];
      if (images && images.length) media.push(...images);
      if (videos && videos.length) media.push(...videos);

      const res = await apiReview.createReview({
        product_id: Number(productRowId),
        order_id: orderId || undefined,
        user_id: auth.user?.id,
        rating,
        comment,
        images: media.length ? media : undefined,
        quantity: qty !== undefined ? Number(qty) : undefined,
      });

      if (!res) {
        Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
        return;
      }

      Alert.alert('Cảm ơn', 'Đánh giá của bạn đã được gửi');
      // navigate to product detail
      router.replace(`/product/${productRowId}`);
    } catch (err) {
      console.error('Lỗi gửi đánh giá', err);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#EE4D2D" /></View>;

  const product = order?.order_items?.[0] || {};

  return (
    <View style={s.mainContainer}>
      {/* Custom Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={28} color="#EE4D2D" /></TouchableOpacity>
        <Text style={s.headerTitle}>Đánh giá sản phẩm</Text>
        <TouchableOpacity onPress={submit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#EE4D2D" />
          ) : (
            <Text style={[s.sendText, submitting && { opacity: 0.5 }]}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={s.productRow}>
          <Image source={{ uri: product.image_url || 'https://via.placeholder.com/50' }} style={s.productThumb} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={s.productName}>{product.product_name || 'Tên sản phẩm'}</Text>
            <Text style={s.productVariant}>Phân loại: {product.variant_name || 'Mặc định'}</Text>
          </View>
        </View>

        {/* Star Rating */}
        <View style={s.ratingSection}>
          <Text style={s.ratingLabel}>Chất lượng sản phẩm</Text>
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={[s.starIcon, { color: rating >= n ? '#FFB800' : '#DDD' }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.ratingStatus}>{getRatingText(rating)}</Text>
        </View>

        <Text style={s.rewardHint}>Thêm 50 ký tự và 1 hình ảnh và 1 video để nhận đến <Text style={{ color: '#EE4D2D' }}>200 xu</Text></Text>

        {/* Upload Buttons */}
        <View style={s.uploadRow}>
          <TouchableOpacity onPress={pickImage} style={s.uploadBox}>
            <Camera size={24} color="#EE4D2D" />
            <Text style={s.uploadText}>Thêm Hình ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickVideo} style={s.uploadBox}>
            <Video size={24} color="#EE4D2D" />
            <Text style={s.uploadText}>Thêm Video</Text>
          </TouchableOpacity>
        </View>

        {/* Previews */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((u, i) => (
              <View key={i} style={{ marginRight: 8, position: 'relative' }}>
                <Image source={{ uri: u.startsWith('http') ? u : `/user-files/${u}` }} style={s.uploadThumb} />
                <TouchableOpacity onPress={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            {videos.map((v, i) => (
              <View key={`v-${i}`} style={{ marginRight: 8, position: 'relative' }}>
                <View style={{ width: 120, height: 80, borderRadius: 8, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff' }}>Video</Text>
                </View>
                <TouchableOpacity onPress={() => setVideos(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Text Input Area */}
        <View style={s.inputContainer}>
          <TextInput
            placeholder={`Đúng với mô tả: để lại đánh giá:`}
            placeholderTextColor="#999"
            multiline
            style={s.textInput}
            value={comment}
            onChangeText={setComment}
          />
          <Text style={s.inputFooter}>Hãy chia sẻ nhận xét cho sản phẩm này bạn nhé!</Text>
        </View>
        {/* Anonymous Switch */}
        <View style={s.anonymousRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.anonTitle}>Hiển thị tên đăng nhập trên đánh giá này</Text>
            <Text style={s.anonSub}>Tên tài khoản của bạn sẽ hiển thị như {isAnonymous ? '***' : 'generouslyy'}</Text>
          </View>
          <Switch
            value={!isAnonymous}
            onValueChange={(val) => setIsAnonymous(!val)}
            trackColor={{ false: '#DDD', true: '#4CD964' }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16, backgroundColor: '#fff'
  },
  headerTitle: { fontSize: 18, fontWeight: '500' },
  sendText: { color: '#EE4D2D', fontSize: 16, fontWeight: '500' },
  container: { flex: 1 },
  xuBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: '#FFFBE6', borderBottomWidth: 1, borderBottomColor: '#FFEBCC'
  },
  xuIcon: { width: 18, height: 18, marginRight: 8 },
  xuText: { fontSize: 13, color: '#333', flex: 1 },
  orangeText: { color: '#E67E22', fontWeight: 'bold' },
  productRow: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', alignItems: 'center' },
  productThumb: { width: 45, height: 45, marginRight: 12, borderRadius: 2 },
  productName: { fontSize: 14, color: '#333' },
  productVariant: { fontSize: 12, color: '#999', marginTop: 4 },
  ratingSection: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#EEE' },
  ratingLabel: { fontSize: 14, color: '#333', marginRight: 15 },
  stars: { flexDirection: 'row', gap: 6 },
  starIcon: { fontSize: 24 },
  ratingStatus: { marginLeft: 'auto', color: '#FFB800', fontSize: 14 },
  rewardHint: { paddingHorizontal: 16, paddingVertical: 12, color: '#999', fontSize: 13, textAlign: 'center' },
  uploadRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, backgroundColor: '#F5F5F5' },
  uploadBox: {
    flex: 1, height: 80, borderStyle: 'solid', borderWidth: 1, borderColor: '#EE4D2D',
    borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  uploadText: { color: '#EE4D2D', fontSize: 12, marginTop: 4 },
  uploadThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 8, marginTop: 8, backgroundColor: '#f0f0f0' },
  inputContainer: { margin: 16, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  textInput: { minHeight: 120, fontSize: 14, textAlignVertical: 'top', color: '#333' },
  inputFooter: { color: '#DDD', fontSize: 12, marginTop: 10 },
  sizeSection: { padding: 16, backgroundColor: '#fff' },
  sizeTitle: { fontSize: 15, fontWeight: '500', marginBottom: 12 },
  radioRow: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#DDD', marginRight: 8 },
  radioLabel: { fontSize: 14, color: '#333' },
  sizeHint: { fontSize: 12, color: '#999' },
  anonymousRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: '#fff', marginTop: 15, borderTopWidth: 0.5, borderTopColor: '#EEE'
  },
  anonTitle: { fontSize: 14, color: '#333' },
  anonSub: { fontSize: 12, color: '#999', marginTop: 4 }
});