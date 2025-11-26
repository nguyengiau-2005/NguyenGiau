import { useState, CSSProperties } from 'react';
import { Home, ShoppingBag, Heart, User } from 'lucide-react';
import { LoginScreen } from '../../components/drink-shop/LoginScreen';
import { HomeView } from '../../components/drink-shop/HomeView';
import { CartView } from '../../components/drink-shop/CartView';
import { FavoritesView } from '../../components/drink-shop/FavoritesView';
import { ProfileView } from '../../components/drink-shop/ProfileView';
import { ProductDetail } from '../../components/drink-shop/ProductDetail';
import { CheckoutView } from '../../components/drink-shop/CheckoutView';
import { OrdersView } from '../../components/drink-shop/OrdersView';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  sold: number;
}

export interface CartItem extends Product {
  quantity: number;
  size: 'S' | 'M' | 'L';
  ice: number;
  sugar: number;
}

export type Screen = 'home' | 'cart' | 'favorites' | 'profile' | 'product' | 'checkout' | 'orders';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'cart' | 'favorites' | 'profile'>('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const navigateTo = (screen: Screen, product?: Product) => {
    setCurrentScreen(screen);
    if (product) setSelectedProduct(product);
    if (['home', 'cart', 'favorites', 'profile'].includes(screen)) setActiveTab(screen as any);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id && i.size === item.size && i.ice === item.ice && i.sugar === item.sugar);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += item.quantity;
        return newCart;
      }
      return [...prev, item];
    });
  };

  const updateCartItem = (index: number, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) return prev.filter((_, i) => i !== index);
      const newCart = [...prev];
      newCart[index].quantity = quantity;
      return newCart;
    });
  };

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
  const toggleFavorite = (id: number) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const clearCart = () => setCart([]);

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ==== STYLE OBJECTS ====
  const appWrapper: CSSProperties = { width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: 16 };
  const containerStyle: CSSProperties = { width: '100%', maxWidth: 400, height: 812, borderRadius: 48, background: '#f9fafb', boxShadow: '0 25px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
  const statusBarStyle: CSSProperties = { height: 48, background: 'linear-gradient(to right, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', color: 'white', fontWeight: 600 };
  const contentAreaStyle: CSSProperties = { flex: 1, overflowY: 'auto', background: '#f9fafb' };

  const bottomNavStyle: CSSProperties = { height: 80, display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #e5e7eb', background: 'white' };
  const navButtonStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    color: active ? '#f97316' : '#9ca3af',
    fontSize: 12,
    border: 'none',
    background: 'none',
  });
  const badgeStyle: CSSProperties = { position: 'absolute', top: -4, right: -8, width: 20, height: 20, borderRadius: '50%', background: 'red', color: 'white', fontSize: 10, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' };

  return (
    <div style={appWrapper}>
      <div style={containerStyle}>
        {/* Status Bar */}
        <div style={statusBarStyle}>
          <div>9:41</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 4, height: 4, borderRadius: 999, background: 'white' }}></div>
            <div style={{ width: 4, height: 4, borderRadius: 999, background: 'white' }}></div>
            <div style={{ width: 4, height: 4, borderRadius: 999, background: 'white' }}></div>
          </div>
        </div>

        {/* Content */}
        <div style={contentAreaStyle}>
          {currentScreen === 'home' && <HomeView onNavigate={navigateTo} favorites={favorites} onToggleFavorite={toggleFavorite} />}
          {currentScreen === 'cart' && <CartView cart={cart} onUpdateItem={updateCartItem} onRemoveItem={removeFromCart} onNavigate={navigateTo} />}
          {currentScreen === 'favorites' && <FavoritesView favorites={favorites} onNavigate={navigateTo} onToggleFavorite={toggleFavorite} />}
          {currentScreen === 'profile' && <ProfileView onLogout={() => setIsLoggedIn(false)} onNavigate={navigateTo} />}
          {currentScreen === 'product' && selectedProduct && <ProductDetail product={selectedProduct} onBack={() => navigateTo('home')} onAddToCart={addToCart} isFavorite={favorites.includes(selectedProduct.id)} onToggleFavorite={toggleFavorite} />}
          {currentScreen === 'checkout' && <CheckoutView cart={cart} onBack={() => navigateTo('cart')} onComplete={() => { clearCart(); navigateTo('orders'); }} />}
          {currentScreen === 'orders' && <OrdersView onBack={() => navigateTo('profile')} />}
        </div>

        {/* Bottom Navigation */}
        {!['product', 'checkout', 'orders'].includes(currentScreen) && (
          <div style={bottomNavStyle}>
            <button style={navButtonStyle(activeTab === 'home')} onClick={() => navigateTo('home')}><Home /><span>Trang chủ</span></button>
            <button style={{ ...navButtonStyle(activeTab === 'cart'), position: 'relative' }} onClick={() => navigateTo('cart')}>
              <ShoppingBag />
              {cartItemCount > 0 && <div style={badgeStyle}>{cartItemCount}</div>}
              <span>Giỏ hàng</span>
            </button>
            <button style={navButtonStyle(activeTab === 'favorites')} onClick={() => navigateTo('favorites')}><Heart /><span>Yêu thích</span></button>
            <button style={navButtonStyle(activeTab === 'profile')} onClick={() => navigateTo('profile')}><User /><span>Tài khoản</span></button>
          </div>
        )}
      </div>
    </div>
  );
}
