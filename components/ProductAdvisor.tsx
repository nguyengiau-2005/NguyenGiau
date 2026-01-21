import { ProductData } from '@/api/apiProduct';
import apiSupport from '@/api/apiSupport';
import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ChatMessage = { id: string; sender: 'user' | 'bot' | 'agent' | 'system'; text?: string; imageUri?: string; ts: number };

export default function ProductAdvisor({ visible, onClose, product }: { visible: boolean; onClose: () => void; product: ProductData | null }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const flatRef = useRef<FlatList<ChatMessage>>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (visible && product) {
            // seed with a friendly product summary
            const seed: ChatMessage = {
                id: 'seed',
                sender: 'bot',
                text: `Xin chào! Tôi là trợ lý sản phẩm chuyên nghiệp. Đây là tóm tắt về sản phẩm: ${product.name}. Giá: ${product.price || '0'}. ${product.description ? 'Mô tả: ' + product.description : ''}`,
                ts: Date.now()
            };
            setMessages([seed]);
            // Prepare quick suggestion prompts based on product
            const baseSuggestions = [
                `Cho tôi biết thành phần của ${product.name}`,
                `Công dụng chính của ${product.name} là gì?`,
                `So sánh ${product.name} với sản phẩm tương tự`,
                `Hướng dẫn sử dụng ${product.name}`,
                `Hạn sử dụng của ${product.name}`,
                `Tôi có dị ứng, có an toàn không?`
            ];
            setSuggestions(baseSuggestions);
        }
        if (!visible) {
            setMessages([]);
            setInput('');
            setSuggestions([]);
        }
    }, [visible, product]);

    const append = (m: ChatMessage) => {
        setMessages(prev => [...prev, m]);
        setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 120);
    };

    const send = async (text?: string) => {
        if (!text || text.trim().length === 0) return;
        setSending(true);
        const msg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: text.trim(), ts: Date.now() };
        append(msg);
        setInput('');

        // Try AI-powered reply first (if available), otherwise fallback to product heuristics
        (async () => {
            const productSummary = product ? `${product.name}. ${product.description || ''}` : '';
            const ai = await apiSupport.generateAIAnswer(msg.text || '', productSummary);
            if (ai) {
                append({ id: (Date.now() + 2).toString(), sender: 'bot', text: ai, ts: Date.now() });
            } else {
                // fallback
                append({ id: (Date.now() + 2).toString(), sender: 'bot', text: generateProductReply(msg.text || '', product), ts: Date.now() });
            }
            setSending(false);
        })();
    };

    const requestExpert = () => {
        // Simulate escalation: create agent message and system note
        const userReq: ChatMessage = { id: 'req-' + Date.now(), sender: 'user', text: 'Tôi muốn tư vấn chuyên gia', ts: Date.now() };
        append(userReq);
        const sys: ChatMessage = { id: 'sys-' + Date.now(), sender: 'system', text: 'Đang gửi yêu cầu tới đội ngũ chuyên gia...', ts: Date.now() };
        append(sys);

        // Create a support ticket in backend
        (async () => {
            try {
                const ticket = await apiSupport.createSupportTicket({
                    subject: `Yêu cầu tư vấn chuyên gia: ${product?.name || 'Sản phẩm'}`,
                    message: messages.map(m => `${m.sender}: ${m.text || ''}`).join('\n') + `\nUser requested expert for product ${product?.id}`,
                    product_id: product?.id,
                    metadata: { source: 'ProductAdvisor' }
                });
                append({ id: 'sys2-' + Date.now(), sender: 'system', text: 'Yêu cầu đã được ghi nhận. Mã yêu cầu: ' + (ticket?.id || 'đã tạo'), ts: Date.now() });
                append({ id: 'agent-' + Date.now(), sender: 'agent', text: 'Xin chào, tôi là chuyên viên tư vấn. Bạn cần hỗ trợ chi tiết nào về sản phẩm này?', ts: Date.now() });
            } catch (err) {
                append({ id: 'syserr-' + Date.now(), sender: 'system', text: 'Không thể gửi yêu cầu. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.', ts: Date.now() });
            }
        })();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                {/* Header Nâng Cấp */}
                <LinearGradient
                    colors={[AppColors.primary, AppColors.primaryLight]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.headerRow}
                >
                    <View style={styles.headerLeft}>
                        <View style={styles.thumbWrapper}>
                            {product?.image?.[0]?.url ? (
                                <Image source={{ uri: product.image[0].url }} style={styles.productThumb} />
                            ) : (
                                <View style={styles.productThumbPlaceholder}><Text style={{ color: '#fff' }}>P</Text></View>
                            )}
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.headerTitle}>Trợ lý Fiora</Text>
                            <Text style={styles.headerSubtitle} numberOfLines={1}>{product?.name}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>Đóng</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <FlatList
                        ref={flatRef}
                        data={messages}
                        keyExtractor={m => m.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={[styles.messageRow, item.sender === 'user' ? styles.rowRight : styles.rowLeft]}>
                                {item.sender !== 'user' && (
                                    <View style={[styles.avatar, item.sender === 'agent' && styles.agentAvatar]}>
                                        <Text style={styles.avatarText}>{item.sender === 'agent' ? '👨‍💼' : '🌸'}</Text>
                                    </View>
                                )}
                                <View style={[
                                    styles.bubble,
                                    item.sender === 'user' ? styles.userBubble : item.sender === 'agent' ? styles.agentBubble : styles.botBubble,
                                    item.sender === 'system' && styles.systemBubble
                                ]}>
                                    {item.text ? (
                                        <Text style={[
                                            styles.messageText,
                                            item.sender === 'user' && { color: '#fff' },
                                            item.sender === 'system' && { fontStyle: 'italic', fontSize: 12, color: '#666' }
                                        ]}>
                                            {item.text}
                                        </Text>
                                    ) : null}
                                    <Text style={[styles.tsText, item.sender === 'user' && { color: 'rgba(255,255,255,0.7)' }]}>
                                        {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />

                    {/* Input Area Grouped */}
                    <View style={styles.footerContainer}>
                        {/* Quick suggestion chips */}
                        {suggestions.length > 0 && (
                            <View style={styles.suggestionsWrap}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {suggestions.map((item, idx) => (
                                        <TouchableOpacity key={idx} onPress={() => send(item)} style={styles.suggestionChip}>
                                            <Text style={styles.suggestionText}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.bottomActions}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="Nhắn tin cho shop..."
                                    value={input}
                                    onChangeText={setInput}
                                    style={styles.input}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity
                                    onPress={() => send(input)}
                                    disabled={sending || input.trim().length === 0}
                                    style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
                                >
                                    <Text style={styles.sendBtnText}>{sending ? '...' : 'Gửi'}</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={requestExpert} style={styles.expertBtn}>
                                <Text style={styles.expertBtnText}>Kết nối chuyên gia 👨‍💼</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
function generateProductReply(userText: string, product: ProductData | null) {
    const t = (userText || '').toLowerCase();
    if (!product) return sample([
        'Xin lỗi, tôi chưa có thông tin sản phẩm. Bạn muốn tôi liên hệ chuyên viên giúp không?',
        'Mình chưa có dữ liệu này — bạn muốn gửi yêu cầu cho chuyên gia không?'
    ]);

    // helper to sample varied templates
    const templates = {
        ingredients: [
            `Thành phần chính: ${product.ingredients || 'Chưa có dữ liệu chi tiết về thành phần.'}`,
            `${product.name} bao gồm: ${product.ingredients || 'thông tin thành phần chưa được cung cấp.'}`
        ],
        price: [
            `Giá hiện tại: ${product.price || 'Liên hệ để biết giá'}`,
            `${product.name} có mức giá ${product.price || 'vui lòng liên hệ'}. Bạn có cần mã giảm giá không?`
        ],
        use: [
            `${product.description || 'Chưa có mô tả chi tiết.'} Hướng dẫn sử dụng: đọc trên bao bì hoặc yêu cầu chuyên gia để xác minh.`,
            `Công dụng chính: ${product.description ? product.description.split('.').slice(0, 2).join('. ') + '.' : 'chưa rõ'}`
        ],
        compare: [
            `Bạn muốn so sánh ${product.name} với sản phẩm nào? Gửi tên sản phẩm để tôi so sánh chi tiết.`,
            `Mình có thể so sánh về giá, thành phần và công dụng — bạn muốn so sánh tiêu chí nào?`
        ],
        expiry: [
            'Thông tin hạn sử dụng thường in trên bao bì. Nếu bạn muốn, tôi có thể yêu cầu chuyên viên kiểm tra và phản hồi.',
            'Hạn dùng: kiểm tra trên hộp sản phẩm hoặc gửi yêu cầu xác minh cho chúng tôi.'
        ]
    } as any;

    if (t.includes('thành phần') || t.includes('ingredient') || t.includes('ingredients')) return sample(templates.ingredients);
    if (t.includes('giá') || t.includes('price')) return sample(templates.price);
    if (t.includes('công dụng') || t.includes('tác dụng') || t.includes('use')) return sample(templates.use);
    if (t.includes('so sánh') || t.includes('better') || t.includes('loại nào')) return sample(templates.compare);
    if (t.includes('hạn sử dụng') || t.includes('expiry') || t.includes('hạn dùng')) return sample(templates.expiry);

    // generic fallback with varied phrasing and a call-to-action
    const fallbacks = [
        `${product.name}: ${product.description ? product.description.substring(0, 160) + '...' : 'Chưa có mô tả đầy đủ.'} Bạn muốn biết thêm về thành phần, giá hay hướng dẫn sử dụng?`,
        `Đây là thông tin tóm tắt của ${product.name}. Giá: ${product.price || 'Liên hệ'}. Nếu cần tư vấn chuyên sâu, nhấn 'Yêu cầu tư vấn chuyên gia'.`,
        `Mình có thể hỗ trợ: thành phần, công dụng, so sánh, hạn dùng hoặc hướng dẫn sử dụng. Bạn muốn hỏi gì trước?`
    ];
    return sample(fallbacks);
}

function sample(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    headerRow: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        elevation: 10,
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    thumbWrapper: {
        padding: 2,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    productThumb: { width: 44, height: 44, borderRadius: 10 },
    productThumbPlaceholder: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
    closeBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    listContent: { padding: 16, paddingBottom: 200 },
    messageRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start' },
    rowLeft: { justifyContent: 'flex-start' },
    rowRight: { justifyContent: 'flex-end' },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 8, elevation: 2 },
    agentAvatar: { backgroundColor: '#E3F2FD' },
    avatarText: { fontSize: 16 },

    bubble: { maxWidth: '80%', padding: 12, borderRadius: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
    userBubble: { backgroundColor: AppColors.primary, borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
    agentBubble: { backgroundColor: '#FFF', borderLeftWidth: 4, borderLeftColor: '#4CAF50', borderBottomLeftRadius: 4 },
    systemBubble: { backgroundColor: 'transparent', alignSelf: 'center', maxWidth: '100%', elevation: 0 },
    messageText: { color: '#2D3436', fontSize: 15, lineHeight: 20 },
    tsText: { fontSize: 9, color: '#A0A0A0', marginTop: 6, textAlign: 'right' },

    footerContainer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: Platform.OS === 'ios' ? 30 : 15, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    suggestionsWrap: { paddingVertical: 15, paddingHorizontal: 15 },
    suggestionChip: { backgroundColor: '#F1F2F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E1E4E8' },
    suggestionText: { color: '#444', fontSize: 13, fontWeight: '500' },

    bottomActions: { paddingHorizontal: 15 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F2F6', borderRadius: 25, paddingHorizontal: 15, marginBottom: 12 },
    input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },
    sendBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
    sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    expertBtn: { backgroundColor: '#F8F9FA', padding: 14, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: AppColors.primary, borderStyle: 'dashed' },
    expertBtnText: { color: AppColors.primary, fontWeight: '800', fontSize: 14 }
});