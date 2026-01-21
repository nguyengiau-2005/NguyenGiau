import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Image as ImgIcon, SendHorizontal, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity, View
} from 'react-native';

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

  let AsyncStorage: any | null = null;
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) { AsyncStorage = null; }

  useEffect(() => {
    (async () => {
      if (AsyncStorage) {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw) setMessages(JSON.parse(raw));
        } catch (err) { console.warn('Failed to load chat history', err); }
      }
      setLoadingHistory(false);
    })();
  }, []);

  useEffect(() => {
    if (!AsyncStorage) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (err) { console.warn('Failed to save chat history', err); }
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
      const bot: ChatMessage = { id: (Date.now()+1).toString(), sender: 'bot', text: generateBotReply(msg), ts: Date.now() };
      appendMessage(bot);
      setSending(false);
    }, 1500);
  };

  const generateBotReply = (userMsg: ChatMessage) => {
    if (userMsg.imageUri) return 'Cảm ơn, chúng tôi đã nhận hình ảnh. Nhân viên CSKH sẽ phản hồi bạn ngay lập tức.';
    const t = (userMsg.text || '').toLowerCase();
    if (t.includes('đổi') || t.includes('refund')) return 'Để đổi trả sản phẩm, bạn vui lòng chụp lại hóa đơn và mã vận đơn giúp shop nhé.';
    if (t.includes('giao') || t.includes('trễ')) return 'Hiện tại đơn hàng đang được vận chuyển. Bạn có thể kiểm tra ở mục "Đơn hàng của tôi".';
    return 'Chào bạn, Fiora Luxe đã nhận được yêu cầu của bạn. Chúng tôi sẽ phản hồi trong giây lát.';
  };

  const pickImage = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!res.canceled) {
        await sendUserMessage(undefined, res.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể truy cập thư viện ảnh.');
    }
  };

  const clearHistory = async () => {
    Alert.alert('Xóa lịch sử', 'Tất cả tin nhắn sẽ bị xóa vĩnh viễn?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        setMessages([]);
        if (AsyncStorage) await AsyncStorage.removeItem(STORAGE_KEY);
      } }
    ]);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }} 
            style={styles.avatar} 
          />
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          {item.text ? <Text style={[styles.msgText, isUser ? styles.userText : styles.botText]}>{item.text}</Text> : null}
          {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.msgImage} /> : null}
          <Text style={[styles.tsText, isUser ? styles.userTs : styles.botTs]}>
            {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[AppColors.primary, AppColors.primaryLight]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Hỗ trợ trực tuyến</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Sẵn sàng phản hồi</Text>
          </View>
        </View>

        <TouchableOpacity onPress={clearHistory} style={styles.iconBtn}>
          <Trash2 color="#fff" size={20} />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loadingHistory ? (
          <ActivityIndicator size="large" color={AppColors.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            ListFooterComponent={sending ? (
                <View style={styles.typingContainer}>
                    <Text style={styles.typingText}>Bot đang soạn tin nhắn...</Text>
                </View>
            ) : null}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={pickImage} style={styles.attachmentBtn}>
            <ImgIcon color={AppColors.primary} size={24} />
          </TouchableOpacity>
          
          <TextInput
            placeholder="Viết tin nhắn..."
            value={input}
            onChangeText={setInput}
            style={styles.textInput}
            multiline
          />

          <TouchableOpacity 
            onPress={() => sendUserMessage(input)} 
            disabled={!input.trim() && !sending}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          >
            <SendHorizontal color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 4 },
  statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  iconBtn: { padding: 8 },
  listContent: { padding: 16, paddingBottom: 100 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#E1E8F0' },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: AppColors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  msgImage: { width: 200, height: 150, borderRadius: 12, marginTop: 8 },
  tsText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  userTs: { color: 'rgba(255,255,255,0.7)' },
  botTs: { color: '#999' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF3',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  attachmentBtn: { padding: 10 },
  textInput: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    fontSize: 15,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendBtn: {
    backgroundColor: AppColors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#E1E8F0' },
  typingContainer: { paddingHorizontal: 16, marginBottom: 10 },
  typingText: { fontSize: 12, color: '#999', fontStyle: 'italic' }
});