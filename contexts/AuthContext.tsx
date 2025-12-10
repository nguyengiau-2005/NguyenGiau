import Welcome from '@/components/Welcome';
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
  // showWelcome is true while the onboarding should be visible
  showWelcome?: boolean;
  // call to programmatically hide welcome (and persist)
  hideWelcome?: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fullName: string, phone: string, avatar?: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const val = await AsyncStorage.getItem('welcome_seen');
        // in dev always show so testers can see it
        setShowWelcome(__DEV__ ? true : !val);
      } catch (e) {
        setShowWelcome(true);
      }
    })();
  }, []);

  const hideWelcome = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('welcome_seen', '1');
    } catch (e) {
      // ignore
    }
    setShowWelcome(false);
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser({
      id: '1',
      email,
      fullName: 'Nguyễn Giau',
      phone: '+84 123 456 789',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nguyễn',
    });
  };

  const signup = async (email: string, password: string, fullName: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser({
      id: '1',
      email,
      fullName,
      phone: '',
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (fullName: string, phone: string, avatar?: string) => {
    if (!user) return;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      ...user,
      fullName,
      phone,
      avatar: avatar || user.avatar,
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, updateProfile, showWelcome, hideWelcome }}>
      {children}
      {showWelcome ? (
        <Welcome
          onStart={async () => {
            await hideWelcome();
            // After dismissing, navigate according to auth state
            if (user) router.replace('/(tabs)');
            else router.replace('/auth/login');
          }}
          onSkip={async () => {
            await hideWelcome();
            if (user) router.replace('/(tabs)');
            else router.replace('/auth/login');
          }}
        />
      ) : null}
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
