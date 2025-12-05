import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Image } from 'expo-image';
import { Heart, ShoppingCart } from 'lucide-react-native';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

type FavoriteItem = {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
};

export default function Favorites() {
  const { addToCart } = useCart();
  const { favorites, removeFavorite } = useFavorites();

  const handleAddToCart = (item: FavoriteItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      img: item.image,
    });
    Alert.alert('Thành công', `${item.name} đã được thêm vào giỏ hàng`);
  };

  const renderFavoriteCard = ({ item }: { item: FavoriteItem }) => (
    <View style={styles.cardWrapper}>
      <ThemedView style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => removeFavorite(item.id)}
          >
            <Heart size={20} color="#ff6699" fill="#ff6699" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.name} numberOfLines={2}>
            {item.name}
          </ThemedText>

          <View style={styles.ratingRow}>
            <ThemedText style={styles.rating}>⭐ {item.rating}</ThemedText>
          </View>

          <View style={styles.footer}>
            <ThemedText type="defaultSemiBold" style={styles.price}>
              ₫{item.price.toLocaleString('vi-VN')}
            </ThemedText>
            <TouchableOpacity 
              style={styles.addCartBtn}
              onPress={() => handleAddToCart(item)}
            >
              <ShoppingCart size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE8ED', dark: '#1a1a1a' }}
      headerImage={
        <View style={styles.headerWrapper}>
          <Heart size={60} color="#ff6699" fill="#ff6699" />
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Yêu Thích
          </ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Heart size={80} color="#ff6699" style={{ opacity: 0.3 }} />
            <ThemedText type="title" style={styles.emptyTitle}>
              Chưa có sản phẩm yêu thích
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Bắt đầu thêm sản phẩm vào danh sách yêu thích của bạn
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText style={styles.countText}>
              {favorites.length} sản phẩm yêu thích
            </ThemedText>
            <FlatList
              data={favorites}
              renderItem={renderFavoriteCard}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
            />
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    alignItems: 'center' as const,
    paddingVertical: 40,
    gap: 12,
  },
  headerTitle: {
    color: '#ff6699',
    fontFamily: Fonts.rounded,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  countText: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden' as const,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  favoriteBtn: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    marginBottom: 6,
    height: 32,
  },
  ratingRow: {
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  price: {
    color: '#ff6699',
    fontSize: 14,
  },
  addCartBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ff6699',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyContainer: {
    alignItems: 'center' as const,
    paddingVertical: 80,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center' as const,
  },
});
