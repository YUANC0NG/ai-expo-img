import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { OptimizedImage } from '@/components/OptimizedImage';
import { mediaLibraryService, AlbumMonth } from '@/services/MediaLibraryService';

export default function AlbumScreen() {
  const [albums, setAlbums] = useState<AlbumMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 加载相册数据
  const loadAlbums = async () => {
    try {
      console.log('开始加载相册数据...');
      const albumData = await mediaLibraryService.getMonthlyAlbums();
      console.log('相册数据加载完成:', albumData.length, '个月份');
      setAlbums(albumData);
    } catch (error) {
      console.error('加载相册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlbums();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAlbums();
  }, []);
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

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>正在加载相册...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>我的相册</ThemedText>
        <ThemedText style={styles.subtitle}>按月整理您的照片</ThemedText>
      </ThemedView>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {albums.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>暂无照片</ThemedText>
            <ThemedText style={styles.emptySubtext}>请检查相册权限或添加一些照片</ThemedText>
          </View>
        ) : (
          albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumItem}
              onPress={() => handleAlbumPress(album)}
              activeOpacity={0.7}
            >
              <OptimizedImage uri={album.coverImage} style={styles.coverImage} />
              <View style={styles.albumInfo}>
                <Text style={styles.albumTitle}>{album.year}年{album.month}</Text>
                <Text style={styles.photoCount}>{album.photoCount} 张照片</Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
