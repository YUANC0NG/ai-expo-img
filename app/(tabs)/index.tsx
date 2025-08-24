import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface AlbumMonth {
  id: string;
  month: string;
  year: number;
  photoCount: number;
  coverImage: string;
  photos: {
    id: string;
    url: string;
    time: string;
    title: string;
  }[];
}

// 模拟按月分类的相册数据
const albumData: AlbumMonth[] = [
  {
    id: '2024-08',
    month: '8月',
    year: 2024,
    photoCount: 156,
    coverImage: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
    photos: [
      {
        id: '1',
        url: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
        time: '2024-08-15 14:30',
        title: '美丽风景'
      },
      {
        id: '2',
        url: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
        time: '2024-08-16 09:15',
        title: '城市夜景'
      }
    ]
  },
  {
    id: '2024-07',
    month: '7月',
    year: 2024,
    photoCount: 89,
    coverImage: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
    photos: [
      {
        id: '3',
        url: 'https://storage.360buyimg.com/jdc-article/welcomenutui.jpg',
        time: '2024-07-17 16:45',
        title: '欢迎界面'
      }
    ]
  },
  {
    id: '2024-06',
    month: '6月',
    year: 2024,
    photoCount: 234,
    coverImage: 'https://storage.360buyimg.com/jdc-article/welcomenutui.jpg',
    photos: [
      {
        id: '4',
        url: 'https://storage.360buyimg.com/jdc-article/fristfabu.jpg',
        time: '2024-06-18 11:20',
        title: '首次发布'
      }
    ]
  },
  {
    id: '2024-05',
    month: '5月',
    year: 2024,
    photoCount: 67,
    coverImage: 'https://storage.360buyimg.com/jdc-article/fristfabu.jpg',
    photos: []
  }
];

export default function AlbumScreen() {
  const handleAlbumPress = (album: AlbumMonth) => {
    // 导航到整理照片页面，传递该月的照片数据
    router.push({
      pathname: '/organize',
      params: { 
        albumId: album.id,
        photos: JSON.stringify(album.photos)
      }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>我的相册</ThemedText>
        <ThemedText style={styles.subtitle}>按月整理您的照片</ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {albumData.map((album) => (
          <TouchableOpacity
            key={album.id}
            style={styles.albumItem}
            onPress={() => handleAlbumPress(album)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: album.coverImage }} style={styles.coverImage} />
            <View style={styles.albumInfo}>
              <Text style={styles.albumTitle}>{album.year}年{album.month}</Text>
              <Text style={styles.photoCount}>{album.photoCount} 张照片</Text>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#999',
  },
});
