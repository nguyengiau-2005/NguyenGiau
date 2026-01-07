import axiosClient from './axiosClient';
import { CONFIG } from './config';
import { BaserowResponse, BaserowLink } from './apiProduct';

// --- Types & Interfaces ---

/**
 * Cấu trúc dữ liệu Kiểm kê (Inventory) thực tế từ bảng 766849
 * Lưu ý: Tên trường khớp chính xác với Baserow (PascalCase và có khoảng trắng)
 */
export interface InventoryData {
  id: number;
  order: string;
  SKU: string;                      // SKU của sản phẩm (ví dụ: SKN-001)
  Product: BaserowLink[];           // Liên kết đến bảng Sản phẩm
  Quantity: string;                 // API trả về dạng chuỗi "120", "200"...
  'Warehouse Location': string;      // Vị trí kho (ví dụ: Warehouse A)
}

// --- API Functions ---

const getInventoryUrl = () => `/${CONFIG.INVENTORY_TABLE_ID}/?user_field_names=true`;

const apiInventory = {
  /**
   * 1. Lấy toàn bộ danh sách kiểm kê kho
   * @returns Trả về BaserowResponse chứa mảng kết quả InventoryData[]
   */
  getAllInventory: async (): Promise<BaserowResponse<InventoryData>> => {
    const response = await axiosClient.get(getInventoryUrl());
    return response.data;
  },

  /**
   * 2. Lấy chi tiết kiểm kê của một dòng cụ thể theo ID
   * @param id ID của dòng trong Baserow
   */
  getInventoryDetail: async (id: number): Promise<InventoryData> => {
    const response = await axiosClient.get(`/${CONFIG.INVENTORY_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  /**
   * 3. Lọc kiểm kê theo SKU (Helper)
   * Giúp tìm nhanh vị trí kho và số lượng của một mã SKU cụ thể
   */
  getInventoryBySKU: async (sku: string): Promise<BaserowResponse<InventoryData>> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [{ type: "equal", field: "SKU", value: sku }]
    }));
    const response = await axiosClient.get(`${getInventoryUrl()}&filters=${filterParams}`);
    return response.data;
  },

  /**
   * 4. Cập nhật số lượng tồn kho
   * @param id ID của dòng cần cập nhật
   * @param quantity Số lượng mới (truyền dạng string theo format Baserow)
   */
  updateStockQuantity: async (id: number, quantity: string): Promise<InventoryData> => {
    const response = await axiosClient.patch(`/${CONFIG.INVENTORY_TABLE_ID}/${id}/?user_field_names=true`, {
      Quantity: quantity
    });
    return response.data;
  }
};

export default apiInventory;