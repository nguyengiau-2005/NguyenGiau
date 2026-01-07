import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import apiUser, { User as APIUser } from '../api/apiUser';

export type User = {
  id?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  // Keep the original updateProfile signature used in the app
  updateProfile: (fullName: string, phone: string, avatar?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const STORAGE_KEY = 'AUTH_USER_V1';

  useEffect(() => {
    // Load saved user on mount
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as User;
          setUser(parsed);
        }
      } catch (e) {
        // ignore load errors
      }
    };
    load();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Tìm user theo email từ Baserow
      const found = await apiUser.findByEmail(email);
      if (!found) throw new Error('User not found');

      // Nếu bảng lưu password (plaintext) so sánh đơn giản
      if (found.password && found.password === password) {
        const newUser = { id: String(found.id), email: found.email, fullName: found.full_name, phone: found.phone, avatar: found.avatar } as User;
        setUser(newUser);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        } catch (e) {
          // ignore storage errors
        }
        return;
      }

      // Nếu password không đúng
      throw new Error('Invalid credentials');
    } catch (err) {
      // Fallback: giữ mock delay như trước nếu API bị lỗi
      await new Promise((resolve) => setTimeout(resolve, 600));
      throw err;
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    try {
      // Tạo user trên Baserow
      const payload: Partial<APIUser> = {
        email,
        password,
        full_name: fullName,
        provider: 'email',
        role: 'user',
        status: 'active',
        email_verified: false,
      };
      const created = await apiUser.create(payload);
      const newUser = { id: String(created.id), email: created.email, fullName: created.full_name, phone: created.phone, avatar: created.avatar } as User;
      setUser(newUser);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {
        // ignore storage errors
      }
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      throw err;
    }
  };

  const logout = () => setUser(null);

  // update logout to clear storage
  const _logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  const updateProfile = async (fullName: string, phone: string, avatar?: string) => {
    setUser((prev) => {
      const base = prev ? { ...prev } : ({} as User);
      const updated = { ...base, fullName, phone, avatar: avatar ?? base.avatar } as User;
      // persist
      (async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
      })();
      return updated;
    });

    // Đồng bộ lên Baserow nếu có id
    try {
      const current = (user as User) || null;
      if (current && current.id) {
        const idNum = Number(current.id);
        if (!isNaN(idNum)) {
          await apiUser.update(idNum, { full_name: fullName, phone, avatar });
        }
      }
    } catch (e) {
      // ignore API errors for now
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout: _logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
