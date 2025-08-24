import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { OptimizedImage } from './OptimizedImage';
import { usePhotos, usePhotosList, useMonthlyAlbums } from '../hooks/usePhotos';

// 使用完整功能的 hook
export const PhotoGalleryWithAlbums: React.FC = () => {
  const { photos, albums, loading, error, hasPermission, refreshPhotos, requestPermissions } = usePhotos();

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>需要相册权限才能查看照片</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>请求权限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>错误: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={refreshPhotos}>
          <Text style={styles.buttonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>相册 ({albums.length} 个月份)</Text>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshPhotos} />
        }
        renderItem={({ item }) => (
          <View style={styles.albumItem}>
            <OptimizedImage uri={item.coverImage} style={styles.coverImage} />
            <View style={styles.albumInfo}>
              <Text style={styles.albumTitle}>{item.year}年 {item.month}</Text>
              <Text style={styles.photoCount}>{item.photoCount} 张照片</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

// 使用简化版本的 hook - 只显示照片列表
export const SimplePhotoList: React.FC = () => {
  const { photos, loading, error, refetch } = usePhotosList();

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>错误: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={refetch}>
          <Text style={styles.buttonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>照片 ({photos.length} 张)</Text>
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.photoItem}>
            <OptimizedImage uri={item.uri} style={styles.photo} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// 只使用月度相册的 hook
export const MonthlyAlbumsView: React.FC = () => {
  const { albums, loading, error, refetch } = useMonthlyAlbums();

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>错误: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={refetch}>
          <Text style={styles.buttonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>月度相册</Text>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.albumItem}>
            <OptimizedImage uri={item.coverImage} style={styles.coverImage} />
            <View style={styles.albumInfo}>
              <Text style={styles.albumTitle}>{item.year}年 {item.month}</Text>
              <Text style={styles.photoCount}>{item.photoCount} 张照片</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  error: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  albumItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  photoItem: {
    flex: 1,
    margin: 2,
    aspectRatio: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});