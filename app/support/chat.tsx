import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Image as ImgIcon } from 'lucide-react-native';
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
  const { productId, productName, productImage } = useLocalSearchParams();
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

      // If coming from product detail, send initial message with product info
      if (productId && productName) {
        setTimeout(() => {
          const initialText = `Tôi muốn tìm hiểu thêm về sản phẩm: ${productName}`;
          const initialMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: initialText,
            imageUri: productImage ? String(productImage) : undefined,
            ts: Date.now()
          };
          setMessages(prev => [...prev, initialMsg]);

          // Auto reply from support
          setTimeout(() => {
            const replyMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'bot',
              text: `Cảm ơn bạn đã quan tâm đến "${productName}". Nhân viên hỗ trợ sẽ sớm trả lời bạn. Vui lòng mô tả chi tiết câu hỏi của bạn.`,
              ts: Date.now()
            };
            setMessages(prev => [...prev, replyMsg]);
          }, 600);
        }, 300);
      }
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
      const bot: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: generateBotReply(msg), ts: Date.now() };
      appendMessage(bot);
      setSending(false);
    }, 800 + Math.random() * 900);
  };

  const generateBotReply = (userMsg: ChatMessage) => {
    if (userMsg.imageUri) return 'Cảm ơn, chúng tôi đã nhận hình ảnh. Nhân viên sẽ kiểm tra và phản hồi sớm nhất.';

    const t = (userMsg.text || '').toLowerCase();

    // Câu hỏi về chất lượng sản phẩm
    if (t.includes('chất lượng') || t.includes('hàng thật') || t.includes('chính hãng')) {
      return '✓ Tất cả sản phẩm từ Fiora Luxe đều là hàng chính hãng 100%, có chứng chỉ. Bạn hoàn toàn yên tâm về chất lượng. Nếu phát hiện hàng giả, chúng tôi sẽ hoàn tiền ngay.';
    }

    // Câu hỏi về thành phần, công dụng
    if (t.includes('thành phần') || t.includes('công dụng') || t.includes('cách dùng') || t.includes('thế nào')) {
      return '📋 Chi tiết thành phần và hướng dẫn sử dụng của sản phẩm:\n\n• Thành phần chính: Chiết xuất tự nhiên, không chứa hóa chất độc hại\n• Công dụng: Dưỡng ẩm, cấp nước sâu cho da\n• Cách dùng: Dùng 2-3 lần/ngày, massage nhẹ cho đến hết thấm\n\nBạn cần thêm thông tin chi tiết?';
    }

    // Câu hỏi về giá, khuyến mãi
    if (t.includes('giá') || t.includes('khuyến mãi') || t.includes('giảm giá') || t.includes('sale')) {
      return '💰 Thông tin giá & khuyến mãi:\n\n• Giá hiện tại: Đã bao gồm VAT\n• Miễn phí ship cho đơn từ 200k\n• Nhập voucher để giảm thêm\n• Hoàn tiền 100% nếu không hài lòng trong 30 ngày\n\nBạn có muốn xem các voucher khả dụng?';
    }

    // Câu hỏi về giao hàng
    if (t.includes('giao') || t.includes('ship') || t.includes('trễ') || t.includes('delivery')) {
      return '🚚 Thông tin giao hàng:\n\n• Miễn phí ship với đơn ≥ 200k\n• Giao hàng 1-3 ngày làm việc (Hà Nội, TP.HCM)\n• Các tỉnh khác 2-5 ngày\n• Hỗ trợ giao hàng toàn quốc\n• Bạn sẽ nhận được tracking số để theo dõi\n\nCó cần trợ giúp gì khác không?';
    }

    // Câu hỏi về đổi trả
    if (t.includes('đổi') || t.includes('trả') || t.includes('refund') || t.includes('hoàn')) {
      return '↩️ Chính sách đổi trả:\n\n• Hạn đổi trả: 30 ngày kể từ khi nhận hàng\n• Lý do: Lỗi sản phẩm, không đúng mô tả, hết hạn\n• Qui trình: Liên hệ CSKH → Gửi ảnh/video → Xác nhận → Gửi hàng → Hoàn tiền\n• Phí ship đổi trả: Fiora Luxe chịu\n\nBạn cần thực hiện đổi trả?';
    }

    // Câu hỏi về allergen, thích hợp cho da
    if (t.includes('da nhạy cảm') || t.includes('allergen') || t.includes('làn da') || t.includes('thích hợp')) {
      return '🧴 Thích hợp cho da:\n\n• Da dầu: Khuyên sử dụng early morning\n• Da khô: Tăng tần suất sử dụng\n• Da nhạy cảm: Thử nghiệm trước 24h\n• Da hỗn hợp: Dùng cho các vùng cần thiết\n\nNếu bạn có da nhạy cảm, vui lòng xem thành phần chi tiết. Liên hệ nếu cần tư vấn.';
    }

    // Câu hỏi về bảo bì, hạn sử dụng
    if (t.includes('bảo bì') || t.includes('hạn sử dụng') || t.includes('hsd') || t.includes('ngày hết hạn')) {
      return '📦 Thông tin bảo bì & hạn sử dụng:\n\n• Bảo bì: Hộp bìa cao cấp, có seal chống giả\n• Hạn sử dụng: In rõ trên đáy sản phẩm\n• Bảo quản: Nơi mát, tránh nắng trực tiếp\n• Cam kết: Tất cả sản phẩm còn hạn 12+ tháng\n\nBạn kiểm tra được hạn sử dụng trên bao bì.';
    }

    // Câu hỏi về đánh giá, review
    if (t.includes('đánh giá') || t.includes('review') || t.includes('ý kiến') || t.includes('nhận xét')) {
      return '⭐ Đánh giá sản phẩm:\n\n• Rating: 4.8/5 sao từ 1.2k+ khách hàng\n• Điểm mạnh: Hiệu quả, giá tốt, giao nhanh\n• Điểm cần cải thiện: Bao bì có thể tươi hơn\n\nBạn hài lòng với sản phẩm này không? Vui lòng chia sẻ đánh giá của bạn!';
    }

    // Câu hỏi về thanh toán
    if (t.includes('thanh toán') || t.includes('trả tiền') || t.includes('payment') || t.includes('payment method')) {
      return '💳 Phương thức thanh toán:\n\n• Thanh toán trực tuyến: Visa, MasterCard, ZaloPay, Momo\n• Thanh toán khi nhận hàng (COD)\n• Chuyển khoản ngân hàng\n• Trả góp: Hỗ trợ qua các ứng dụng tín dụng\n\nChọn phương thức phù hợp nhất!';
    }

    // Câu hỏi chung
    if (t.includes('xin chào') || t.includes('hello') || t.includes('hi')) {
      return 'Xin chào! 👋 Chúng tôi sẵn lòng hỗ trợ bạn. Hãy cho chúng tôi biết:\n\n✓ Bạn muốn hỏi về sản phẩm?\n✓ Có vấn đề gì với đơn hàng?\n✓ Cần tư vấn sản phẩm khác?';
    }

    // Mặc định
    return 'Cảm ơn bạn đã liên hệ! 😊 Vui lòng mô tả chi tiết vấn đề của bạn, CSKH sẽ trả lời trong 5 phút. Bạn có thể hỏi về:\n\n• Chất lượng, thành phần sản phẩm\n• Giao hàng, thanh toán\n• Đổi trả, hoàn tiền\n• Khuyến mãi, voucher';
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
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          setMessages([]);
          if (AsyncStorage) await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={{ paddingTop: 44, paddingBottom: 12, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
                {productName ? `Hỏi về: ${productName}` : 'Chat với CSKH'}
              </Text>
              <Text style={{ color: '#ffffff80', fontSize: 12, marginTop: 2 }}>Hỗ trợ 24/7</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearHistory} style={{ padding: 6 }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>Xóa</Text>
          </TouchableOpacity>
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
