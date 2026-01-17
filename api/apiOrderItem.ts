import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc liên kết bảng (Reused)
 * Dùng cho: order_id, product_size_id, size_ml
 */
export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu Chi tiết đơn hàng (Order Item)
 * Khớp với JSON: order_item_id, product_name, price, quantity...
 */
export interface OrderItemData {
  id: number;
  order: string;
  order_item_id: string;      // Mã riêng của dòng này (nếu có)
  
  order_id: BaserowLink[];    // Liên kết về đơn hàng cha (Order)
  
  product_id: number;         // ID sản phẩm (Theo JSON là số, không phải Link Row)
  product_name: string;       // Tên sản phẩm lưu tĩnh (Snapshot)
  
  price: string;              // Giá tại thời điểm mua
  quantity: number;
  total: string;              // Thành tiền (price * quantity)
  
  image_url: string;          // Link ảnh (Chuỗi text, không phải object File)
  
  product_size_id: BaserowLink[]; // Link tới bảng Size
  size_ml: BaserowLink[];     // Link/Lookup hiển thị ml
}

/**
 * Payload để tạo mới một dòng Order Item
 * Dùng khi user nhấn "Đặt hàng", ta loop qua giỏ hàng và tạo từng dòng này.
 */
export interface CreateOrderItemPayload {
  order_item_id?: string;
  order_id?: number[];        // Có thể chưa có ngay lúc tạo item nếu flow là tạo item trước
  product_id: number;
  product_name: string;
  price: number | string;
  quantity: number;
  total: number | string;
  image_url?: string;
  product_size_id?: number[]; // Mảng ID của size
}

/**
 * Cấu trúc phản hồi phân trang
 */
export interface BaserowResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- API Functions ---

// Base URL cho table Order Item
const getOrderItemUrl = () => `/${CONFIG.ORDER_ITEM_TABLE_ID}/?user_field_names=true`;

const apiOrderItem = {
  /**
   * 1. Lấy tất cả các items (Ít dùng trực tiếp, thường dùng filter theo Order)
   */
  getAllOrderItems: async (params?: any): Promise<BaserowResponse<OrderItemData>> => {
    const response = await axiosClient.get(getOrderItemUrl(), { params });
    return response.data;
  },

  /**
   * 2. Tạo một Order Item mới
   * Đây là bước quan trọng nhất trong loop xử lý giỏ hàng
   */
  createOrderItem: async (data: CreateOrderItemPayload): Promise<OrderItemData> => {
    const response = await axiosClient.post(getOrderItemUrl(), data);
    return response.data;
  },

  /**
   * 3. Lấy danh sách item thuộc về một Đơn hàng cụ thể
   * Dùng để hiển thị chi tiết đơn hàng (Order Detail Page)
   * @param orderId ID của dòng trong bảng Order
   */
  getItemsByOrderId: async (orderId: number): Promise<BaserowResponse<OrderItemData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { 
          type: "link_row_has", 
          field: "order_id", 
          value: orderId.toString() 
        }
      ]
    }));
    
    const response = await axiosClient.get(`${getOrderItemUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 4. Xóa một item (Nếu cần thiết, ví dụ: Admin sửa đơn hàng)
   */
  deleteOrderItem: async (id: number): Promise<void> => {
    await axiosClient.delete(`/${CONFIG.ORDER_ITEM_TABLE_ID}/${id}/`);
  }
};

export default apiOrderItem;