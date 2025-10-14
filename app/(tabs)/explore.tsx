import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import HabitsService from '@/services/HabitsService';

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  isPremium?: boolean;
}

export default function ProfileScreen() {
  const handleSubscribe = () => {
    Alert.alert(
      '升级到专业版',
      '解锁更多功能：\n• 无限制整理照片\n• 高级筛选功能\n• 云端同步\n• 优先客服支持',
      [
        { text: '取消', style: 'cancel' },
        { text: '立即订阅', onPress: () => {} }
      ]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      '意见反馈',
      '请选择反馈方式',
      [
        { text: '取消', style: 'cancel' },
        { text: '邮件反馈', onPress: () => {} },
        { text: '在线反馈', onPress: () => {} }
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      '给我们评分',
      '如果您喜欢这个应用，请在App Store给我们评分！',
      [
        { text: '取消', style: 'cancel' },
        { text: '去评分', onPress: () => {} }
      ]
    );
  };

  const handlePrivacy = () => {
    // 隐私政策页面
  };

  const handleTerms = () => {
    // 使用条款页面
  };

  const handleAbout = () => {
    Alert.alert(
      '关于应用',
      '照片整理大师 v1.0.0\n\n一款简单易用的照片整理工具，帮助您快速分类和管理照片。',
      [{ text: '确定' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      '重置数据',
      '确定要重置所有习惯数据吗？此操作不可恢复，所有习惯和打卡记录将被删除。',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定重置', onPress: async () => {
          try {
            console.log('开始重置数据...');
            const habitsBefore = await HabitsService.getHabits();
            const checkInsBefore = await HabitsService.getCheckIns();
            console.log('重置前 - 习惯数量:', habitsBefore.length, '打卡数量:', checkInsBefore.length);

            await HabitsService.resetAllData();

            const habitsAfter = await HabitsService.getHabits();
            const checkInsAfter = await HabitsService.getCheckIns();
            console.log('重置后 - 习惯数量:', habitsAfter.length, '打卡数量:', checkInsAfter.length);

            if (habitsAfter.length === 0 && checkInsAfter.length === 0) {
              Alert.alert('成功', '所有数据已重置');
            } else {
              Alert.alert('部分成功', `习惯已重置，但仍有 ${habitsAfter.length} 个习惯和 ${checkInsAfter.length} 条打卡记录`);
            }
          } catch (error) {
            console.error('重置数据失败:', error);
            Alert.alert('错误', `重置数据失败: ${error.message || '请重试'}`);
          }
        }, style: 'destructive' }
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'subscribe',
      title: '升级专业版',
      subtitle: '解锁全部功能',
      icon: 'crown.fill',
      action: handleSubscribe,
      isPremium: true
    },
    {
      id: 'feedback',
      title: '意见反馈',
      subtitle: '帮助我们改进',
      icon: 'message.fill',
      action: handleFeedback
    },
    {
      id: 'rate',
      title: '给我们评分',
      subtitle: '在App Store评分',
      icon: 'star.fill',
      action: handleRateApp
    },
    {
      id: 'privacy',
      title: '隐私政策',
      icon: 'lock.fill',
      action: handlePrivacy
    },
    {
      id: 'terms',
      title: '使用条款',
      icon: 'doc.text.fill',
      action: handleTerms
    },
    {
      id: 'about',
      title: '关于我们',
      icon: 'info.circle.fill',
      action: handleAbout
    },
    {
      id: 'reset',
      title: '重置数据',
      subtitle: '清除所有习惯数据',
      icon: 'trash.fill',
      action: handleResetData
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <IconSymbol name="person.fill" size={40} color="#fff" />
          </View>
        </View>
        <ThemedText type="title" style={styles.userName}>用户</ThemedText>
        <ThemedText style={styles.userStatus}>免费版用户</ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                item.isPremium && styles.premiumItem
              ]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[
                  styles.iconContainer,
                  item.isPremium && styles.premiumIconContainer,
                  item.id === 'reset' && styles.resetIconContainer
                ]}>
                  <IconSymbol
                    name={item.icon}
                    size={20}
                    color={item.isPremium ? '#fff' : item.id === 'reset' ? '#fff' : '#666'}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.menuTitle,
                    item.isPremium && styles.premiumTitle
                  ]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.version}>版本 1.0.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  premiumItem: {
    backgroundColor: '#FFD700',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumIconContainer: {
    backgroundColor: '#FF6B35',
  },
  resetIconContainer: {
    backgroundColor: '#DC3545',
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  premiumTitle: {
    color: '#8B4513',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  version: {
    fontSize: 12,
    opacity: 0.5,
  },
});
