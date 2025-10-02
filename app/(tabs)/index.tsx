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
    setSelectedHabit(habit);
  };

  const handleBackToList = () => {
    setSelectedHabit(null);
  };

  // 筛选习惯
  const filteredHabits = selectedCategory === '全部' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  // 计算本周完成率
  const calculateWeeklyCompletionRate = () => {
    if (habits.length === 0) return 0;
    
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const weekCheckIns = checkIns.filter(c => {
      const checkInDate = new Date(c.date);
      return checkInDate >= weekStart && checkInDate < weekEnd;
    });
    
    const totalPossibleHabits = habits.length * 7;
    const completionRate = (weekCheckIns.length / totalPossibleHabits) * 100;
    return Math.round(completionRate);
  };

  // 计算本月完成率
  const calculateMonthlyCompletionRate = () => {
    if (habits.length === 0) return 0;
    
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const monthCheckIns = checkIns.filter(c => {
      const checkInDate = new Date(c.date);
      return checkInDate >= monthStart && checkInDate < monthEnd;
    });
    
    const daysInMonth = (monthEnd.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000);
    const totalPossibleHabits = habits.length * daysInMonth;
    const completionRate = (monthCheckIns.length / totalPossibleHabits) * 100;
    return Math.round(completionRate);
  };

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
    const [isSwiped, setIsSwiped] = useState(false);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => {
          return Math.abs(gesture.dx) > Math.abs(gesture.dy);
        },
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx < 0) { // 只允许向左滑动
            translateX.setValue(gesture.dx);
            if (gesture.dx < -80) {
              setIsSwiped(true);
            } else {
              setIsSwiped(false);
            }
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
                    setIsSwiped(false);
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
      <ThemedView style={styles.detailHeader}>
        <TouchableOpacity 
          onPress={onBack} 
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

// 单个习惯周记录组件
interface WeeklyRecordDetailProps {
  habit: Habit;
  checkIns: CheckIn[];
  onToggleCheckIn: (date: string) => void;
  colors: any;
}

function WeeklyRecordDetail({ habit, checkIns, onToggleCheckIn, colors }: WeeklyRecordDetailProps) {
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <ThemedView style={[styles.weeklyRecordContainer, { backgroundColor: colors.card }]}>
      <View style={styles.weeklyHeader}>
        {dayNames.map((day, index) => (
          <ThemedText key={day} style={styles.weeklyDayText}>
            {day}
          </ThemedText>
        ))}
      </View>
      
      <View style={styles.weeklyDetailContent}>
        <View style={styles.weeklyDetailRow}>
          <ThemedText style={styles.weeklyDetailHabitName} numberOfLines={1}>
            {habit.name}
          </ThemedText>
          <View style={styles.weeklyDetailDays}>
            {weekDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const checkIn = checkIns.find(c => c.date === dateStr);
              
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.weeklyDayCell,
                    checkIn && [styles.checkedCell, { backgroundColor: habit.color }]
                  ]}
                  onPress={() => onToggleCheckIn(dateStr)}
                >
                  {checkIn && (
                    <IconSymbol name="checkmark" size={12} color="white" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

// 周记录组件
interface WeeklyRecordProps {
  habits: Habit[];
  checkIns: CheckIn[];
  onToggleCheckIn: (habit: Habit) => void;
  colors: any;
}

function WeeklyRecord({ habits, checkIns, onToggleCheckIn, colors }: WeeklyRecordProps) {
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <ThemedView style={[styles.weeklyRecordContainer, { backgroundColor: colors.card }]}>
      <View style={styles.weeklyHeader}>
        {dayNames.map((day, index) => (
          <ThemedText key={day} style={styles.weeklyDayText}>
            {day}
          </ThemedText>
        ))}
      </View>
      
      <View style={styles.weeklyContent}>
        {habits.map((habit) => (
          <View key={habit.id} style={styles.weeklyHabitRow}>
            <ThemedText style={styles.weeklyHabitName} numberOfLines={1}>
              {habit.name}
            </ThemedText>
            <View style={styles.weeklyDays}>
              {weekDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const checkIn = checkIns.find(c => 
                  c.habitId === habit.id && c.date === dateStr
                );
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[
                      styles.weeklyDayCell,
                      isToday && styles.todayCell,
                      checkIn && [styles.checkedCell, { backgroundColor: habit.color }]
                    ]}
                    onPress={() => isToday && onToggleCheckIn(habit)}
                    disabled={!isToday}
                  >
                    {checkIn && (
                      <IconSymbol name="checkmark" size={12} color="white" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
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
    marginLeft: -60, // Compensate for back button width
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
    width: 40, // Same as back button area
  },
  weeklyRecordContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  weeklyDayText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  weeklyContent: {
    padding: 16,
  },
  weeklyHabitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weeklyHabitName: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
    marginRight: 12,
  },
  weeklyDays: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  weeklyDayCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  checkedCell: {
    borderWidth: 0,
  },
  weeklyDetailContent: {
    padding: 16,
  },
  weeklyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyDetailHabitName: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
    marginRight: 12,
  },
  weeklyDetailDays: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
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