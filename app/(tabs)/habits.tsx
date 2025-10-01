import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import HabitsService, { Habit, CheckIn } from '@/services/HabitsService';
import HabitCalendar from '@/components/HabitCalendar';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const colors = Colors[colorScheme ?? 'light'];

  // 加载数据
  const loadData = async () => {
    try {
      const [habitsData, checkInsData, categoriesData] = await Promise.all([
        HabitsService.getHabits(),
        HabitsService.getCheckIns(),
        HabitsService.getCategories(),
      ]);
      setHabits(habitsData);
      setCheckIns(checkInsData);
      setCategories(['全部', ...categoriesData]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('错误', '加载数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      await HabitsService.initializeSampleData();
      await loadData();
    };
    initializeData();
  }, []);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleHabitPress = (habit: Habit) => {
    setSelectedHabit(habit);
  };

  const handleBackToList = () => {
    setSelectedHabit(null);
  };

  // 筛选习惯
  const filteredHabits = selectedCategory === '全部' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  if (selectedHabit) {
    return (
      <HabitDetailScreen
        habit={selectedHabit}
        checkIns={checkIns}
        onBack={handleBackToList}
        onToggleCheckIn={async (date: string) => {
          try {
            const existingCheckIn = checkIns.find(
              c => c.habitId === selectedHabit.id && c.date === date
            );
            
            if (existingCheckIn) {
              // 取消打卡
              await HabitsService.removeCheckIn(selectedHabit.id, date);
              setCheckIns(prev => prev.filter(c => c.id !== existingCheckIn.id));
            } else {
              // 新增打卡
              const newCheckIn = await HabitsService.addCheckIn(selectedHabit.id, date);
              setCheckIns(prev => [...prev, newCheckIn]);
            }
          } catch (error) {
            console.error('Error toggling check-in:', error);
            Alert.alert('错误', '操作失败，请重试');
          }
        }}
        colors={colors}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
      </ThemedView>

      {/* 分类筛选 */}
      {categories.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && [styles.selectedCategoryButton, { backgroundColor: colors.tint }],
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryButtonText,
              ]}>
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView 
        style={styles.habitsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ThemedText>加载中...</ThemedText>
          </View>
        ) : habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>还没有创建习惯</ThemedText>
            <ThemedText style={styles.emptySubText}>点击右上角的 + 号创建第一个习惯</ThemedText>
          </View>
        ) : (
          filteredHabits.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={[styles.habitCard, { backgroundColor: colors.background }]}
              onPress={() => handleHabitPress(habit)}
            >
              <View style={[styles.habitColorIndicator, { backgroundColor: habit.color }]} />
              <View style={styles.habitInfo}>
                <View style={styles.habitTitleRow}>
                  <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
                  <View style={[styles.categoryTag, { backgroundColor: colors.tint + '20' }]}>
                    <ThemedText style={[styles.categoryTagText, { color: colors.tint }]}>
                      {habit.category}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.habitDescription}>{habit.description}</ThemedText>
              </View>
              <View style={styles.habitStats}>
                <ThemedText style={styles.statsText}>
                  {checkIns.filter(c => c.habitId === habit.id).length} 次
                </ThemedText>
                <IconSymbol name="chevron.right" size={16} color={colors.text} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 悬浮新增按钮 */}
      <TouchableOpacity 
        style={[styles.floatingAddButton, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/add-habit')}
      >
        <IconSymbol name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// 习惯详情页面组件
interface HabitDetailScreenProps {
  habit: Habit;
  checkIns: CheckIn[];
  onBack: () => void;
  onToggleCheckIn: (date: string) => void;
  colors: any;
}

function HabitDetailScreen({ habit, checkIns, onBack, onToggleCheckIn, colors }: HabitDetailScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const habitCheckIns = checkIns.filter(c => c.habitId === habit.id);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.detailTitleContainer}>
          <ThemedText style={styles.title}>{habit.name}</ThemedText>
          <View style={[styles.detailCategoryTag, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={[styles.detailCategoryText, { color: colors.tint }]}>
              {habit.category}
            </ThemedText>
          </View>
        </View>
        <View style={styles.placeholder} />
      </ThemedView>

      <ScrollView style={styles.detailContent}>
        {/* 月日历 */}
        <HabitCalendar
          checkIns={habitCheckIns}
          onDatePress={onToggleCheckIn}
          habitColor={habit.color}
          colors={colors}
        />

        {/* 打卡记录 */}
        <CheckInHistory
          checkIns={habitCheckIns}
          colors={colors}
        />
      </ScrollView>
    </SafeAreaView>
  );
}



// 打卡历史组件
interface CheckInHistoryProps {
  checkIns: CheckIn[];
  colors: any;
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  habitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.7,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryFilter: {
    maxHeight: 50,
    marginBottom: 8,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedCategoryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  detailTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCategoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  detailCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
});