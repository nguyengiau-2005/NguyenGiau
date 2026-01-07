import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc hình ảnh chi tiết từ Baserow
 */
export interface BaserowFile {
  url: string;
  thumbnails: {
    tiny: { url: string; width: number | null; height: number };
    small: { url: string; width: number; height: number };
    card_cover: { url: string; width: number; height: number };
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
 * Cấu trúc liên kết bảng (Link to table) cho Categories, Inventory, OrderItems
 */
export interface BaserowLink {
  id: number;
  value: string;
  order: string;
}

/**
 * Cấu trúc dữ liệu Sản phẩm khớp chính xác với Table 766845
 * Lưu ý: Tên trường bắt đầu bằng chữ hoa (PascalCase) theo dữ liệu thực tế
 */
export interface ProductData {
  id: number;
  order: string;
  Name: string;           // Hydrating Facial Cleanser
  Description: string;    // Gentle cleanser for daily use...
  Price: string;          // Trả về dạng chuỗi "19.99"
  Image: BaserowFile[];   // Mảng các object hình ảnh
  SKU: string;            // SKN-001
  Stock: string;          // Trả về dạng chuỗi "120"
  IsActive: boolean;
  OrderItems: BaserowLink[];
  Inventory: BaserowLink[];
  Categories: BaserowLink[];
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

const getProductUrl = () => `/${CONFIG.PRODUCT_TABLE_ID}/?user_field_names=true`;

const apiProduct = {
  /**
   * 1. Lấy tất cả danh sách sản phẩm
   * @returns Trả về BaserowResponse chứa mảng kết quả ProductData[]
   */
  getAllProducts: async (): Promise<BaserowResponse<ProductData>> => {
    const response = await axiosClient.get(getProductUrl());
    return response.data;
  },

  /**
   * 2. Lấy chi tiết một sản phẩm theo ID
   * @param id ID của dòng (row id)
   */
  getProductDetail: async (id: number): Promise<ProductData> => {
    const response = await axiosClient.get(`/${CONFIG.PRODUCT_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Lọc sản phẩm theo Category (Helper)
   * Sử dụng query filter của Baserow
   */
  getProductsByCategory: async (categoryId: number): Promise<BaserowResponse<ProductData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [{ type: "link_row_has", field: "Categories", value: categoryId.toString() }]
    }));
    const response = await axiosClient.get(`${getProductUrl()}&filters=${filterParams}`);
    return response.data;
  }
};

export default apiProduct;