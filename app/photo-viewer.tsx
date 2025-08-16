import React, { useCallback } from 'react';
import { View, Alert, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Photo } from '../src/types/Photo';
import { usePhotoViewer } from '../src/hooks/usePhotoViewer';
import { useTrash } from '../src/contexts/TrashContext';
import PhotoViewer from '../src/components/photo/PhotoViewer';
import LoadingSpinner from '../src/components/common/LoadingSpinner';
import { commonStyles } from '../src/styles/common';
import { AlbumService } from '../src/services/AlbumService';

export default function PhotoViewerScreen() {
  const params = useLocalSearchParams();
  const year = parseInt(params.year as string, 10);
  const month = parseInt(params.month as string, 10);
  const initialPhotoId = params.photoId as string | undefined;

  const {
    photos,
    loading,
    error,
    currentIndex,
    currentPhoto,
    setCurrentIndex,
    refresh,
  } = usePhotoViewer({
    year,
    month,
    initialPhotoId,
  });

  const albumService = AlbumService.getInstance();
  const { addToTrash } = useTrash();

  // 处理关闭
  const handleClose = useCallback(() => {
    router.back();
  }, []);

  // 处理删除照片（直接添加到垃圾桶，不弹确认框）
  const handleDelete = useCallback(async (photo: Photo, index: number) => {
    try {
      // 直接将照片添加到垃圾桶
      await addToTrash(photo, index);
      
      // 如果是最后一张照片，返回上一页
      if (photos.length === 1) {
        router.back();
      } else {
        // 刷新照片列表
        await refresh();
        
        // 调整当前索引
        if (index >= photos.length - 1) {
          setCurrentIndex(Math.max(0, photos.length - 2));
        }
      }
    } catch (error) {
      Alert.alert('删除失败', '无法删除照片，请重试');
    }
  }, [photos.length, refresh, setCurrentIndex, addToTrash]);

  // 处理分享照片
  const handleShare = useCallback(async (photo: Photo) => {
    try {
      await Share.share({
        url: photo.uri,
        title: photo.filename,
      });
    } catch (error) {
      Alert.alert('分享失败', '无法分享照片，请重试');
    }
  }, []);

  // 生成标题
  const getTitle = useCallback(() => {
    const monthName = albumService.getMonthName(month);
    return `${year}年${monthName}`;
  }, [year, month, albumService]);

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.errorContainer}>
        {/* TODO: 添加错误处理UI */}
      </View>
    );
  }

  return (
    <PhotoViewer
      photos={photos}
      initialIndex={currentIndex}
      onClose={handleClose}
      onDelete={handleDelete}
      onShare={handleShare}
      title={getTitle()}
    />
  );
}