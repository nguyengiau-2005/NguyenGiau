import { BaserowLink, BaserowResponse } from './apiProduct';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc dữ liệu Khách hàng thực tế từ bảng 766846
 * Lưu ý: Tên trường khớp chính xác với Baserow (có khoảng trắng và PascalCase)
 */
export interface CustomerData {
  id: number;
  order: string;
  Email: string;
  'First Name': string;   // Alice
  'Last Name': string;    // Smith
  Phone: string;          // 555-0123
  Address: string;        // 123 Maple Street...
  'Created At': string;   // 2023-05-14T09:30:00Z
  Orders: BaserowLink[];  // Danh sách các đơn hàng liên kết (ORD-1001,...)
}

// --- API Functions ---

const getCustomerUrl = () => `/${CONFIG.CUSTOMER_TABLE_ID}/?user_field_names=true`;

const apiCustomer = {
  /**
   * 1. Lấy tất cả danh sách khách hàng
   * @returns Trả về BaserowResponse chứa mảng kết quả CustomerData[]
   */
  getAllCustomers: async (): Promise<BaserowResponse<CustomerData>> => {
    const response = await axiosClient.get(getCustomerUrl());
    return response.data;
  },

  /**
   * 2. Lấy chi tiết một khách hàng theo ID
   * @param id ID của dòng khách hàng
   */
  getCustomerDetail: async (id: number): Promise<CustomerData> => {
    const response = await axiosClient.get(`/${CONFIG.CUSTOMER_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Tìm kiếm khách hàng theo Email (Helper)
   * Sử dụng filter của Baserow để tìm chính xác khách hàng
   */
  getCustomerByEmail: async (email: string): Promise<BaserowResponse<CustomerData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [{ type: "equal", field: "Email", value: email }]
    }));
    const response = await axiosClient.get(`${getCustomerUrl()}&filters=${filterParams}`);
    return response.data;
  }
};

export default apiCustomer;