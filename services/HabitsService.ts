import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  createdAt: Date;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  createdAt: Date;
}

const HABITS_STORAGE_KEY = '@habits';
const CHECKINS_STORAGE_KEY = '@checkins';

class HabitsService {
  // 获取所有习惯
  async getHabits(): Promise<Habit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      if (habitsJson) {
        const habits = JSON.parse(habitsJson);
        return habits.map((habit: any) => ({
          ...habit,
          createdAt: new Date(habit.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  }

  // 获取所有分类
  async getCategories(): Promise<string[]> {
    try {
      const habits = await this.getHabits();
      const categories = [...new Set(habits.map(h => h.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  // 保存习惯
  async saveHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    try {
      const habits = await this.getHabits();
      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      
      habits.push(newHabit);
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      return newHabit;
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  }

  // 删除习惯
  async deleteHabit(habitId: string): Promise<void> {
    try {
      const habits = await this.getHabits();
      const filteredHabits = habits.filter(h => h.id !== habitId);
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(filteredHabits));
      
      // 同时删除相关的打卡记录
      const checkIns = await this.getCheckIns();
      const filteredCheckIns = checkIns.filter(c => c.habitId !== habitId);
      await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(filteredCheckIns));
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // 获取所有打卡记录
  async getCheckIns(): Promise<CheckIn[]> {
    try {
      const checkInsJson = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
      if (checkInsJson) {
        const checkIns = JSON.parse(checkInsJson);
        return checkIns.map((checkIn: any) => ({
          ...checkIn,
          createdAt: new Date(checkIn.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading check-ins:', error);
      return [];
    }
  }

  // 添加打卡记录
  async addCheckIn(habitId: string, date: string): Promise<CheckIn> {
    try {
      const checkIns = await this.getCheckIns();
      
      // 检查是否已经打卡
      const existingCheckIn = checkIns.find(c => c.habitId === habitId && c.date === date);
      if (existingCheckIn) {
        throw new Error('Already checked in for this date');
      }

      const newCheckIn: CheckIn = {
        id: `${habitId}-${date}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        habitId,
        date,
        createdAt: new Date(),
      };

      checkIns.push(newCheckIn);
      await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkIns));
      return newCheckIn;
    } catch (error) {
      console.error('Error adding check-in:', error);
      throw error;
    }
  }

  // 删除打卡记录
  async removeCheckIn(habitId: string, date: string): Promise<void> {
    try {
      const checkIns = await this.getCheckIns();
      const filteredCheckIns = checkIns.filter(c => !(c.habitId === habitId && c.date === date));
      await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(filteredCheckIns));
    } catch (error) {
      console.error('Error removing check-in:', error);
      throw error;
    }
  }

  // 获取特定习惯的打卡记录
  async getHabitCheckIns(habitId: string): Promise<CheckIn[]> {
    try {
      const checkIns = await this.getCheckIns();
      return checkIns.filter(c => c.habitId === habitId);
    } catch (error) {
      console.error('Error loading habit check-ins:', error);
      return [];
    }
  }

  // 获取习惯统计信息
  async getHabitStats(habitId: string): Promise<{
    totalCheckIns: number;
    currentStreak: number;
    longestStreak: number;
    thisMonthCheckIns: number;
  }> {
    try {
      const checkIns = await this.getHabitCheckIns(habitId);
      const sortedDates = checkIns
        .map(c => c.date)
        .sort()
        .reverse();

      const totalCheckIns = checkIns.length;
      
      // 计算当前连续天数
      let currentStreak = 0;
      const today = new Date();
      let checkDate = new Date(today);
      
      while (true) {
        const dateStr = this.formatDate(checkDate);
        if (sortedDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // 计算最长连续天数
      let longestStreak = 0;
      let tempStreak = 0;
      let prevDate: Date | null = null;

      for (const dateStr of sortedDates.reverse()) {
        const currentDate = new Date(dateStr);
        
        if (prevDate) {
          const dayDiff = Math.abs(currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        
        prevDate = currentDate;
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // 计算本月打卡次数
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();
      const thisMonthCheckIns = checkIns.filter(c => {
        const checkInDate = new Date(c.date);
        return checkInDate.getMonth() === thisMonth && checkInDate.getFullYear() === thisYear;
      }).length;

      return {
        totalCheckIns,
        currentStreak,
        longestStreak,
        thisMonthCheckIns,
      };
    } catch (error) {
      console.error('Error calculating habit stats:', error);
      return {
        totalCheckIns: 0,
        currentStreak: 0,
        longestStreak: 0,
        thisMonthCheckIns: 0,
      };
    }
  }

  // 格式化日期为 YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 重置所有数据
  async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HABITS_STORAGE_KEY);
      await AsyncStorage.removeItem(CHECKINS_STORAGE_KEY);
      console.log('All habits data has been reset');
    } catch (error) {
      console.error('Error resetting all data:', error);
      throw error;
    }
  }

  // 初始化示例数据
  async initializeSampleData(): Promise<void> {
    try {
      const existingHabits = await this.getHabits();
      if (existingHabits.length === 0) {
        const sampleHabits = [
          {
            name: '早起',
            description: '每天6点起床',
            color: '#FF6B6B',
            category: '健康',
          },
          {
            name: '运动',
            description: '每天运动30分钟',
            color: '#4ECDC4',
            category: '健康',
          },
          {
            name: '阅读',
            description: '每天阅读20页',
            color: '#45B7D1',
            category: '学习',
          },
        ];

        // 确保每个习惯有唯一的ID
        const habitsWithIds = sampleHabits.map((habit, index) => ({
          ...habit,
          id: `sample-habit-${index}`,
          createdAt: new Date(),
        }));

        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habitsWithIds));
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
}

export default new HabitsService();