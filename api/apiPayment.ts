import { BaserowSelect } from './apiOrder';
import { BaserowLink, BaserowResponse } from './apiProduct';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc dữ liệu Thanh toán thực tế từ bảng 766850
 * Lưu ý: Tên trường khớp chính xác với Baserow (PascalCase và có khoảng trắng)
 */
export interface PaymentData {
  id: number;
  order: string;
  'Payment ID': string;   // PAY-1001
  Orders: BaserowLink[];  // Liên kết bảng Orders
  Order: BaserowLink[];   // Trường liên kết Order (thường trùng với Orders)
  Amount: string;         // API trả về dạng chuỗi "199.99"
  Method: BaserowSelect;  // Object chứa value (Credit Card, PayPal...) và color
  'Paid At': string;      // 2023-10-05T12:00:00Z
  Status: BaserowSelect;  // Object chứa value (Pending, Completed, Failed) và color
}

// --- API Functions ---

const getPaymentUrl = () => `/${CONFIG.PAYMENT_TABLE_ID}/?user_field_names=true`;

const apiPayment = {
  /**
   * 1. Lấy tất cả danh sách các giao dịch thanh toán
   * @returns Trả về BaserowResponse chứa mảng kết quả PaymentData[]
   */
  getAllPayments: async (): Promise<BaserowResponse<PaymentData>> => {
    const response = await axiosClient.get(getPaymentUrl());
    return response.data;
  },

  /**
   * 2. Lấy chi tiết một giao dịch thanh toán theo ID
   * @param id ID của dòng trong Baserow
   */
  getPaymentDetail: async (id: number): Promise<PaymentData> => {
    const response = await axiosClient.get(`/${CONFIG.PAYMENT_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Lấy danh sách thanh toán của một Đơn hàng cụ thể (Helper)
   * @param orderId ID của đơn hàng từ bảng Order
   */
  getPaymentsByOrder: async (orderId: number): Promise<BaserowResponse<PaymentData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [{ type: "link_row_has", field: "Order", value: orderId.toString() }]
    }));
    const response = await axiosClient.get(`${getPaymentUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 4. Ghi nhận thanh toán mới
   * @param data Dữ liệu thanh toán (ví dụ: { Order: [1], Amount: "199.99", Method: 4683275 })
   */
  createPayment: async (data: Partial<PaymentData>): Promise<PaymentData> => {
    const response = await axiosClient.post(`${getPaymentUrl()}`, data);
    return response.data;
  }
};

export default apiPayment;