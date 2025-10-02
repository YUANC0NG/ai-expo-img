import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import HabitsService, { Habit, CheckIn } from '@/services/HabitsService';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const colors = Colors[colorScheme ?? 'light'];

  // 获取今天的日期字符串，避免在渲染过程中重复计算
  const todayString = new Date().toISOString().split('T')[0];

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
    router.push(`/habit-detail?id=${habit.id}`);
  };

  // 筛选习惯
  const filteredHabits = selectedCategory === '全部' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  
  // 计算单个习惯的完成率
  const calculateHabitCompletionRate = (habit: Habit) => {
    const today = new Date();
    const habitStart = new Date(habit.createdAt);
    const daysSinceStart = Math.floor((today.getTime() - habitStart.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysSinceStart === 0) return 0;
    
    const habitCheckIns = checkIns.filter(c => c.habitId === habit.id);
    const completionRate = (habitCheckIns.length / (daysSinceStart + 1)) * 100;
    return Math.round(completionRate);
  };

  // 处理今日打卡（切换打卡状态）
  const handleTodayCheckIn = async (habit: Habit) => {
    try {
      const existingCheckIn = checkIns.find(c => c.habitId === habit.id && c.date === todayString);
      
      if (existingCheckIn) {
        // 取消打卡
        await HabitsService.removeCheckIn(habit.id, todayString);
        setCheckIns(prev => prev.filter(c => !(c.habitId === habit.id && c.date === todayString)));
      } else {
        // 新增打卡
        const newCheckIn = await HabitsService.addCheckIn(habit.id, todayString);
        setCheckIns(prev => [...prev, newCheckIn]);
      }
    } catch (error) {
      console.error('Error toggling check-in:', error);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  
  // 处理删除习惯
  const handleDeleteHabit = async (habit: Habit) => {
    try {
      await HabitsService.deleteHabit(habit.id);
      // 更新本地状态 - 移除已删除的习惯和相关的打卡记录
      setHabits(prev => prev.filter(h => h.id !== habit.id));
      setCheckIns(prev => prev.filter(c => c.habitId !== habit.id));
    } catch (error) {
      console.error('Error deleting habit:', error);
      Alert.alert('错误', '删除习惯失败，请重试');
    }
  };

  // 可滑动的习惯卡片组件
  const SwipeableHabitCard = ({ habit, colors, onPress }: { 
    habit: Habit; 
    colors: any; 
    onPress: () => void;
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => {
          return Math.abs(gesture.dx) > Math.abs(gesture.dy);
        },
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx < 0) { // 只允许向左滑动
            translateX.setValue(gesture.dx);
            }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -80) {
            // 滑动超过阈值，显示删除确认
            Alert.alert(
              '删除习惯',
              `确定要删除习惯"${habit.name}"吗？\n\n删除后所有相关打卡记录也将被清除。`,
              [
                {
                  text: '取消',
                  style: 'cancel',
                  onPress: () => {
                    Animated.spring(translateX, {
                      toValue: 0,
                      useNativeDriver: true,
                    }).start();
                  },
                },
                {
                  text: '删除',
                  style: 'destructive',
                  onPress: () => handleDeleteHabit(habit),
                },
              ],
              { cancelable: true }
            );
          } else {
            // 滑回原位
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    return (
      <Animated.View
        style={[
          styles.swipeableContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.deleteButton,
            {
              opacity: translateX.interpolate({
                inputRange: [-80, -50, 0],
                outputRange: [1, 0, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <IconSymbol name="trash" size={20} color="white" />
          <Text style={styles.deleteButtonText}>删除</Text>
        </Animated.View>
        
        <TouchableOpacity
          style={[styles.habitCard, { backgroundColor: colors.card }]}
          onPress={onPress}
          activeOpacity={1}
          {...panResponder.panHandlers}
        >
          {renderHabitCardContent(habit, colors)}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 渲染习惯卡片内容
  const renderHabitCardContent = (habit: Habit, colors: any) => {
    const todayCheckIn = checkIns.find(c => 
      c.habitId === habit.id && c.date === todayString
    );
    const completionRate = calculateHabitCompletionRate(habit);

    return (
      <>
        <View style={styles.habitCardLeft}>
          <View style={[styles.progressCircle, { borderColor: habit.color }]}>
            <IconSymbol 
              name={
                completionRate <= 25 ? "circle" :
                completionRate <= 50 ? "circle.lefthalf.filled" :
                completionRate <= 75 ? "circle.righthalf.filled" : "checkmark.circle.fill"
              }
              size={24}
              color={habit.color}
            />
          </View>
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
        </View>
        <View style={styles.habitCardRight}>
          {todayCheckIn ? (
            <TouchableOpacity 
              style={[styles.checkedButton, { backgroundColor: habit.color + '20' }]}
              onPress={(e) => {
                e.stopPropagation();
                handleTodayCheckIn(habit);
              }}
            >
              <IconSymbol name="checkmark" size={16} color={habit.color} />
              <ThemedText style={[styles.checkedText, { color: habit.color }]}>已打卡</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.checkButton, { backgroundColor: habit.color }]}
              onPress={(e) => {
                e.stopPropagation();
                handleTodayCheckIn(habit);
              }}
            >
              <IconSymbol name="plus" size={16} color="white" />
              <ThemedText style={styles.checkButtonText}>打卡</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}></ThemedText>
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

      
      {/* 今日习惯 */}
      <View style={styles.todayHabitsContainer}>
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
            <SwipeableHabitCard
              key={habit.id}
              habit={habit}
              colors={colors}
              onPress={() => handleHabitPress(habit)}
            />
          ))
          )}
        </ScrollView>
      </View>

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







const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  todayHabitsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 24,
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
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
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  checkButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  checkedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  checkedText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  swipeableContainer: {
    marginVertical: 8,
    overflow: 'hidden',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});