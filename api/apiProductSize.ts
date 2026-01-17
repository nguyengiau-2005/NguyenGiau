import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc liên kết bảng (Reused)
 * Dùng cho: product, order_items
 */
export interface BaserowLink {
  id: number;
  value: string;
}

/**
 * Cấu trúc dữ liệu Kích cỡ/Biến thể sản phẩm (Product Size)
 * Khớp với JSON: size_ml, price, stock, sku...
 */
export interface ProductSizeData {
  id: number;
  order: string;
  size_id: number;          // ID phụ (nếu có)
  
  product: BaserowLink[];   // Link tới bảng Product cha
  
  size_ml: number;          // Dung tích (ví dụ: 50, 100)
  price: string;            // Giá riêng cho size này (ví dụ: "250000.000")
  stock: number;            // Số lượng tồn kho của size này
  sku: string;              // Mã SKU riêng (ví dụ: "PRO-50ML")
  
  created_at: string;
  
  // Các field liên kết ngược từ OrderItems (thường không cần dùng khi hiển thị sản phẩm)
  order_items: BaserowLink[]; 
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

// Base URL cho table Product Size
const getProductSizeUrl = () => `/${CONFIG.PRODUCT_SIZE_TABLE_ID}/?user_field_names=true`;

const apiProductSize = {
  /**
   * 1. Lấy tất cả các size (Thường dùng cho trang quản lý kho Admin)
   */
  getAllSizes: async (params?: any): Promise<BaserowResponse<ProductSizeData>> => {
    const response = await axiosClient.get(getProductSizeUrl(), { params });
    return response.data;
  },

  /**
   * 2. Lấy danh sách Size theo Product ID
   * Dùng cho trang Chi tiết sản phẩm: Khi user vào xem sản phẩm A, 
   * cần load các size (50ml, 100ml) để user chọn.
   */
  getSizesByProductId: async (productId: number): Promise<BaserowResponse<ProductSizeData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { 
          type: "link_row_has", 
          field: "product", 
          value: productId.toString() 
        }
      ]
    }));
    
    // Sắp xếp theo size_ml tăng dần để hiển thị đẹp (nhỏ trước lớn sau)
    const response = await axiosClient.get(`${getProductSizeUrl()}&filters=${filterParams}&order_by=size_ml`);
    return response.data;
  },

  /**
   * 3. Lấy chi tiết một Size cụ thể
   */
  getSizeDetail: async (id: number): Promise<ProductSizeData> => {
    const response = await axiosClient.get(`/${CONFIG.PRODUCT_SIZE_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 4. Cập nhật tồn kho (Stock)
   * Dùng sau khi đơn hàng được đặt thành công (Trừ kho)
   * hoặc Admin nhập hàng (Cộng kho)
   */
  updateStock: async (id: number, newStock: number): Promise<ProductSizeData> => {
    const url = `/${CONFIG.PRODUCT_SIZE_TABLE_ID}/${id}/?user_field_names=true`;
    const response = await axiosClient.patch(url, { stock: newStock });
    return response.data;
  },
  
  /**
   * 5. Kiểm tra tồn kho (Check Stock Availability)
   * Giúp kiểm tra nhanh xem size này còn hàng không trước khi Add to Cart
   */
  checkStock: async (id: number, quantityNeeded: number): Promise<boolean> => {
    const sizeData = await apiProductSize.getSizeDetail(id);
    return sizeData.stock >= quantityNeeded;
  }
};

export default apiProductSize;