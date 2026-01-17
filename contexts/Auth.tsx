import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import apiUser, { User as APIUser } from '../api/apiUser';

// Định nghĩa lại kiểu User trong Context để khớp với các màn hình (như Checkout)
export type User = {
  id: string;
  email: string;
  full_name: string;
  fullName?: string;
  phone?: string;
  avatar?: string; // Lưu URL ảnh đầu tiên để hiển thị nhanh
  points?: number;
  address_line?: string;
  ward?: string;
  district?: string;
  city?: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const STORAGE_KEY = 'FIORA_AUTH_V1';

  useEffect(() => {
    const loadSavedUser = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch (e) {
        console.error("Không thể tải thông tin đăng nhập");
      }
    };
    loadSavedUser();
  }, []);

  // Helper để map từ API User sang Context User
  const mapAPIUserToLocal = (apiUser: APIUser): User => ({
    id: String(apiUser.id),
    email: apiUser.email,
    full_name: apiUser.full_name,
    // Also expose camelCase/fullName for UI compatibility
    fullName: (apiUser as any).full_name || (apiUser as any).fullName || '',
    phone: apiUser.phone,
    // Lấy URL ảnh đầu tiên từ mảng avatar của Baserow
    avatar: (Array.isArray((apiUser as any).avatar) && (apiUser as any).avatar.length > 0)
      ? ((apiUser as any).avatar[0]?.url || (apiUser as any).avatar[0])
      : (typeof (apiUser as any).avatar === 'string' ? (apiUser as any).avatar : undefined),
    points: apiUser.points,
    address_line: apiUser.address_line,
    ward: apiUser.ward,
    district: apiUser.district,
    city: apiUser.city,
  });

  const login = async (email: string, password: string) => {
    try {
      const found = await apiUser.findByEmail(email);
      if (!found) throw new Error('Email không tồn tại trên hệ thống');

      // Kiểm tra mật khẩu (Plaintext theo cấu trúc bảng hiện tại)
      if (found.password === password) {
        const localUser = mapAPIUserToLocal(found);
        setUser(localUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
      } else {
        throw new Error('Mật khẩu không chính xác');
      }
    } catch (err) {
      throw err;
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      // 1. Kiểm tra email tồn tại chưa
      const existing = await apiUser.findByEmail(email);
      if (existing) throw new Error('Email này đã được đăng ký');

      // 2. Tạo mới trên Baserow
      const created = await apiUser.create({
        email,
        password,
        full_name: fullName,
        points: 0,
        role: { id: 1, value: "user", color: "light-blue" } as any // Default role
      });

      const localUser = mapAPIUserToLocal(created);
      setUser(localUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (e) {
      setUser(null);
    }
  };

  const updateProfile = async (updateData: Partial<User>) => {
    if (!user?.id) return;

    try {
      // 1. Cập nhật lên Baserow (Map ngược lại trường API)
      const apiPayload: Partial<APIUser> = {};
      if (updateData.full_name) apiPayload.full_name = updateData.full_name;
      if (updateData.phone) apiPayload.phone = updateData.phone;
      if (updateData.address_line) apiPayload.address_line = updateData.address_line;
      if (updateData.city) apiPayload.city = updateData.city;

      const updatedAPI = await apiUser.update(Number(user.id), apiPayload);

      // 2. Cập nhật State và Storage
      const updatedLocal = mapAPIUserToLocal(updatedAPI);
      setUser(updatedLocal);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));
      
    } catch (e) {
      console.error("Lỗi cập nhật profile:", e);
      throw new Error("Không thể cập nhật thông tin");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}