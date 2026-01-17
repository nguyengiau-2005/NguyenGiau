import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---
/**
 * Cấu trúc hình ảnh từ Baserow (Reused)
 */
export interface BaserowFile {
  url: string;
  thumbnails: {
    tiny: { url: string; width: number | null; height: number };
    small: { url: string; width: number; height: number };
  };
  visible_name: string;
  name: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width: number;
  image_height: number;
  uploaded_at: string;
}
/**
 * Cấu trúc Single Select (Reused)
 * Dùng cho: discount_type (VD: "Percentage", "Fixed Amount")
 */
export interface BaserowSelect {
  id: number;
  value: string;
  color: string;
}

/**
 * Cấu trúc liên kết bảng (Reused)
 * Dùng cho: promotion_categories (Mã này áp dụng cho danh mục nào)
 */
export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu Khuyến mãi (Promotion/Coupon)
 * Khớp với JSON: code, discount_type, min_spend, usage_limit...
 */
export interface PromotionData {
  id: number;
  order: string;
  code: string;               // Mã nhập vào (VD: "SALE50")
  name: string;               // Tên hiển thị (VD: "Siêu sale mùa hè")

  image_url: BaserowFile[];        // URL hình ảnh đại diện danh mục (Icon/Emoji)
  description: string;        // Mô tả ngắn về khuyến mãi

  discount_type: BaserowSelect; // Loại giảm giá: "Percentage" (%) hoặc "Fixed" (Tiền mặt)
  discount_value: string;     // Giá trị giảm (VD: "10.00" hoặc "50000.00")
  
  min_spend: string;          // Giá trị đơn hàng tối thiểu để áp dụng
  max_discount: string;       // Giảm tối đa (thường dùng cho loại %)
  
  start_date: string;         // Ngày bắt đầu
  end_date: string;           // Ngày kết thúc
  
  usage_limit: number;        // Giới hạn số lần dùng
  used_count: number;         // Số lần đã dùng
  
  is_active: boolean;         // Trạng thái kích hoạt
  created_at: string;
  
  promotion_categories: BaserowLink[]; // Giới hạn danh mục (nếu có)
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

// Base URL cho table Promotion
const getPromotionUrl = () => `/${CONFIG.PROMOTION_TABLE_ID}/?user_field_names=true`;

const apiPromotion = {
  /**
   * 1. Lấy danh sách tất cả khuyến mãi (Dành cho Admin hoặc trang "Săn mã")
   */
  getAllPromotions: async (params?: any): Promise<BaserowResponse<PromotionData>> => {
    const response = await axiosClient.get(getPromotionUrl(), { params });
    return response.data;
  },

  /**
   * 2. Lấy các mã khuyến mãi đang hiển thị công khai (Active)
   * Để hiển thị banner hoặc list mã ngoài trang chủ
   */
  getPublicPromotions: async (): Promise<BaserowResponse<PromotionData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { type: "boolean", field: "is_active", value: "true" }
      ]
    }));
    const response = await axiosClient.get(`${getPromotionUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 3. Kiểm tra mã giảm giá (Validate Coupon)
   * Hàm này dùng khi user nhập code ở trang Checkout
   * @param code Mã user nhập (VD: "SALE2024")
   */
  checkCoupon: async (code: string): Promise<PromotionData | null> => {
    // 1. Tìm trong DB xem có code này không
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { type: "equal", field: "code", value: code },
        { type: "boolean", field: "is_active", value: "true" } // Chỉ lấy code đang bật
      ]
    }));

    const response = await axiosClient.get<BaserowResponse<PromotionData>>(`${getPromotionUrl()}&filters=${filterParams}`);

    if (response.data.results && response.data.results.length > 0) {
      const coupon = response.data.results[0];
      
      // 2. Validate thêm logic ở phía Client (Date, Usage)
      // Baserow filter ngày tháng hơi phức tạp, nên lấy về rồi check JS sẽ dễ hơn
      const now = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      // Check thời hạn
      if (now < startDate || now > endDate) {
        throw new Error("Mã giảm giá chưa bắt đầu hoặc đã hết hạn.");
      }

      // Check số lượng sử dụng
      if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
        throw new Error("Mã giảm giá đã hết lượt sử dụng.");
      }

      return coupon;
    }
    
    return null; // Không tìm thấy mã
  },

  /**
   * 4. Cập nhật lượt sử dụng (Increment usage)
   * Gọi hàm này SAU KHI đơn hàng (Order) được tạo thành công
   */
  incrementUsageCount: async (id: number, currentCount: number): Promise<PromotionData> => {
    const url = `/${CONFIG.PROMOTION_TABLE_ID}/${id}/?user_field_names=true`;
    // Tăng used_count lên 1
    const response = await axiosClient.patch(url, { used_count: currentCount + 1 });
    return response.data;
  }
};

export default apiPromotion;