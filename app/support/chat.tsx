import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image as ImgIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ChatMessage = {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text?: string;
  imageUri?: string;
  ts: number;
};

const STORAGE_KEY = 'support_chat_history_v1';

export default function ChatSupportScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const flatRef = useRef<FlatList<ChatMessage>>(null);

  // Optional AsyncStorage
  let AsyncStorage: any | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    AsyncStorage = null;
  }

  useEffect(() => {
    (async () => {
      if (AsyncStorage) {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw) setMessages(JSON.parse(raw));
        } catch (err) {
          console.warn('Failed to load chat history', err);
        }
      }
      setLoadingHistory(false);
    })();
  }, []);

  useEffect(() => {
    if (!AsyncStorage) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.warn('Failed to save chat history', err);
      }
    })();
  }, [messages]);

  const appendMessage = (m: ChatMessage) => {
    setMessages(prev => [...prev, m]);
    setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 120);
  };

  const sendUserMessage = async (text?: string, imageUri?: string) => {
    if (!text && !imageUri) return;
    setSending(true);
    const msg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: text ?? undefined, imageUri, ts: Date.now() };
    appendMessage(msg);
    setInput('');

    // Simulate bot reply
    setTimeout(() => {
      const bot: ChatMessage = { id: (Date.now()+1).toString(), sender: 'bot', text: generateBotReply(msg), ts: Date.now() };
      appendMessage(bot);
      setSending(false);
    }, 800 + Math.random() * 900);
  };

  const generateBotReply = (userMsg: ChatMessage) => {
    if (userMsg.imageUri) return 'Cảm ơn, chúng tôi đã nhận hình ảnh. Nhân viên sẽ kiểm tra và phản hồi.';
    const t = (userMsg.text || '').toLowerCase();
    if (t.includes('đổi') || t.includes('refund')) return 'Để đổi trả, vui lòng cung cấp mã đơn hàng và mô tả vấn đề.';
    if (t.includes('giao') || t.includes('trễ')) return 'Thời gian giao hàng thường 2-5 ngày làm việc, tùy khu vực.';
    return 'Cảm ơn bạn đã liên hệ, CSKH sẽ trả lời sớm.';
  };

  const pickImage = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImagePicker = require('expo-image-picker');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!res.cancelled) {
        await sendUserMessage(undefined, res.uri);
      }
    } catch (err) {
      Alert.alert('Không thể chọn ảnh', 'Cài đặt `expo-image-picker` để gửi ảnh.');
      console.warn('ImagePicker error', err);
    }
  };

  const clearHistory = async () => {
    Alert.alert('Xác nhận', 'Xóa lịch sử chat?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        setMessages([]);
        if (AsyncStorage) await AsyncStorage.removeItem(STORAGE_KEY);
      } }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ paddingTop: 44, paddingBottom: 12, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Chat với CSKH</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={clearHistory} style={{ padding: 6 }}>
              <Text style={{ color: '#fff' }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {loadingHistory ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={{ padding: 12, paddingBottom: 96 }}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12, alignItems: item.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <View style={{ maxWidth: '82%', backgroundColor: item.sender === 'user' ? AppColors.primary : '#fff', padding: 10, borderRadius: 10 }}>
                  {item.text ? <Text style={{ color: item.sender === 'user' ? '#fff' : '#333' }}>{item.text}</Text> : null}
                  {item.imageUri ? <Image source={{ uri: item.imageUri }} style={{ width: 200, height: 140, borderRadius: 8, marginTop: 8 }} /> : null}
                  <Text style={{ fontSize: 10, color: item.sender === 'user' ? '#fff' : '#999', marginTop: 6 }}>{new Date(item.ts).toLocaleTimeString()}</Text>
                </View>
              </View>
            )}
          />
        )}

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: AppColors.surface, borderTopWidth: 1, borderTopColor: AppColors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={pickImage} style={{ padding: 8 }}>
              <ImgIcon color={AppColors.primary} />
            </TouchableOpacity>
            <TextInput
              placeholder="Nhập tin nhắn..."
              value={input}
              onChangeText={setInput}
              style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
            />
            <TouchableOpacity onPress={() => sendUserMessage(input)} disabled={sending || input.trim().length === 0} style={{ marginLeft: 8, backgroundColor: input.trim() ? AppColors.primary : '#ccc', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{sending ? '...' : 'Gửi'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
