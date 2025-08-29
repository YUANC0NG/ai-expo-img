import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IconSymbol } from '../../components/ui/IconSymbol'
import { useAppStore } from '../../lib/store'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export default function ProfileScreen() {
  const { user, theme, isSubscribed, setUser, setTheme, setSubscription } = useAppStore()

  const handleLogin = async () => {
    Alert.alert('登录', '请实现登录功能')
  }

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSubscription(false)
  }

  const handleSubscribe = () => {
    Alert.alert('订阅', '请实现订阅功能')
  }

  const handleFeedback = () => {
    Alert.alert('反馈', '请实现反馈功能')
  }

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const MenuItem = ({ icon, title, onPress, rightText }: {
    icon: string
    title: string
    onPress: () => void
    rightText?: string
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <IconSymbol name={icon} size={24} color="#6B7280" />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <View style={styles.menuRight}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* 用户信息 */}
          <View style={styles.userCard}>
            {user ? (
              <View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, isSubscribed ? styles.premiumBadge : styles.freeBadge]}>
                    <Text style={[styles.badgeText, isSubscribed ? styles.premiumText : styles.freeText]}>
                      {isSubscribed ? 'Premium 用户' : '免费用户'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.userEmail}>未登录</Text>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>登录/注册</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 订阅管理 */}
          {user && !isSubscribed && (
            <View style={styles.upgradeCard}>
              <Text style={styles.upgradeTitle}>升级到 Premium</Text>
              <Text style={styles.upgradeSubtitle}>解锁所有高级功能</Text>
              <TouchableOpacity style={styles.upgradeButton} onPress={handleSubscribe}>
                <Text style={styles.upgradeButtonText}>立即订阅</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 功能菜单 */}
          <View style={styles.menuContainer}>
            <MenuItem
              icon="gear"
              title="主题设置"
              onPress={toggleTheme}
              rightText={theme === 'system' ? '跟随系统' : theme === 'dark' ? '深色' : '浅色'}
            />
            
            {user && (
              <MenuItem
                icon="creditcard"
                title="订阅管理"
                onPress={handleSubscribe}
              />
            )}
            
            <MenuItem
              icon="envelope"
              title="意见反馈"
              onPress={handleFeedback}
            />
            
            <MenuItem
              icon="info.circle"
              title="关于我们"
              onPress={() => Alert.alert('关于', '版本 1.0.0')}
            />
          </View>

          {/* 退出登录 */}
          {user && (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>退出登录</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 32,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  userEmail: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  premiumBadge: {
    backgroundColor: '#ECFDF5',
  },
  freeBadge: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  premiumText: {
    color: '#065F46',
  },
  freeText: {
    color: '#374151',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  upgradeCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  upgradeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  upgradeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  upgradeButtonText: {
    color: '#8B5CF6',
    fontWeight: '600',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    marginLeft: 12,
    fontSize: 18,
    color: '#111827',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    color: '#6B7280',
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
})