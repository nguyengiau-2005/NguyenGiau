import React, { createContext, ReactNode, useState } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: any;
  volume?: string;    // Thêm hoặc cập nhật dòng này
  sizeId?: number;    // <--- QUAN TRỌNG: Thêm dòng này để TS cho phép lưu ID của size
};

type CartContextType = {
  cart: CartItem[];
  selectedCheckoutItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, volume?: string) => void;
  updateQty: (id: number, qty: number, volume?: string) => void;
  updateVolume: (id: number, newVolume: string, currentVolume?: string) => void;
  clearCart: () => void;
  setSelectedCheckoutItems: (items: CartItem[]) => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCheckoutItems, setSelectedCheckoutItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    const volume = item.volume ?? '50ml';
    const existingItem = cart.find(cartItem => cartItem.id === item.id && (cartItem.volume ?? '50ml') === volume);
    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === item.id && (cartItem.volume ?? '50ml') === volume
            ? { ...cartItem, qty: cartItem.qty + item.qty }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, volume }]);
    }
  };

  const removeFromCart = (id: number, volume?: string) => {
    if (volume) {
      setCart(cart.filter(item => !(item.id === id && (item.volume ?? '50ml') === volume)));
    } else {
      setCart(cart.filter(item => item.id !== id));
    }
  };

  const updateQty = (id: number, qty: number, volume?: string) => {
    if (qty <= 0) {
      removeFromCart(id, volume);
    } else {
      setCart(
        cart.map(item =>
          item.id === id && (volume ? (item.volume ?? '50ml') === volume : true) ? { ...item, qty } : item
        )
      );
    }
  };

  const updateVolume = (id: number, newVolume: string, currentVolume?: string) => {
    const oldVolume = currentVolume ?? '50ml';
    const sourceIndex = cart.findIndex(item => item.id === id && (item.volume ?? '50ml') === oldVolume);
    if (sourceIndex === -1) return;
    const sourceItem = cart[sourceIndex];

    const existingIndex = cart.findIndex(item => item.id === id && (item.volume ?? '50ml') === newVolume);
    if (existingIndex !== -1) {
      // merge quantities into existing item and remove source
      const updated = cart.map((it, idx) => {
        if (idx === existingIndex) return { ...it, qty: it.qty + sourceItem.qty };
        return it;
      }).filter((_, idx) => idx !== sourceIndex);
      setCart(updated);
    } else {
      // simply change the volume on the source item
      setCart(cart.map((it, idx) => idx === sourceIndex ? { ...it, volume: newVolume } : it));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, selectedCheckoutItems, addToCart, removeFromCart, updateQty, updateVolume, clearCart, setSelectedCheckoutItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
