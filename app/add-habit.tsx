import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import HabitsService from '@/services/HabitsService';

const DEFAULT_CATEGORIES = ['健康', '学习', '工作', '生活', '运动', '阅读'];

export default function AddHabitScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const colors = Colors[colorScheme ?? 'light'];

  // 加载已有分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await HabitsService.getCategories();
        setExistingCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请输入习惯名称');
      return;
    }

    const finalCategory = showCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      Alert.alert('错误', '请选择或输入分类');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving habit with data:', {
        name: name.trim(),
        description: description.trim(),
        color: '#4ECDC4',
        category: finalCategory,
      });
      
      const newHabit = await HabitsService.saveHabit({
        name: name.trim(),
        description: description.trim(),
        color: '#4ECDC4', // 使用默认颜色
        category: finalCategory,
      });
      
      console.log('New habit created:', newHabit);
      
      // 验证保存是否成功
      const savedHabits = await HabitsService.getHabits();
      console.log('All habits after save:', savedHabits);
      
      Alert.alert('成功', '习惯创建成功', [
        { text: '确定', onPress: () => {
          router.back();
        }}
      ]);
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>新建习惯</ThemedText>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, { opacity: saving ? 0.6 : 1 }]}
          disabled={saving}
        >
          <ThemedText style={[styles.saveButtonText, { color: colors.tint }]}>
            {saving ? '保存中...' : '保存'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>习惯名称</ThemedText>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background,
              borderColor: colors.border || '#E0E0E0',
              color: colors.text,
            }]}
            value={name}
            onChangeText={setName}
            placeholder="例如：早起、运动、阅读"
            placeholderTextColor={colors.text + '80'}
            maxLength={20}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>描述（可选）</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: colors.background,
              borderColor: colors.border || '#E0E0E0',
              color: colors.text,
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="描述这个习惯的具体内容"
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={3}
            maxLength={100}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>选择分类</ThemedText>
          
          {/* 已有分类 */}
          <View style={styles.categoryGrid}>
            {[...new Set([...DEFAULT_CATEGORIES, ...existingCategories.filter(cat => cat && cat.trim())])].map((cat) => (
              cat && cat.trim() && (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    { borderColor: colors.border || '#E0E0E0' },
                    category === cat && [styles.selectedCategory, { backgroundColor: colors.tint }],
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCustomCategory(false);
                  }}
                >
                  <ThemedText style={[
                    styles.categoryOptionText,
                    category === cat && styles.selectedCategoryText,
                  ]}>
                    {cat}
                  </ThemedText>
                </TouchableOpacity>
              )
            ))}
            
            {/* 自定义分类按钮 */}
            <TouchableOpacity
              style={[
                styles.categoryOption,
                styles.customCategoryOption,
                { borderColor: colors.border || '#E0E0E0' },
                showCustomCategory && [styles.selectedCategory, { backgroundColor: colors.tint }],
              ]}
              onPress={() => {
                setShowCustomCategory(true);
                setCategory('');
              }}
            >
              <IconSymbol name="plus" size={16} color={showCustomCategory ? 'white' : colors.text} />
              <ThemedText style={[
                styles.categoryOptionText,
                styles.customCategoryText,
                showCustomCategory && styles.selectedCategoryText,
              ]}>
                自定义
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* 自定义分类输入 */}
          {showCustomCategory && (
            <TextInput
              style={[styles.input, styles.customCategoryInput, { 
                backgroundColor: colors.background,
                borderColor: colors.border || '#E0E0E0',
                color: colors.text,
              }]}
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="输入自定义分类"
              placeholderTextColor={colors.text + '80'}
              maxLength={10}
            />
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  customCategoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedCategory: {
    borderColor: 'transparent',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customCategoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: 'white',
  },
  customCategoryInput: {
    marginTop: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});