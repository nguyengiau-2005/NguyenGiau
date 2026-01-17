import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc Single Select (Reused from apiUser)
 * Dùng cho: status, payment_method, payment_status
 */
export interface BaserowSelect {
  id: number;
  value: string;
  color: string;
}

/**
 * Cấu trúc liên kết bảng (Reused)
 * Dùng cho: order_items
 */
export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu Đơn hàng (Order)
 * Khớp với JSON: order_number, status, total, order_items...
 */
export interface OrderData {
  id: number;
  order: string;
  order_number: string;      // Mã đơn hàng (VD: #ORD-001)
  status: BaserowSelect;     // Trạng thái đơn (Mới, Đang giao, Hoàn thành...)
  
  // Các trường tiền tệ Baserow trả về dạng string
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  
  payment_method: BaserowSelect; // COD, Chuyển khoản...
  payment_status: BaserowSelect; // Chưa thanh toán, Đã thanh toán...
  
  delivery_address: string;
  note: string;
  
  created_at: string;
  updated_at: string;
  
  order_items: BaserowLink[]; // Liên kết sang bảng chi tiết đơn hàng (Order Items)
}

/**
 * Payload để tạo đơn hàng mới (Khi POST)
 * Baserow yêu cầu format khác một chút khi gửi dữ liệu lên
 */
export interface CreateOrderPayload {
  order_number: string;
  status?: string | number;         // Gửi value (string) hoặc ID (number)
  subtotal: number | string;
  shipping_cost: number | string;
  discount: number | string;
  total: number | string;
  payment_method: string | number;
  payment_status: string | number;
  delivery_address: string;
  note?: string;
  order_items: number[];            // Mảng ID của các dòng trong bảng Order Items
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

// Base URL cho table Order
const getOrderUrl = () => `/${CONFIG.ORDER_TABLE_ID}/?user_field_names=true`;

const apiOrder = {
  /**
   * 1. Lấy danh sách đơn hàng (Thường dùng cho trang Admin quản lý đơn)
   * @param params sort, page, size, search
   */
  getAllOrders: async (params?: any): Promise<BaserowResponse<OrderData>> => {
    const response = await axiosClient.get(getOrderUrl(), { params });
    return response.data;
  },

  /**
   * 2. Lấy chi tiết đơn hàng theo ID
   */
  getOrderDetail: async (id: number): Promise<OrderData> => {
    const response = await axiosClient.get(`/${CONFIG.ORDER_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Tạo đơn hàng mới (Checkout)
   * Lưu ý: Trước khi gọi hàm này, bạn thường phải tạo các dòng trong bảng "Order Items" trước,
   * lấy được ID của chúng, rồi truyền vào mảng `order_items` ở đây.
   */
  createOrder: async (data: CreateOrderPayload): Promise<OrderData> => {
    // Khi tạo, URL cần query user_field_names=true để map key chính xác
    const response = await axiosClient.post(getOrderUrl(), data);
    return response.data;
  },

  /**
   * 4. Cập nhật trạng thái đơn hàng (Dùng cho Admin/Shipper)
   * Ví dụ: Cập nhật status từ "Mới" -> "Đang giao"
   */
  updateOrderStatus: async (id: number, statusValue: string): Promise<OrderData> => {
    const url = `/${CONFIG.ORDER_TABLE_ID}/${id}/?user_field_names=true`;
    // Với field Single Select, chỉ cần gửi value string lên là Baserow tự map
    const response = await axiosClient.patch(url, { status: statusValue });
    return response.data;
  },

  /**
   * 5. Lấy đơn hàng theo Mã đơn (Order Number)
   * Giúp user tra cứu đơn hàng: /order-tracking/ORD-123
   */
  getOrderByCode: async (orderNumber: string): Promise<OrderData | null> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { type: "equal", field: "order_number", value: orderNumber }
      ]
    }));
    
    const response = await axiosClient.get<BaserowResponse<OrderData>>(`${getOrderUrl()}&filters=${filterParams}`);
    
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  }
};

export default apiOrder;