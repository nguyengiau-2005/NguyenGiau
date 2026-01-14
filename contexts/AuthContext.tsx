import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

export type User = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean; // Thêm trạng thái chờ khi đang đọc memory
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fullName: string, phone: string, avatar?: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Tự động kiểm tra thông tin đăng nhập khi mở app
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('USER_DATA');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load user", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Hàm lưu user vào Local Storage
  const saveUserToLocal = async (userData: User) => {
    try {
      await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to save user", e);
    }
  };

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData: User = {
      id: '1',
      email,
      fullName: 'Nguyễn Giau',
      phone: '+84 123 456 789',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nguyễn',
    };

    setUser(userData);
    await saveUserToLocal(userData); // Lưu lại
  };

  const signup = async (email: string, password: string, fullName: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData: User = {
      id: '1',
      email,
      fullName,
      phone: '',
    };

    setUser(userData);
    await saveUserToLocal(userData); // Lưu lại
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem('USER_DATA'); // Xóa sạch thông tin khi logout
    } catch (e) {
      console.error("Failed to remove user", e);
    }
  };

  const updateProfile = async (fullName: string, phone: string, avatar?: string) => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedUser = {
      ...user,
      fullName,
      phone,
      avatar: avatar || user.avatar,
    };

    setUser(updatedUser);
    await saveUserToLocal(updatedUser); // Cập nhật lại bản lưu
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      isLoading, // Truyền isLoading để bên Layout hiển thị màn hình chờ
      login, 
      signup, 
      logout, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}