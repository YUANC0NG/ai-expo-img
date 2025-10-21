import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import HabitsService, { Habit, CheckIn } from '@/services/HabitsService';
import HabitCalendar from '@/components/HabitCalendar';

interface CheckInHistoryProps {
  checkIns: CheckIn[];
  colors: any;
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  
  const colors = Colors[colorScheme ?? 'light'];

  // 加载习惯数据
  const loadHabitData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [habitsData, allCheckIns] = await Promise.all([
        HabitsService.getHabits(),
        HabitsService.getCheckIns(),
      ]);
      
      const foundHabit = habitsData.find(h => h.id === id);
      if (!foundHabit) {
        Alert.alert('错误', '习惯不存在');
        router.back();
        return;
      }
      
      setHabit(foundHabit);
      
      // 获取该习惯的所有打卡记录
      const habitCheckIns = allCheckIns.filter(c => c.habitId === id);
      setCheckIns(habitCheckIns);
    } catch (error) {
      console.error('Error loading habit data:', error);
      Alert.alert('错误', '加载习惯数据失败');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadHabitData();
  }, [id, loadHabitData]);

  // 处理打卡状态切换
  const handleToggleCheckIn = async (date: string) => {
    if (!habit) return;
    
    try {
      const existingCheckIn = checkIns.find(
        c => c.habitId === habit.id && c.date === date
      );
      
      if (existingCheckIn) {
        // 取消打卡
        await HabitsService.removeCheckIn(habit.id, date);
        setCheckIns(prev => prev.filter(c => c.id !== existingCheckIn.id));
      } else {
        // 新增打卡
        const newCheckIn = await HabitsService.addCheckIn(habit.id, date);
        setCheckIns(prev => [...prev, newCheckIn]);
      }
    } catch (error) {
      console.error('Error toggling check-in:', error);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText>加载中...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText>习惯不存在</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.detailHeader}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.detailBackButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.detailTitleContainer}>
          <ThemedText style={styles.detailTitle}>{habit.name}</ThemedText>
          <View style={[styles.detailCategoryTag, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={[styles.detailCategoryText, { color: colors.tint }]}>
              {habit.category}
            </ThemedText>
          </View>
        </View>
        <View style={styles.detailHeaderSpace} />
      </ThemedView>

      <ScrollView style={styles.detailContent}>
        {/* 月日历 */}
        <HabitCalendar
          checkIns={checkIns}
          onDatePress={handleToggleCheckIn}
          habitColor={habit.color}
          colors={colors}
        />

        {/* 打卡记录 */}
        <CheckInHistory
          checkIns={checkIns}
          colors={colors}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckInHistory({ checkIns, colors }: CheckInHistoryProps) {
  const sortedCheckIns = [...checkIns].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ThemedView style={styles.history}>
      <ThemedText style={styles.historyTitle}>打卡记录</ThemedText>
      <ScrollView style={styles.historyList}>
        {sortedCheckIns.map((checkIn) => (
          <View key={checkIn.id} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
            <ThemedText style={styles.historyDate}>{checkIn.date}</ThemedText>
            <ThemedText style={styles.historyTime}>
              {checkIn.createdAt.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 1,
  },
  detailBackButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  detailTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -60,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailCategoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailHeaderSpace: {
    width: 40,
  },
  detailContent: {
    flex: 1,
  },
  history: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyDate: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  historyTime: {
    fontSize: 12,
    opacity: 0.7,
  },
});