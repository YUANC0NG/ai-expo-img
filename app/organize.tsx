import React, { useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StackedCards, PhotoItem } from '../components/StackedCards';
import { PhotoAsset } from '../services/MediaLibraryService';

export default function OrganizeScreen() {
  const { photos, albumId } = useLocalSearchParams();
  const navigation = useNavigation();
  
  // 默认照片数据，实际使用时会从相册传入
  const defaultPhotos: PhotoItem[] = [
    {
      id: '1',
      url: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
      time: '2024-01-15 14:30',
      title: '美丽风景'
    },
    {
      id: '2',
      url: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
      time: '2024-01-16 09:15',
      title: '城市夜景'
    },
    {
      id: '3',
      url: 'https://storage.360buyimg.com/jdc-article/welcomenutui.jpg',
      time: '2024-01-17 16:45',
      title: '欢迎界面'
    },
    {
      id: '4',
      url: 'https://storage.360buyimg.com/jdc-article/fristfabu.jpg',
      time: '2024-01-18 11:20',
      title: '首次发布'
    },
  ];

  // 转换真实照片数据格式
  const convertPhotoAssetToPhotoItem = (asset: PhotoAsset): PhotoItem => {
    const date = new Date(asset.creationTime);
    const photoItem: PhotoItem = {
      id: asset.id || `photo-${Date.now()}-${Math.random()}`, // 确保有唯一 ID
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

    return photoItem;
  };

  // 解析传入的照片数据和相册信息
  let photoList: PhotoItem[] = defaultPhotos;
  let albumTitle = '照片整理';
  
  if (photos && typeof photos === 'string') {
    try {
      const parsedPhotos: PhotoAsset[] = JSON.parse(photos);
      if (parsedPhotos.length > 0) {
        // 转换为 PhotoItem 格式
        photoList = parsedPhotos.map(convertPhotoAssetToPhotoItem);
        console.log('成功解析照片数据:', photoList.length, '张照片');
        
        // 从第一张照片的时间推断年月作为标题
        if (photoList.length > 0 && photoList[0].creationTime) {
          const date = new Date(photoList[0].creationTime);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          albumTitle = `${year}年${month}月`;
        }
      }
    } catch (error) {
      console.log('解析照片数据失败:', error);
      // 使用默认照片数据
    }
  }
  
  // 如果有albumId参数，尝试从中解析年月信息
  if (albumId && typeof albumId === 'string') {
    const parts = albumId.split('-');
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      albumTitle = `${year}年${month}月`;
    }
  }

  const handleIndexChange = (index: number) => {
    console.log('当前索引:', index);
  };

  const handleReset = () => {
    console.log('卡片已重置');
  };

  // 动态设置导航标题
  useLayoutEffect(() => {
    navigation.setOptions({
      title: albumTitle,
    });
  }, [navigation, albumTitle]);

  return (
    <View style={styles.container}>
      <StackedCards 
        data={photoList}
        initialIndex={0}
        onIndexChange={handleIndexChange}
        onReset={handleReset}
        showTopBar={true}
        style={styles.stackedCards}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  stackedCards: {
    flex: 1,
  },
});