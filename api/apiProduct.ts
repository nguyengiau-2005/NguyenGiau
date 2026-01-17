import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc hình ảnh chi tiết từ Baserow (Standard)
 */
export interface BaserowFile {
  url: string;
  thumbnails: {
    tiny: { url: string; width: number | null; height: number };
    small: { url: string; width: number; height: number };
    // card_cover có thể có hoặc không tùy setting view
    card_cover?: { url: string; width: number; height: number }; 
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
 * Áp dụng cho: category_id, product_sizes
 */
export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu Sản phẩm (Product)
 * Khớp với JSON: name, brand, category_id, product_sizes...
 */
export interface ProductData {
  id: number;
  order: string;
  name: string;
  slug: string;
  category_id: BaserowLink[]; // Link row field
  brand: string;
  description: string;
  ingredients: string;
  image: BaserowFile[];
  rating: string;           // Baserow trả về số dạng chuỗi "0.0"
  sold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_sizes: BaserowLink[]; // Link row field
  price: string;            // Baserow trả về số dạng chuỗi "0.000"
}

/**
 * Cấu trúc phản hồi có phân trang của Baserow
 */
export interface BaserowResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- API Functions ---

// Base URL cho table sản phẩm, luôn bật user_field_names=true để lấy key name đúng
const getProductUrl = () => `/${CONFIG.PRODUCT_TABLE_ID}/?user_field_names=true`;

const apiProduct = {
  /**
   * 1. Lấy tất cả danh sách sản phẩm
   * @param params (Optional) Các tham số query như search, size, page
   */
  getAllProducts: async (params?: any): Promise<BaserowResponse<ProductData>> => {
    // Cho phép truyền thêm params (ví dụ ?search=...) vào axios
    const response = await axiosClient.get(getProductUrl(), { params });
    return response.data;
  },

  /**
   * 2. Lấy chi tiết một sản phẩm theo ID (Row ID)
   * @param id ID của dòng
   */
  getProductDetail: async (id: number): Promise<ProductData> => {
    const response = await axiosClient.get(`/${CONFIG.PRODUCT_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Lọc sản phẩm theo Category ID
   * Field trong JSON là "category_id"
   */
  getProductsByCategory: async (categoryId: number): Promise<BaserowResponse<ProductData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { 
          type: "link_row_has", 
          field: "category_id", // Tên field chính xác trong JSON của bạn
          value: categoryId.toString() 
        }
      ]
    }));
    const response = await axiosClient.get(`${getProductUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 4. Lấy sản phẩm theo Slug (Thường dùng cho trang chi tiết SEO)
   * Field trong JSON là "slug"
   */
  getProductBySlug: async (slug: string): Promise<ProductData | null> => {
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
    
    const response = await axiosClient.get<BaserowResponse<ProductData>>(`${getProductUrl()}&filters=${filterParams}`);
    
    // Baserow search luôn trả về mảng, ta lấy phần tử đầu tiên
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  }
};

export default apiProduct;