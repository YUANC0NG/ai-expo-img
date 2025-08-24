import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { StackedCards, PhotoItem } from './StackedCards';

// 测试用的照片数据
const testPhotos: PhotoItem[] = [
  {
    id: '1',
    uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
    time: '2024-08-24 14:30',
    title: '测试照片 1'
  },
  {
    id: '2',
    uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
    time: '2024-08-24 15:30',
    title: '测试照片 2'
  },
  {
    id: '3',
    uri: 'https://storage.360buyimg.com/jdc-article/welcomenutui.jpg',
    time: '2024-08-24 16:30',
    title: '测试照片 3'
  },
  {
    id: '4',
    uri: 'https://storage.360buyimg.com/jdc-article/fristfabu.jpg',
    time: '2024-08-24 17:30',
    title: '测试照片 4'
  },
  {
    id: '5',
    uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
    time: '2024-08-24 18:30',
    title: '测试照片 5'
  },
];

export const StackedCardsTest: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>(testPhotos);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    console.log('当前照片索引:', index);
  };

  const handleReset = () => {
    setPhotos(testPhotos);
    setCurrentIndex(0);
    Alert.alert('重置成功', '所有照片已恢复');
  };

  const addMorePhotos = () => {
    const newPhotos: PhotoItem[] = [
      {
        id: `new-${Date.now()}-1`,
        uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
        time: new Date().toLocaleString(),
        title: '新增照片 1'
      },
      {
        id: `new-${Date.now()}-2`,
        uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
        time: new Date().toLocaleString(),
        title: '新增照片 2'
      },
    ];
    setPhotos(prev => [...prev, ...newPhotos]);
    Alert.alert('添加成功', `已添加 ${newPhotos.length} 张照片`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>滑动照片测试</Text>
        <Text style={styles.subtitle}>
          当前: {currentIndex + 1} / {photos.length}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>重置照片</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={addMorePhotos}>
          <Text style={styles.buttonText}>添加照片</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>操作说明:</Text>
        <Text style={styles.instructionItem}>• 左滑: 下一张照片</Text>
        <Text style={styles.instructionItem}>• 右滑: 上一张照片</Text>
        <Text style={styles.instructionItem}>• 上滑: 删除当前照片</Text>
        <Text style={styles.instructionItem}>• 点击宫格: 查看所有照片</Text>
        <Text style={styles.instructionItem}>• 点击垃圾桶: 查看已删除照片</Text>
      </View>

      <StackedCards
        data={photos}
        initialIndex={0}
        onIndexChange={handleIndexChange}
        onReset={handleReset}
        showTopBar={true}
        style={styles.stackedCards}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  stackedCards: {
    flex: 1,
  },
});