import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ChatSession } from '@/types';

interface AppStore {
  user: User | null;
  currentChatSession: ChatSession | null;
  setUser: (user: User | null) => void;
  setCurrentChatSession: (session: ChatSession | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      currentChatSession: null,
      setUser: (user) => set({ user }),
      setCurrentChatSession: (session) => set({ currentChatSession: session }),
      logout: () => set({ user: null, currentChatSession: null }),
    }),
    {
      name: 'app-storage',
    }
  )
);