import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

export interface BaserowSelect {
  id: number;
  value: string;
  color: string;
}

export interface BaserowLink {
  id: number;
  value: string;
}

export interface OrderData {
  id: number;
  order: string;
  order_number: string;
  status: BaserowSelect;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  payment_method: BaserowSelect;
  payment_status: BaserowSelect;
  delivery_address: string;
  note: string;
  created_at: string;
  updated_at: string;
  order_items: BaserowLink[];
  // Baserow image column now stores a single URL string
  image?: string;
  Payment: BaserowLink[]; // Chữ P viết hoa theo JSON
}

export interface CreateOrderPayload {
  order_number: string;
  // Truyền String (Value) hoặc Number (ID) của Option
  status: string | number;
  payment_method: string | number;
  payment_status: string | number;
  delivery_address: string;
  note?: string;
  order_items: number[];
  // image should be a single primitive reference (file name or URL) or ID
  image?: string | number;

  // Các trường số gửi lên dưới dạng string hoặc number
  // Nếu là cột Formula trong Baserow thì hãy thêm dấu ? (optional) 
  // và KHÔNG gửi trong payload thực tế
  subtotal?: string | number;
  shipping_cost?: string | number;
  discount?: string | number;
  total?: string | number;
}

export interface BaserowResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- API Functions ---

const getOrderUrl = () => `/${CONFIG.ORDER_TABLE_ID}/?user_field_names=true`;

const apiOrder = {
  createOrder: async (data: CreateOrderPayload): Promise<OrderData> => {
    const response = await axiosClient.post(getOrderUrl(), data);
    return response.data;
  },

  getAllOrders: async (params?: any): Promise<BaserowResponse<OrderData>> => {
    const response = await axiosClient.get(getOrderUrl(), { params });
    return response.data;
  },
  updateOrder: async (id: number, data: Partial<CreateOrderPayload>): Promise<OrderData> => {
    const url = `/${CONFIG.ORDER_TABLE_ID}/${id}/?user_field_names=true`;
    const response = await axiosClient.patch(url, data); // Sử dụng patch để cập nhật một phần
    return response.data;
  },

  getOrderDetail: async (id: number): Promise<OrderData> => {
    const response = await axiosClient.get(`/${CONFIG.ORDER_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },
  deleteOrder: async (id: number): Promise<void> => {
    const url = `/${CONFIG.ORDER_TABLE_ID}/${id}/?user_field_names=true`;
    await axiosClient.delete(url);
  },
};

export default apiOrder;