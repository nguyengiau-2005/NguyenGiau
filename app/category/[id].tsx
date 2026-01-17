import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Import APIs
import apiCategory, { CategoryData } from '@/api/apiCategory';
import apiProduct, { ProductData } from '@/api/apiProduct';

export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const paramId = Array.isArray(id) ? id[0] : id;

    // State for data
    const [category, setCategory] = useState<CategoryData | null>(null);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI states
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');

    // Fetch category and products
    useEffect(() => {
        const fetchCategoryData = async () => {
            if (!paramId) return;

            try {
                setLoading(true);
                const cid = Number(paramId);

                // Fetch category detail
                const categoryData = await apiCategory.getCategoryDetail(cid);
                setCategory(categoryData);

                // Fetch products in this category
                const productsData = await apiProduct.getProductsByCategory(cid);
                setProducts(productsData.results || []);

            } catch (err) {
                console.error('Error fetching category:', err);
                setError('Không thể tải thông tin danh mục');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [paramId]);

    // Filter and sort products
    const filteredProducts = products
        .filter(product =>
            (product.name || '').toLowerCase().includes(searchText.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return Number(a.price) - Number(b.price);
                case 'rating':
                    return Number(b.rating) - Number(a.rating);
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    const renderProductCard = ({ item }: { item: ProductData }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image
                source={{ uri: item.image?.[0]?.url || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.productPrice}>
                    {Number(item.price).toLocaleString('vi-VN', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3
                    })}đ
                </Text>

                <Text style={styles.productRating}>
                    ⭐ {Number(item.rating) || 5.0}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Đang tải danh mục...</Text>
            </View>
        );
    }

    if (error || !category) {
        return (
            <View style={styles.errorContainer}>
                <Text>{error || 'Danh mục không tồn tại'}</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[AppColors.primary, AppColors.primaryLight]}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{category.name}</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color="#999" />
                    <TextInput
                        placeholder="Tìm sản phẩm trong danh mục..."
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* Sort Options */}
                <View style={styles.sortContainer}>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                        onPress={() => setSortBy('name')}
                    >
                        <Text style={[styles.sortText, sortBy === 'name' && styles.sortTextActive]}>
                            Tên
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
                        onPress={() => setSortBy('price')}
                    >
                        <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>
                            Giá
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
                        onPress={() => setSortBy('rating')}
                    >
                        <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>
                            Đánh giá
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                {category.description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>{category.description}</Text>
                    </View>
                )}

                <Text style={styles.productCount}>
                    {filteredProducts.length} sản phẩm
                </Text>

                {filteredProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchText ? 'Không tìm thấy sản phẩm nào' : 'Danh mục này chưa có sản phẩm'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderProductCard}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.productGrid}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.productList}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf9f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#faf9f8',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#faf9f8',
    },
    backButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: AppColors.primary,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        paddingTop: 44,
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    sortContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    sortButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    sortButtonActive: {
        backgroundColor: '#fff',
    },
    sortText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    sortTextActive: {
        color: AppColors.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    descriptionContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    productCount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    productList: {
        paddingBottom: 20,
    },
    productGrid: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 140,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: AppColors.primary,
        marginBottom: 4,
    },
    productRating: {
        fontSize: 12,
        color: '#666',
    },
});