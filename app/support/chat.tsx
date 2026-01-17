import { AppColors } from '@/constants/theme';
import { formatPriceFromAPI } from '@/utils/formatPrice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Image as ImgIcon, Star } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ChatMessage = {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text?: string;
  imageUri?: string;
  productCard?: {
    id: string;
    name: string;
    price: string;
    image: string;
  };
  ts: number;
};

const STORAGE_KEY = 'support_chat_history_v1';

export default function ChatSupportScreen() {
  const router = useRouter();
  const { productId, productName, productPrice, productImage } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const flatRef = useRef<FlatList<ChatMessage>>(null);

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

      // Nếu có thông tin sản phẩm truyền sang
      if (productId && productName) {
        setTimeout(() => {
          const productMsg: ChatMessage = {
            id: `prod_${Date.now()}`,
            sender: 'user',
            text: `Tôi muốn tìm hiểu thêm về sản phẩm này:`,
            productCard: {
              id: String(productId),
              name: String(productName),
              price: String(productPrice),
              image: String(productImage),
            },
            ts: Date.now()
          };
          
          setMessages(prev => {
            // Tránh duplicate tin nhắn sản phẩm khi reload
            const exists = prev.find(m => m.productCard?.id === productId);
            return exists ? prev : [...prev, productMsg];
          });

          // Bot trả lời tự động
          setTimeout(() => {
            const replyMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'bot',
              text: `Chào bạn! Nhân viên tư vấn đã nhận được yêu cầu về sản phẩm "${productName}". Bạn cần hỗ trợ gì về giá hay cách sử dụng sản phẩm này không ạ?`,
              ts: Date.now()
            };
            setMessages(prev => [...prev, replyMsg]);
          }, 800);
        }, 300);
      }
    })();
  }, [productId, productImage, productName, productPrice]);

  useEffect(() => {
    if (!AsyncStorage || messages.length === 0) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (_) {
        console.warn('Failed to save chat history', _);
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

    setTimeout(() => {
      const bot: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: "Cảm ơn bạn, chúng tôi sẽ phản hồi sớm nhất!", ts: Date.now() };
      appendMessage(bot);
      setSending(false);
    }, 1000);
  };

  const renderProductCard = (item: any) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productNameText} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPriceText}>{formatPriceFromAPI(item.price)}</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={10} color="#FFB300" fill="#FFB300" />
          ))}
          <Text style={styles.ratingText}>5.0</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.buyBtn}
        onPress={() => router.push(`/product/${item.id}` as any)}
      >
        <Text style={styles.buyBtnText}>Xem</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Đang trực tuyến</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearHistory}>
            <Text style={{ color: '#fff', fontSize: 13, opacity: 0.8 }}>Xóa lịch sử</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {loadingHistory ? (
          <ActivityIndicator style={{ flex: 1 }} color={AppColors.primary} />
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
                <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                  {item.text && <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.botText]}>{item.text}</Text>}
                  {item.productCard && renderProductCard(item.productCard)}
                  {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.attachedImage} />}
                  <Text style={[styles.timestamp, item.sender === 'user' ? styles.userTime : styles.botTime]}>
                    {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            )}
          />
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
            <ImgIcon size={22} color={AppColors.primary} />
          </TouchableOpacity>
          <TextInput
            placeholder="Nhập tin nhắn..."
            value={input}
            onChangeText={setInput}
            multiline
            editable={!sending}
            style={styles.textInput}
          />
          <TouchableOpacity 
            onPress={() => sendUserMessage(input)} 
            disabled={!input.trim() || sending}
            style={[styles.sendButton, { backgroundColor: (input.trim() && !sending) ? AppColors.primary : '#E0E0E0' }]}
          >
            <Text style={styles.sendButtonText}>{sending ? '...' : 'Gửi'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  async function pickImage() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
      if (!res.canceled) sendUserMessage(undefined, res.assets[0].uri);
    } catch { Alert.alert("Lỗi", "Không thể chọn ảnh"); }
  }

  function clearHistory() {
    Alert.alert('Xóa chat', 'Bạn có muốn xóa toàn bộ lịch sử trò chuyện?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          setMessages([]);
          if (AsyncStorage) await AsyncStorage.removeItem(STORAGE_KEY);
      }}
    ]);
  }
}

const styles = StyleSheet.create({
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 5 },
  onlineText: { color: '#fff', fontSize: 11, opacity: 0.8 },
  messageRow: { marginBottom: 16, flexDirection: 'row' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: AppColors.primary, borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  timestamp: { fontSize: 10, marginTop: 4 },
  userTime: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  botTime: { color: '#999' },
  productCard: { backgroundColor: '#fff', borderRadius: 10, padding: 8, flexDirection: 'row', alignItems: 'center', marginTop: 10, width: 240, borderWidth: 1, borderColor: '#EEE' },
  productImage: { width: 50, height: 50, borderRadius: 6, backgroundColor: '#F9F9F9' },
  productInfo: { flex: 1, marginLeft: 10 },
  productNameText: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  productPriceText: { fontSize: 12, color: AppColors.primary, fontWeight: '700', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 10, color: '#666', marginLeft: 4 },
  buyBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  buyBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  attachedImage: { width: 200, height: 150, borderRadius: 10, marginTop: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: Platform.OS === 'ios' ? 25 : 10 },
  iconButton: { padding: 8 },
  textInput: { flex: 1, backgroundColor: '#F0F2F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100, fontSize: 15 },
  sendButton: { marginLeft: 10, width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});