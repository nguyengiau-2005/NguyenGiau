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
 * Cấu trúc liên kết bảng (Link to table)
 * Áp dụng cho: products, promotion_categories
 */
export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu Danh mục (Category)
 * Khớp với JSON: category_id, image_url, products...
 */
export interface CategoryData {
  id: number;
  order: string;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string; // Emoji or icon representation
  is_active: boolean;
  created_at: string;
  products: string;
  promotion_categories: string;
}

/**
 * Cấu trúc phản hồi có phân trang
 */
export interface BaserowResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- API Functions ---

// Base URL cho table Category
const getCategoryUrl = () => `/${CONFIG.CATEGORY_TABLE_ID}/?user_field_names=true`;

const apiCategories = {
  /**
   * 1. Lấy tất cả danh sách danh mục
   * @param params (Optional) Các tham số query như search, size, page
   */
  getAllCategories: async (params?: any): Promise<BaserowResponse<CategoryData>> => {
    const response = await axiosClient.get(getCategoryUrl(), { params });
    return response.data;
  },

  /**
   * 2. Lấy chỉ các danh mục đang hoạt động (Helper thường dùng cho Menu)
   * Lọc theo field: is_active = true
   */
  getActiveCategories: async (): Promise<BaserowResponse<CategoryData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { 
          type: "boolean", 
          field: "is_active", 
          value: "true" 
        }
      ]
    }));
    // Sắp xếp theo order (nếu cần) thì thêm &order_by=order
    const response = await axiosClient.get(`${getCategoryUrl()}&filters=${filterParams}&order_by=order`);
    return response.data;
  },

  /**
   * 3. Lấy chi tiết danh mục theo ID
   * @param id Row ID
   */
  getCategoryDetail: async (id: number): Promise<CategoryData> => {
    const response = await axiosClient.get(`/${CONFIG.CATEGORY_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 4. Lấy danh mục theo Slug (Dùng cho trang danh sách sản phẩm theo category)
   * Field trong JSON là "slug"
   */
  getCategoryBySlug: async (slug: string): Promise<CategoryData | null> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { 
          type: "equal", 
          field: "slug", 
          value: slug 
        }
      ]
    }));
    
    const response = await axiosClient.get<BaserowResponse<CategoryData>>(`${getCategoryUrl()}&filters=${filterParams}`);
    
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  }
};

export default apiCategories;