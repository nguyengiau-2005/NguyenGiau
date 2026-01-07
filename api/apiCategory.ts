import { BaserowLink, BaserowResponse } from './apiProduct';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc dữ liệu Danh mục thực tế từ bảng 766861
 */
export interface CategoryData {
  id: number;
  order: string;
  Name: string;           // Trường thực tế là 'Name'
  image: string;   
  Products: BaserowLink[]; // Danh sách các sản phẩm liên kết
}

// --- API Functions ---

const getCategoryUrl = () => `/${CONFIG.CATEGORY_TABLE_ID}/?user_field_names=true`;

const apiCategory = {
  /**
   * 1. Lấy tất cả danh mục
   * @returns Trả về đối tượng chứa mảng results là CategoryData[]
   */
  getAllCategories: async (): Promise<BaserowResponse<CategoryData>> => {
    const response = await axiosClient.get(getCategoryUrl());
    return response.data;
  },

  /**
   * 2. Lấy chi tiết một danh mục theo ID
   * @param id ID của dòng trong Baserow
   */
  getCategoryDetail: async (id: number): Promise<CategoryData> => {
    const response = await axiosClient.get(`/${CONFIG.CATEGORY_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  }
};

export default apiCategory;