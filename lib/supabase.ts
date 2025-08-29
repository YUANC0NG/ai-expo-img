import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// 获取 Supabase 配置，如果没有配置则使用 null
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey

// 只有在配置了真实 URL 时才创建客户端
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL') 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null

// 辅助函数检查 Supabase 是否可用
export const isSupabaseConfigured = () => {
  return supabase !== null
}