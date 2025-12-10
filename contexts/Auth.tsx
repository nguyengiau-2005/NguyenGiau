import React, { createContext, ReactNode, useContext, useState } from 'react';

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

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setUser({ id: '1', email, fullName: 'Người Dùng' });
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setUser({ id: '1', email, fullName });
  };

  const logout = () => setUser(null);

  const updateProfile = async (fullName: string, phone: string, avatar?: string) => {
    setUser((prev) => {
      const base = prev ? { ...prev } : ({} as User);
      return { ...base, fullName, phone, avatar: avatar ?? base.avatar } as User;
    });
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
