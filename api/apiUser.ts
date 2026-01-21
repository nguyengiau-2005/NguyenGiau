import axios from 'axios';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---

export interface BaserowFile {
  url: string;
  thumbnails: {
    tiny: { url: string; width: number | null; height: number };
    small: { url: string; width: number; height: number };
  };
  visible_name: string;
  name: string; // Đây là giá trị quan trọng để lưu vào Database
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width: number;
  image_height: number;
  uploaded_at: string;
}

export interface BaserowSelect {
  id: number;
  value: string;
  color: string;
}

export interface UserData {
  id: number;
  order: string;
  full_name: string;
  phone: string;
  email: string;
  password: string; 
  points: number;
  role: BaserowSelect;
  avatar: string; // Text field storing URL
  gender?: BaserowSelect; 
  address_line: string;
  ward: string;
  district: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  full_name: string;
  email?: string;
  password?: string;
  phone: string;
  role?: string; 
  gender?: string; 
  address_line?: string;
  ward?: string;
  district?: string;
  city?: string;
  avatar?: string;
}

export interface BaserowResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- API Functions ---

const getUserUrl = () => `/${CONFIG.USER_TABLE_ID}/?user_field_names=true`;

const apiUser = {
  /**
   * MỚI: Hàm upload file lên server Baserow
   * @param fileUri Đường dẫn file từ thiết bị (ImagePicker)
   */
  uploadFile: async (fileUri: string): Promise<string> => {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'upload.jpg';
    
    // Xác định định dạng file
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : '';
    // basic mime map
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
      mp4: 'video/mp4', mov: 'video/quicktime', mkv: 'video/x-matroska',
      heic: 'image/heic'
    };
    const type = mimeMap[ext] || (ext.startsWith('mp') ? `video/${ext}` : `image/${ext || 'jpeg'}`);

    // @ts-ignore
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: type,
    });

    // Upload lên endpoint riêng của Baserow dành cho file
    // Note: axiosClient.baseURL points to the /table/ path, so we must call the absolute user-files endpoint.
    const uploadUrl = 'https://api.baserow.io/api/user-files/upload-file/';
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${CONFIG.BASEROW_TOKEN}`
      },
    });

    // Trả về thuộc tính "name" do Baserow sinh ra (Ví dụ: "abc_123.jpg")
    return response.data.name;
  },

  getAllUsers: async (params?: any): Promise<BaserowResponse<UserData>> => {
    const response = await axiosClient.get(getUserUrl(), { params });
    return response.data;
  },

  getUserDetail: async (id: number): Promise<UserData> => {
    const response = await axiosClient.get(`/${CONFIG.USER_TABLE_ID}/${id}/?user_field_names=true`);
    return response.data;
  },

  login: async (email: string, password: string): Promise<UserData | null> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { type: "equal", field: "email", value: email },
        { type: "equal", field: "password", value: password }
      ]
    }));

    const response = await axiosClient.get<BaserowResponse<UserData>>(`${getUserUrl()}&filters=${filterParams}`);

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  },

  getUserByPhone: async (phone: string): Promise<UserData | null> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { type: "equal", field: "phone", value: phone }
      ]
    }));

    const response = await axiosClient.get<BaserowResponse<UserData>>(`${getUserUrl()}&filters=${filterParams}`);

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  },

  register: async (data: RegisterPayload): Promise<UserData> => {
    const payload = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role || "USER",
      points: 0,
      gender: data.gender || "Nam",
      address_line: data.address_line || "",
      ward: data.ward || "",
      district: data.district || "",
      city: data.city || ""
    };

    const response = await axiosClient.post(getUserUrl(), payload);
    return response.data;
  },

  /**
   * CẬP NHẬT: Cho phép nhận Partial hoặc any để linh hoạt gửi dữ liệu ảnh
   */
  updateProfile: async (id: number, data: Partial<RegisterPayload> | any): Promise<UserData> => {
    const url = `/${CONFIG.USER_TABLE_ID}/${id}/?user_field_names=true`;
    const response = await axiosClient.patch(url, data);
    return response.data;
  },

  checkEmailExist: async (email: string): Promise<boolean> => {
    const filterParams = encodeURIComponent(JSON.stringify({
      filter_type: "AND",
      filters: [
        { type: "equal", field: "email", value: email }
      ]
    }));
    const response = await axiosClient.get<BaserowResponse<UserData>>(`${getUserUrl()}&filters=${filterParams}`);
    return response.data.count > 0;
  },
  updateAddress: async (userId: number, addressData: {
    address_line: string,
    ward: string,
    district: string,
    city: string
  }) => {
    const url = `/${CONFIG.USER_TABLE_ID}/${userId}/?user_field_names=true`;
    const response = await axiosClient.patch(url, addressData);
    return response.data;
  },
};

export default apiUser;