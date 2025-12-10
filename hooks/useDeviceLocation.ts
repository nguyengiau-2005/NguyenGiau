import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function useDeviceLocation() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập vị trí bị từ chối', 'Vui lòng cấp quyền vị trí để tự động điền địa chỉ.');
        setLoading(false);
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const rev = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      if (rev && rev.length > 0) {
        const first = rev[0];
        const parts = [first.name, first.street, first.city, first.region, first.postalCode].filter(Boolean);
        const readable = parts.join(', ');
        setAddress(readable);
        return readable;
      }
      setAddress('Không xác định');
      return 'Không xác định';
    } catch (err) {
      console.warn('useDeviceLocation error', err);
      Alert.alert('Lỗi vị trí', 'Không thể lấy vị trí thiết bị.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // best-effort fetch on mount
    fetchLocation();
  }, [fetchLocation]);

  return { address, loading, fetchLocation } as const;
}
