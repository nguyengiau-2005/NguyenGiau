import { BaserowLink, BaserowResponse } from './apiProduct';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc cho trường Single Select trong Baserow (ví dụ: Status)
 */
export interface BaserowSelect {
  id: number;
  value: string;
  color: string;
}

/**
 * Cấu trúc dữ liệu Đơn hàng thực tế từ bảng 766847
 * Lưu ý: Các trường có khoảng trắng cần được bọc trong dấu ngoặc đơn
 */
export interface OrderData {
  id: number;
  order: string;
  'Order Number': string;   // ORD-1001
  Customer: BaserowLink[];   // Liên kết đến bảng Khách hàng (thường chứa email)
  'Order Date': string;      // 2023-10-05T10:20:00Z
  'Total Amount': string;    // "199.99" (dạng chuỗi)
  Status: BaserowSelect;     // Object chứa value và color
  Payment: BaserowLink[];    // Liên kết bảng Payment (trường cũ/phụ)
  OrderItems: BaserowLink[]; // Liên kết bảng Order Items
  Payments: BaserowLink[];   // Liên kết bảng Payments (trường chính)
}

// --- API Functions ---

const getOrderUrl = () => `/${CONFIG.ORDER_TABLE_ID}/?user_field_names=true`;

const apiOrder = {
  /**
   * 1. Lấy tất cả danh sách đơn hàng
   * @returns Trả về BaserowResponse chứa mảng kết quả OrderData[]
   */
  getAllOrders: async (): Promise<BaserowResponse<OrderData>> => {
    const response = await axiosClient.get(getOrderUrl());
    return response.data;
  },

  /**
   * 2. Lấy chi tiết một đơn hàng theo ID
   * @param id ID của dòng đơn hàng
   */
  getOrderDetail: async (id: number): Promise<OrderData> => {
    const response = await axiosClient.get(`/${CONFIG.ORDER_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Lọc đơn hàng theo Customer ID (Helper)
   * Giúp lấy lịch sử mua hàng của một khách hàng cụ thể
   */
  getOrdersByCustomer: async (customerId: number): Promise<BaserowResponse<OrderData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [{ type: "link_row_has", field: "Customer", value: customerId.toString() }]
    }));
    const response = await axiosClient.get(`${getOrderUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 4. Tạo đơn hàng mới
   * @param data Dữ liệu đơn hàng cần tạo (chú ý tên trường khớp Baserow)
   */
  createOrder: async (data: Partial<OrderData>): Promise<OrderData> => {
    const response = await axiosClient.post(`${getOrderUrl()}`, data);
    return response.data;
  }
};

export default apiOrder;