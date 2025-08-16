import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Photo } from '../../types/Photo';
import SlideBoxPhotoViewer from './SlideBoxPhotoViewer';
import { theme } from '../../styles/theme';
import { PhotoUtils } from '../../utils/photoUtils';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex?: number;
  onClose?: () => void;
  onDelete?: (photo: Photo, index: number) => void;
  onShare?: (photo: Photo) => void;
  showControls?: boolean;
  title?: string;
}

export default function PhotoViewer({
  photos,
  initialIndex = 0,
  onClose,
  onDelete,
  onShare,
  showControls = true,
  title,
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);

  const currentPhoto = useMemo(() => {
    return photos[currentIndex];
  }, [photos, currentIndex]);

  // 切换控件显示状态
  const toggleControls = useCallback(() => {
    setControlsVisible(prev => !prev);
  }, []);

  // 处理索引变化
  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 处理上滑删除
  const handleSwipeUp = useCallback((photo: Photo, index: number) => {
    onDelete?.(photo, index);
  }, [onDelete]);

  // 处理分享
  const handleShare = useCallback(() => {
    if (currentPhoto) {
      onShare?.(currentPhoto);
    }
  }, [currentPhoto, onShare]);

  // 格式化照片信息
  const photoInfo = useMemo(() => {
    if (!currentPhoto) return null;
    
    return {
      filename: currentPhoto.filename,
      dimensions: `${currentPhoto.width} × ${currentPhoto.height}`,
      creationTime: PhotoUtils.formatCreationTime(currentPhoto.creationTime, 'datetime'),
      aspectRatio: PhotoUtils.getAspectRatio(currentPhoto).toFixed(2),
      isLandscape: PhotoUtils.isLandscape(currentPhoto),
    };
  }, [currentPhoto]);

  if (photos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>没有照片可显示</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* 照片滑动器 */}
      <Pressable style={styles.photoContainer} onPress={toggleControls}>
        <SlideBoxPhotoViewer
          photos={photos}
          initialIndex={initialIndex}
          onIndexChange={handleIndexChange}
          onSwipeUp={handleSwipeUp}
          enableSwipeUp={!!onDelete}
        />
      </Pressable>

      {/* 顶部控制栏 */}
      {showControls && controlsVisible && (
        <View style={styles.topControls}>
          <SafeAreaView edges={['top']}>
            <View style={styles.topControlsContent}>
              <Pressable style={styles.controlButton} onPress={onClose}>
                <Text style={styles.controlButtonText}>✕</Text>
              </Pressable>
              
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {title || photoInfo?.filename || '照片'}
                </Text>
              </View>
              
              <Pressable style={styles.controlButton} onPress={handleShare}>
                <Text style={styles.controlButtonText}>↗</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
  },
  topControlsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.medium,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.white,
  },
  photoContainer: {
    flex: 1,
  },
});