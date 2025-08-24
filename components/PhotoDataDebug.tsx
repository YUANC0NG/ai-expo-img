import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { OptimizedImage } from './OptimizedImage';
import { useMonthlyAlbums } from '../hooks/usePhotos';
import { StackedCards, PhotoItem } from './StackedCards';
import { PhotoAsset } from '../services/MediaLibraryService';

export const PhotoDataDebug: React.FC = () => {
  const { albums, loading, error } = useMonthlyAlbums();
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [convertedPhotos, setConvertedPhotos] = useState<PhotoItem[]>([]);
  const [showStackedCards, setShowStackedCards] = useState(false);

  // 转换照片数据格式
  const convertPhotoAssetToPhotoItem = (asset: PhotoAsset): PhotoItem => {
    const date = new Date(asset.creationTime);
    return {
      id: asset.id,
      uri: asset.uri,
      filename: asset.filename,
      time: date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      title: asset.filename || '未命名照片',
      creationTime: asset.creationTime,
      modificationTime: asset.modificationTime,
      mediaType: asset.mediaType,
      width: asset.width,
      height: asset.height,
    };
  };

  const handleAlbumSelect = (album: any) => {
    setSelectedAlbum(album);
    const converted = album.photos.map(convertPhotoAssetToPhotoItem);
    setConvertedPhotos(converted);
    
    console.log('选择的相册:', album.id);
    console.log('原始照片数据:', album.photos.slice(0, 3));
    console.log('转换后的照片数据:', converted.slice(0, 3));
  };

  const testStackedCards = () => {
    if (convertedPhotos.length === 0) {
      Alert.alert('提示', '请先选择一个相册');
      return;
    }
    setShowStackedCards(true);
  };

  if (showStackedCards) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowStackedCards(false)}
          >
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>测试滑动卡片</Text>
        </View>
        
        <StackedCards
          data={convertedPhotos}
          initialIndex={0}
          showTopBar={true}
          style={styles.stackedCards}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>加载相册中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>错误: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>照片数据调试</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>相册列表 ({albums.length})</Text>
        {albums.map((album) => (
          <TouchableOpacity
            key={album.id}
            style={[
              styles.albumItem,
              selectedAlbum?.id === album.id && styles.selectedAlbumItem
            ]}
            onPress={() => handleAlbumSelect(album)}
          >
            <OptimizedImage 
              uri={album.coverImage} 
              style={styles.albumCover} 
              contentFit="cover"
            />
            <View style={styles.albumInfo}>
              <Text style={styles.albumTitle}>{album.year}年{album.month}</Text>
              <Text style={styles.albumCount}>{album.photoCount} 张照片</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedAlbum && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            选中相册: {selectedAlbum.year}年{selectedAlbum.month}
          </Text>
          
          <TouchableOpacity style={styles.testButton} onPress={testStackedCards}>
            <Text style={styles.testButtonText}>测试滑动卡片</Text>
          </TouchableOpacity>

          <Text style={styles.subsectionTitle}>原始照片数据 (前3张):</Text>
          {selectedAlbum.photos.slice(0, 3).map((photo: PhotoAsset, index: number) => (
            <View key={photo.id} style={styles.photoDebugItem}>
              <Text style={styles.photoDebugTitle}>照片 {index + 1}</Text>
              <Text style={styles.photoDebugText}>ID: {photo.id}</Text>
              <Text style={styles.photoDebugText}>URI: {photo.uri?.substring(0, 60)}...</Text>
              <Text style={styles.photoDebugText}>文件名: {photo.filename}</Text>
              <Text style={styles.photoDebugText}>创建时间: {new Date(photo.creationTime).toLocaleString()}</Text>
              
              <View style={styles.photoPreview}>
                <OptimizedImage 
                  uri={photo.uri} 
                  style={styles.previewImage} 
                  contentFit="cover"
                />
              </View>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>转换后的照片数据 (前3张):</Text>
          {convertedPhotos.slice(0, 3).map((photo, index) => (
            <View key={photo.id} style={styles.photoDebugItem}>
              <Text style={styles.photoDebugTitle}>转换后照片 {index + 1}</Text>
              <Text style={styles.photoDebugText}>ID: {photo.id}</Text>
              <Text style={styles.photoDebugText}>URI: {photo.uri?.substring(0, 60)}...</Text>
              <Text style={styles.photoDebugText}>标题: {photo.title}</Text>
              <Text style={styles.photoDebugText}>时间: {photo.time}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stackedCards: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  error: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  albumItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedAlbumItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  albumInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  albumCount: {
    fontSize: 14,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoDebugItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoDebugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  photoDebugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  photoPreview: {
    marginTop: 8,
    alignItems: 'center',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});