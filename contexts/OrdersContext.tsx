import React, { createContext, ReactNode, useState } from 'react';
import { CartItem } from './CartContext';

export type Order = {
  id: string;
  date: string;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  total: number;
  itemCount: number;
  paymentRef?: string;
  subtotal?: number;
  shippingCost?: number;
  shippingAddress?: { name: string; phone: string; address: string };
  shippingMethod?: string;
  paymentMethod?: string;
  notes?: string;
  voucherCode?: string;
  voucherDiscount?: number;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (items: CartItem[], status?: Order['status'], paymentRef?: string, orderDetails?: Partial<Order>) => Order;
  clearOrders: () => void;
};

export const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (items: CartItem[], status: Order['status'] = 'Pending', paymentRef?: string, orderDetails?: Partial<Order>) => {
    const itemCount = items.reduce((s, it) => s + it.qty, 0);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status,
      items,
      total,
      itemCount,
      paymentRef,
      ...orderDetails,
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const clearOrders = () => setOrders([]);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, clearOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
