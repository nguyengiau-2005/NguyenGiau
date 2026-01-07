import { BaserowResponse } from './apiProduct';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

/**
 * Cấu trúc dữ liệu User thực tế từ bảng USER (Baserow)
 */
export interface User {
  id: number;

  email: string;
  password?: string; // null nếu login social
  full_name: string;
  avatar?: string;
  phone?: string;

  provider: 'email' | 'google' | 'facebook';
  social_id?: string;

  role: 'user' | 'admin';
  status: 'active' | 'blocked';

  email_verified: boolean;

  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

/**
 * Response danh sách user từ Baserow
 */
export type UserResponse = BaserowResponse<User>;

// --- API Endpoints ---

const getUsers = () => `/${CONFIG.USER_TABLE_ID}/?user_field_names=true`;
const getUserById = (id: number) => `/${CONFIG.USER_TABLE_ID}/${id}/?user_field_names=true`;
const createUser = () => `/${CONFIG.USER_TABLE_ID}/?user_field_names=true`;
const updateUser = (id: number) => `/${CONFIG.USER_TABLE_ID}/${id}/?user_field_names=true`;

// --- API Functions ---

const apiUser = {
  /**
   * Lấy danh sách user (trả về data của axios response)
   */
  async getAll(): Promise<BaserowResponse<User>> {
    const res = await axiosClient.get(getUsers());
    return res.data;
  },

  /**
   * Lấy user theo ID
   */
  async getById(id: number): Promise<User> {
    const res = await axiosClient.get(getUserById(id));
    return res.data;
  },

  /**
   * Helper: tìm user theo email (lọc client-side)
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const data = await apiUser.getAll();
    return data.results.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  },

  /**
   * Tạo user mới (signup)
   */
  async create(data: Partial<User>): Promise<User> {
    const res = await axiosClient.post(createUser(), data);
    return res.data;
  },

  /**
   * Cập nhật user
   */
  async update(id: number, data: Partial<User>): Promise<User> {
    const res = await axiosClient.patch(updateUser(id), data);
    return res.data;
  },
};

export default apiUser;
