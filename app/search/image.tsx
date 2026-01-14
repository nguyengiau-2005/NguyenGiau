import { ProductData } from '@/api/apiProduct';
import apiSearch from '@/api/apiSearch';
import { AppColors } from '@/constants/theme';
import toImageSource from '@/utils/toImageSource';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ImageSearchScreen() {
  const router = useRouter();
  const [image, setImage] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductData[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permission is required to pick images.');
      }
    })();
  }, []);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets) setImage(res);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to take photos.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setImage(res);
  };

  const submit = async () => {
    if (!image || !image.assets || image.assets.length === 0) return Alert.alert('No image', 'Choose or take a photo first.');
    const asset = image.assets[0];
    setLoading(true);
    try {
      const resp = await apiSearch.searchByImage({ uri: asset.uri, name: asset.fileName, type: asset.type || 'image/jpeg' } as any);
      setResults(resp.results || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Search failed — ensure backend `/search/image` is available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Tìm bằng hình ảnh</Text>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <TouchableOpacity onPress={pickImage} style={{ flex: 1, padding: 12, backgroundColor: AppColors.primary, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Chọn ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto} style={{ flex: 1, padding: 12, backgroundColor: AppColors.primaryLight, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Chụp ảnh</Text>
        </TouchableOpacity>
      </View>

      {image && image.assets && image.assets.length > 0 && (
        <Image source={{ uri: image.assets[0].uri }} style={{ width: '100%', height: 240, borderRadius: 8, marginBottom: 12 }} />
      )}

      <TouchableOpacity onPress={submit} style={{ padding: 12, backgroundColor: AppColors.primaryDark, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Tìm kiếm</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={AppColors.primary} />}

      {results.length > 0 && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '800', marginVertical: 12 }}>Kết quả</Text>
          {results.map((p) => (
            <TouchableOpacity key={p.id} style={{ flexDirection: 'row', marginBottom: 12, backgroundColor: '#fafafa', padding: 8, borderRadius: 8 }} onPress={() => router.push(`/product/${p.id}`)}>
              <Image source={toImageSource(p.Image) || { uri: 'https://via.placeholder.com/80' }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800' }}>{p.Name}</Text>
                <Text style={{ color: AppColors.primary, fontWeight: '700', marginTop: 8 }}>{p.Price}đ</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
