import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc liên kết bảng (Reused)
 */
export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu Promotion Categories
 * Khớp với JSON: Name, voucher_id, category_id
 */
export interface PromotionCategoryData {
  id: number;
  order: string;
  Name: string;               // Tên định danh (VD: "Mã Hè 2024 - Áo thun")
  voucher_id: BaserowLink[];  // Link tới bảng Promotion
  category_id: BaserowLink[]; // Link tới bảng Category
}

/**
 * Payload để tạo liên kết mới
 */
export interface CreatePromotionCategoryPayload {
  Name: string;
  voucher_id: number[];   // Mảng ID của Promotion
  category_id: number[];  // Mảng ID của Category
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

// Base URL
const getPromoCatUrl = () => `/${CONFIG.PROMOTION_CATEGORY_TABLE_ID}/?user_field_names=true`;

const apiPromotionCategories = {
  /**
   * 1. Lấy tất cả các liên kết
   */
  getAll: async (params?: any): Promise<BaserowResponse<PromotionCategoryData>> => {
    const response = await axiosClient.get(getPromoCatUrl(), { params });
    return response.data;
  },

  /**
   * 2. Tạo liên kết mới (Admin gán mã cho danh mục)
   */
  create: async (data: CreatePromotionCategoryPayload): Promise<PromotionCategoryData> => {
    const response = await axiosClient.post(getPromoCatUrl(), data);
    return response.data;
  },

  /**
   * 3. Xóa liên kết (Gỡ mã khỏi danh mục)
   */
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/${CONFIG.PROMOTION_CATEGORY_TABLE_ID}/${id}/`);
  },

  /**
   * 4. Lấy danh sách Danh mục được áp dụng bởi một Voucher ID
   * Dùng khi Validate Checkout: "Mã này áp dụng cho những danh mục nào?"
   */
  getCategoriesByVoucherId: async (voucherId: number): Promise<BaserowResponse<PromotionCategoryData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { 
          type: "link_row_has", 
          field: "voucher_id", 
          value: voucherId.toString() 
        }
      ]
    }));
    const response = await axiosClient.get(`${getPromoCatUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 5. Lấy danh sách Voucher áp dụng cho một Category ID
   * Dùng để hiển thị badge "Đang giảm giá" trên trang danh sách sản phẩm
   */
  getVouchersByCategoryId: async (categoryId: number): Promise<BaserowResponse<PromotionCategoryData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { 
          type: "link_row_has", 
          field: "category_id", 
          value: categoryId.toString() 
        }
      ]
    }));
    const response = await axiosClient.get(`${getPromoCatUrl()}&filters=${filterParams}`);
    return response.data;
  }
};

export default apiPromotionCategories;