import React, { createContext, ReactNode, useState } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: any;
};

type CartContextType = {
  cart: CartItem[];
  selectedCheckoutItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  setSelectedCheckoutItems: (items: CartItem[]) => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCheckoutItems, setSelectedCheckoutItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + item.qty }
            : cartItem
        )
      );
    } else {
      setCart([...cart, item]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map(item =>
          item.id === id ? { ...item, qty } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, selectedCheckoutItems, addToCart, removeFromCart, updateQty, clearCart, setSelectedCheckoutItems }}>
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
