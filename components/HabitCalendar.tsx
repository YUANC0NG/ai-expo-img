import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CheckIn } from '@/services/HabitsService';

interface HabitCalendarProps {
  checkIns: CheckIn[];
  onDatePress: (date: string) => void;
  habitColor: string;
  colors: any;
}

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 40; // 减去左右边距
const DAY_SIZE = (CALENDAR_WIDTH - 48) / 7; // 减去内边距，除以7天

export default function HabitCalendar({ checkIns, onDatePress, habitColor, colors }: HabitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 添加空白天数
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 添加月份中的天数
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const isCheckedIn = (day: number) => {
    const dateStr = formatDate(day);
    return checkIns.some(c => c.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <ThemedView style={[styles.calendar, { backgroundColor: colors.background }]}>
      {/* 月份导航 */}
      <View style={styles.monthHeader}>
        <TouchableOpacity 
          onPress={() => navigateMonth('prev')}
          style={styles.navButton}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <ThemedText style={styles.monthTitle}>
          {currentMonth.getFullYear()}年{monthNames[currentMonth.getMonth()]}
        </ThemedText>
        
        <TouchableOpacity 
          onPress={() => navigateMonth('next')}
          style={styles.navButton}
        >
          <IconSymbol name="chevron.right" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* 星期标题 */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayContainer}>
            <Text style={[styles.weekDay, { color: colors.text }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      {/* 日期网格 */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day && isToday(day) && styles.todayCell,
              day && isCheckedIn(day) && [styles.checkedCell, { backgroundColor: habitColor }],
            ]}
            onPress={() => day && onDatePress(formatDate(day))}
            disabled={!day}
          >
            {day && (
              <>
                <Text style={[
                  styles.dayText,
                  isToday(day) && styles.todayText,
                  isCheckedIn(day) && styles.checkedText,
                  { color: isCheckedIn(day) ? 'white' : colors.text }
                ]}>
                  {day}
                </Text>
                {isCheckedIn(day) && (
                  <View style={styles.checkMark}>
                    <IconSymbol name="checkmark" size={10} color="white" />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>
            {checkIns.filter(c => {
              const checkInDate = new Date(c.date);
              return checkInDate.getMonth() === currentMonth.getMonth() && 
                     checkInDate.getFullYear() === currentMonth.getFullYear();
            }).length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>本月打卡</ThemedText>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>
            {checkIns.length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>总计打卡</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  calendar: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayContainer: {
    width: DAY_SIZE,
    alignItems: 'center',
  },
  weekDay: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DAY_SIZE / 2,
    marginVertical: 2,
    position: 'relative',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  checkedCell: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkedText: {
    fontWeight: 'bold',
  },
  checkMark: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
});