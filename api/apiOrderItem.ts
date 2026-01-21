import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu nhận về từ GET OrderItem
 * Khớp 100% với JSON kết quả của bạn
 */
export interface OrderItemData {
  id: number;
  order: string;
  order_item_id: string; // Thường là Formula hoặc ID định danh
  order_id: BaserowLink[]; 
  product_id: number;
  product_name: string;
  price: string;         // Decimal string (ví dụ: "250.00")
  quantity: number;
  total: string;         // Decimal string
  image_url: string;
  product_size_id: BaserowLink[];
  size_ml: BaserowLink[];
}

/**
 * Payload để tạo mới một Order Item (POST)
 */
export interface CreateOrderItemPayload {
  // Đối với Link Row, chỉ gửi mảng chứa ID (number[])
  order_id?: number[];
  
  product_id: number;
  product_name: string;
  price: string | number;
  quantity: number;
  image_url?: string;
  
  // Lưu ý: Nếu 'total' và 'order_item_id' là Formula, hãy để dấu ? 
  // và KHÔNG gửi chúng trong payload thực tế.
  total?: string | number;
  order_item_id?: string;

  product_size_id?: number[];
  size_ml?: number[];
}

// --- API Functions ---

const getOrderItemUrl = () => `/${CONFIG.ORDER_ITEM_TABLE_ID}/?user_field_names=true`;

const apiOrderItem = {
  /**
   * Tạo chi tiết món hàng trong đơn
   */
  createOrderItem: async (data: CreateOrderItemPayload): Promise<OrderItemData> => {
    const response = await axiosClient.post(getOrderItemUrl(), data);
    return response.data;
  },

  /**
   * Lấy danh sách items theo bảng Order chính (Dùng filter)
   */
  getItemsByOrder: async (orderId: number): Promise<OrderItemData[]> => {
    const filters = JSON.stringify({
      filter_type: "AND",
      filters: [{ type: "link_row_has", field: "order_id", value: orderId.toString() }]
    });
    const response = await axiosClient.get(getOrderItemUrl(), { params: { filters } });
    return response.data.results;
  }
};

export default apiOrderItem;