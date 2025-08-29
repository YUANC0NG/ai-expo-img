import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

interface User {
  id: string
  email: string
  subscription?: 'free' | 'premium' | 'pro'
}

interface AppState {
  user: User | null
  theme: 'light' | 'dark' | 'system'
  isSubscribed: boolean
  setUser: (user: User | null) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSubscription: (subscribed: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 演示用户，展示页面效果
      user: {
        id: 'demo-user',
        email: 'demo@example.com',
        subscription: 'free'
      },
      theme: 'system',
      isSubscribed: false,
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setSubscription: (isSubscribed) => set({ isSubscribed }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => 
        Platform.OS === 'web' ? localStorage : AsyncStorage
      ),
    }
  )
)