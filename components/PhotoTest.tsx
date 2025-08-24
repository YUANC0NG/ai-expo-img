import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { OptimizedImage, OptimizedImageWithLoader } from './OptimizedImage';
import { mediaLibraryService, PhotoAsset } from '../services/MediaLibraryService';

export const PhotoTest: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 只获取前10张照片进行测试
      const allPhotos = await mediaLibraryService.getAllPhotos();
      setPhotos(allPhotos.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const showPhotoInfo = (photo: PhotoAsset) => {
    Alert.alert(
      '照片信息',
      `ID: ${photo.id}\nURI: ${photo.uri}\n文件名: ${photo.filename}\n尺寸: ${photo.width}x${photo.height}`,
      [{ text: '确定' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>错误: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadPhotos}>
          <Text style={styles.buttonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>照片测试 ({photos.length} 张)</Text>
      <TouchableOpacity style={styles.button} onPress={loadPhotos}>
        <Text style={styles.buttonText}>刷新</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollView}>
        {photos.map((photo, index) => (
          <View key={photo.id} style={styles.photoContainer}>
            <Text style={styles.photoIndex}>照片 {index + 1}</Text>
            <Text style={styles.photoUri} numberOfLines={1}>
              URI: {photo.uri}
            </Text>
            
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => showPhotoInfo(photo)}
            >
              <OptimizedImageWithLoader
                uri={photo.uri}
                style={styles.image}
                contentFit="cover"
              />
            </TouchableOpacity>
            
            <Text style={styles.photoInfo}>
              {photo.filename} • {photo.width}x{photo.height}
            </Text>
          </View>
        ))}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  error: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  photoContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  photoIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  photoUri: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoInfo: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});