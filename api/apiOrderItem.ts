import { BaserowLink, BaserowResponse } from './apiProduct';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc dữ liệu Chi tiết mục đơn hàng thực tế từ bảng 766848
 * Lưu ý: Tên trường khớp chính xác với Baserow (PascalCase và có khoảng trắng)
 */
export interface OrderItemData {
  id: number;
  order: string;
  Item: string;           // Tên hiển thị của mục (thường là tên sản phẩm)
  Order: BaserowLink[];   // Liên kết đến bảng Đơn hàng (ví dụ: ORD-1001)
  Product: BaserowLink[]; // Liên kết đến bảng Sản phẩm
  Quantity: string;       // API trả về dạng chuỗi "2", "1"...
  'Unit Price': string;   // API trả về dạng chuỗi "19.99"
  'Total Price': string;  // API trả về dạng chuỗi "39.98"
}

// --- API Functions ---

const getOrderItemUrl = () => `/${CONFIG.ORDER_ITEM_TABLE_ID}/?user_field_names=true`;

const apiOrderItem = {
  /**
   * 1. Lấy tất cả danh sách các mục đơn hàng
   * @returns Trả về BaserowResponse chứa mảng kết quả OrderItemData[]
   */
  getAllOrderItems: async (): Promise<BaserowResponse<OrderItemData>> => {
    const response = await axiosClient.get(getOrderItemUrl());
    return response.data;
  },

  /**
   * 2. Lấy chi tiết một mục đơn hàng theo ID
   * @param id ID của dòng trong Baserow
   */
  getOrderItemDetail: async (id: number): Promise<OrderItemData> => {
    const response = await axiosClient.get(`/${CONFIG.ORDER_ITEM_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Lấy danh sách các mục thuộc về một Đơn hàng cụ thể (Helper)
   * @param orderId ID của đơn hàng từ bảng Order
   */
  getOrderItemsByOrder: async (orderId: number): Promise<BaserowResponse<OrderItemData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [{ type: "link_row_has", field: "Order", value: orderId.toString() }]
    }));
    const response = await axiosClient.get(`${getOrderItemUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 4. Tạo mục đơn hàng mới
   * @param data Dữ liệu mục đơn hàng (ví dụ: { Order: [1], Product: [2], Quantity: "2" })
   */
  createOrderItem: async (data: Partial<OrderItemData>): Promise<OrderItemData> => {
    const response = await axiosClient.post(`${getOrderItemUrl()}`, data);
    return response.data;
  }
};

export default apiOrderItem;