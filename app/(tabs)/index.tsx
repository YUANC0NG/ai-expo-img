import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../../lib/store'

export default function HomeScreen() {
  const { user, isSubscribed } = useAppStore()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>欢迎使用</Text>
          <Text style={styles.subtitle}>Supabase + Expo 通用模板</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>功能特性</Text>
            <Text style={styles.feature}>• Supabase 集成</Text>
            <Text style={styles.feature}>• Zustand 状态管理</Text>
            <Text style={styles.feature}>• 订阅付费系统</Text>
            <Text style={styles.feature}>• 主题切换</Text>
            <Text style={styles.feature}>• 跨平台支持</Text>
          </View>

          {user ? (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>已登录</Text>
              <Text style={styles.successText}>{user.email}</Text>
              <Text style={styles.statusText}>
                订阅状态: {isSubscribed ? '已订阅' : '免费用户'}
              </Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>未登录</Text>
              <Text style={styles.infoText}>请前往"我的"页面登录</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  feature: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 24,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#047857',
  },
  statusText: {
    fontSize: 14,
    color: '#059669',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#1D4ED8',
  },
})