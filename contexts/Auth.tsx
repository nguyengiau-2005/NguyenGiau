import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Import API và các Type
import apiUser, { RegisterPayload, UserData } from '@/api/apiUser';

// Định nghĩa Interface cho Context
interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  lastLogin: string | null;
  lastLogout: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  // Hàm cập nhật hồ sơ nhận 4 tham số
  updateProfile: (fullName: string, phone: string, gender: string, avatar?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isLoggedIn: false,
  lastLogin: null,
  lastLogout: null,
  login: async () => { },
  signup: async () => { },
  logout: async () => { },
  updateProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [lastLogout, setLastLogout] = useState<string | null>(null);

  // 1. Kiểm tra trạng thái đăng nhập khi mở app
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedLastLogin = await AsyncStorage.getItem('lastLogin');
        if (storedLastLogin) {
          setLastLogin(storedLastLogin);
        }
        const storedLastLogout = await AsyncStorage.getItem('lastLogout');
        if (storedLastLogout) {
          setLastLogout(storedLastLogout);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };
    loadData();
  }, []);

  // 2. Xử lý Đăng nhập
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await apiUser.login(email, password);

      if (!loggedInUser) {
        throw new Error('Email hoặc mật khẩu không chính xác.');
      }

      setUser(loggedInUser);
      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));

      // Lưu thời gian đăng nhập
      const loginTime = new Date().toISOString();
      setLastLogin(loginTime);
      await AsyncStorage.setItem('lastLogin', loginTime);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Xử lý Đăng ký
  const signup = async (data: RegisterPayload) => {
    setIsLoading(true);
    try {
      const exists = await apiUser.checkEmailExist(data.email || '');
      if (exists) {
        throw new Error('Email này đã được sử dụng.');
      }
      await apiUser.register(data);
    } catch (error: any) {
      console.error("Signup Error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Xử lý Đăng xuất
  const logout = async () => {
    setIsLoading(true);
    try {
      // Lưu thời gian đăng xuất
      const logoutTime = new Date().toISOString();
      setLastLogout(logoutTime);
      await AsyncStorage.setItem('lastLogout', logoutTime);

      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Xử lý Cập nhật Hồ sơ (Logic xử lý Avatar 2 bước)
  // Trong contexts/Auth.tsx

  // Trong contexts/Auth.tsx

  const updateProfile = async (fullName: string, phone: string, gender: string, avatar?: string) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Khởi tạo payload với các trường text
      const payload: any = {
        full_name: fullName,
        phone: phone,
        gender: gender,
      };

      // 2. Xử lý Avatar
      if (avatar) {
        payload.avatar = avatar;
      }

      // 3. Log payload để kiểm tra lần cuối trước khi gọi API
      console.log("Payload gửi đi:", JSON.stringify(payload, null, 2));

      const updatedUser = await apiUser.updateProfile(user.id, payload);

      // 4. Cập nhật state và bộ nhớ tạm
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    } catch (error: any) {
      // Bắt lỗi chi tiết từ server
      if (error.response) {
        console.error("LỖI TỪ BASEROW:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("LỖI HỆ THỐNG:", error.message);
      }
      throw error; // Ném lỗi để màn hình EditProfile hiện Alert
    } finally {
      setIsLoading(false);
    }
  }; return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, lastLogin, lastLogout, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};