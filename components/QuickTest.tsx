import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StackedCards, PhotoItem } from './StackedCards';

// 测试用的照片数据，模拟真实照片格式
const testPhotos: PhotoItem[] = [
  {
    id: 'test-1',
    uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
    filename: 'test1.jpg',
    time: '2024-08-24 14:30',
    title: '测试照片 1',
    creationTime: Date.now() - 86400000,
    width: 800,
    height: 600,
  },
  {
    id: 'test-2',
    uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
    filename: 'test2.jpg',
    time: '2024-08-24 15:30',
    title: '测试照片 2',
    creationTime: Date.now() - 43200000,
    width: 800,
    height: 600,
  },
  {
    id: 'test-3',
    uri: 'https://storage.360buyimg.com/jdc-article/welcomenutui.jpg',
    filename: 'test3.jpg',
    time: '2024-08-24 16:30',
    title: '测试照片 3',
    creationTime: Date.now() - 21600000,
    width: 800,
    height: 600,
  },
  {
    id: 'test-4',
    uri: 'https://storage.360buyimg.com/jdc-article/fristfabu.jpg',
    filename: 'test4.jpg',
    time: '2024-08-24 17:30',
    title: '测试照片 4',
    creationTime: Date.now() - 10800000,
    width: 800,
    height: 600,
  },
  {
    id: 'test-5',
    uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
    filename: 'test5.jpg',
    time: '2024-08-24 18:30',
    title: '测试照片 5',
    creationTime: Date.now() - 5400000,
    width: 800,
    height: 600,
  },
  {
    id: 'test-6',
    uri: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
    filename: 'test6.jpg',
    time: '2024-08-24 19:30',
    title: '测试照片 6',
    creationTime: Date.now() - 2700000,
    width: 800,
    height: 600,
  },
];

export const QuickTest: React.FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    console.log('当前照片索引:', index, '/', testPhotos.length);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    Alert.alert('重置成功', '已重置到第一张照片');
  };

  const showPhotoInfo = () => {
    const currentPhoto = testPhotos[currentIndex];
    if (currentPhoto) {
      Alert.alert(
        '当前照片信息',
        `ID: ${currentPhoto.id}\n标题: ${currentPhoto.title}\n文件名: ${currentPhoto.filename}\n时间: ${currentPhoto.time}`,
        [{ text: '确定' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>快速测试</Text>
        <Text style={styles.subtitle}>
          当前: {currentIndex + 1} / {testPhotos.length}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={showPhotoInfo}>
          <Text style={styles.buttonText}>照片信息</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>重置</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>测试说明:</Text>
        <Text style={styles.instructionItem}>✅ 所有照片都应该能正确显示</Text>
        <Text style={styles.instructionItem}>✅ 上滑删除后应该能继续滑动</Text>
        <Text style={styles.instructionItem}>✅ 垃圾桶删除功能应该正常工作</Text>
        <Text style={styles.instructionItem}>✅ 左右滑动应该流畅</Text>
      </View>

      <StackedCards
        data={testPhotos}
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