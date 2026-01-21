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

export interface BaserowFile {
  url: string;
  name: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  uploaded_at: string;
}

/**
 * Cấu trúc dữ liệu Payment nhận về từ Baserow (GET)
 * Khớp 100% với JSON bạn cung cấp
 */
export interface PaymentData {
  id: number;
  Name: string;
  "Order Link": BaserowLink[];
  "Transaction ID": string;
  Amount: string; // Decimal string
  "Payment Method": BaserowSelect;
  "Payment Date": string;
  Status: BaserowSelect;
  "Payer Note": string;
  "Proof Image": BaserowFile[];
  "Payment Method (VN)": BaserowSelect;
  "Status (VN)": BaserowSelect;
}

/**
 * Payload để tạo mới một bản ghi thanh toán (POST)
 */
export interface CreatePaymentPayload {
  Name: string;
  "Order Link": number[]; // Mảng ID của đơn hàng
  "Transaction ID": string;
  Amount: string | number;
  
  // Gửi tên Option (string) hoặc ID (number)
  "Payment Method": string | number; 
  Status: string | number;
  
  "Payment Date": string; // Định dạng ISO 8601
  "Payer Note"?: string;
  
  // File thường upload riêng rồi lấy tên gửi lên, 
  // hoặc để trống nếu chưa có ảnh bằng chứng
  "Proof Image"?: any[]; 
}

// --- API Functions ---

const getPaymentUrl = () => `/${CONFIG.PAYMENT_TABLE_ID}/?user_field_names=true`;

const apiPayment = {
  /**
   * Tạo bản ghi thanh toán khi khách chuyển khoản xong
   */
  createPayment: async (data: CreatePaymentPayload): Promise<PaymentData> => {
    const response = await axiosClient.post(getPaymentUrl(), data);
    return response.data;
  },

  /**
   * Lấy lịch sử thanh toán của một đơn hàng
   */
  getPaymentsByOrder: async (orderId: number): Promise<PaymentData[]> => {
    const filters = JSON.stringify({
      filter_type: "AND",
      filters: [
        { type: "link_row_has", field: "Order Link", value: orderId.toString() }
      ]
    });
    const response = await axiosClient.get(getPaymentUrl(), { params: { filters } });
    return response.data.results;
  }
};

export default apiPayment;