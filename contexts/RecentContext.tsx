import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

export type RecentItem = {
  id: string | number;
  name: string;
  price?: number;
  img?: any; // require() or uri
  variant?: string;
  timestamp: number;
};

type RecentContextType = {
  recent: RecentItem[];
  addRecent: (item: Omit<RecentItem, 'timestamp'>) => Promise<void>;
  removeRecent: (id: string | number) => Promise<void>;
  clearRecent: () => Promise<void>;
};

const STORAGE_KEY = '@nguyengiau:recent';

export const RecentContext = createContext<RecentContextType | undefined>(undefined);

export function RecentProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useState<RecentItem[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = async (items: RecentItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      // ignore
    }
  };

  const addRecent = async (item: Omit<RecentItem, 'timestamp'>) => {
    const next: RecentItem = { ...item, timestamp: Date.now() };
    // remove existing with same id
    const filtered = recent.filter(r => String(r.id) !== String(item.id));
    const newList = [next, ...filtered].slice(0, 50); // cap at 50
    setRecent(newList);
    await persist(newList);
  };

  const removeRecent = async (id: string | number) => {
    const newList = recent.filter(r => String(r.id) !== String(id));
    setRecent(newList);
    await persist(newList);
  };

  const clearRecent = async () => {
    setRecent([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RecentContext.Provider value={{ recent, addRecent, removeRecent, clearRecent }}>
      {children}
    </RecentContext.Provider>
  );
}

export function useRecent() {
  const ctx = React.useContext(RecentContext);
  if (!ctx) throw new Error('useRecent must be used within RecentProvider');
  return ctx;
}
