import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { Photo } from '../../types/Photo';
import OptimizedImage from '../common/OptimizedImage';
import { theme } from '../../styles/theme';
import { GESTURE_CONFIG } from '../../utils/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PhotoSwiperProps {
  photos: Photo[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onSwipeUp?: (photo: Photo, index: number) => void;
  onSwipeDown?: (photo: Photo, index: number) => void;
  enableSwipeUp?: boolean;
  enableSwipeDown?: boolean;
}

export default function PhotoSwiper({
  photos,
  initialIndex = 0,
  onIndexChange,
  onSwipeUp,
  onSwipeDown,
  enableSwipeUp = true,
  enableSwipeDown = false,
}: PhotoSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 预加载相邻照片的索引
  const preloadIndices = useMemo(() => {
    const indices = [];
    for (let i = Math.max(0, currentIndex - 2); i <= Math.min(photos.length - 1, currentIndex + 2); i++) {
      indices.push(i);
    }
    return indices;
  }, [currentIndex, photos.length]);

  // 切换到指定索引
  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= photos.length) return;
    
    setCurrentIndex(index);
    onIndexChange?.(index);
  }, [photos.length, onIndexChange]);

  // 创建简单的手势响应器
  const panResponder = useMemo(() => 
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 || (enableSwipeUp && dy < -10);
      },
      
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy, vx, vy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        // 判断滑动方向和是否触发动作
        if (absX > absY) {
          // 水平滑动
          if (absX > GESTURE_CONFIG.SWIPE.horizontalThreshold || Math.abs(vx) > GESTURE_CONFIG.SWIPE.velocityThreshold) {
            if (dx > 0 && currentIndex > 0) {
              // 右滑 - 上一张
              goToIndex(currentIndex - 1);
            } else if (dx < 0 && currentIndex < photos.length - 1) {
              // 左滑 - 下一张
              goToIndex(currentIndex + 1);
            }
          }
        } else if (enableSwipeUp && dy < 0) {
          // 垂直向上滑动
          if (absY > GESTURE_CONFIG.SWIPE.verticalThreshold || Math.abs(vy) > GESTURE_CONFIG.SWIPE.velocityThreshold) {
            const currentPhoto = photos[currentIndex];
            onSwipeUp?.(currentPhoto, currentIndex);
          }
        }
      },
    }), 
    [currentIndex, photos.length, enableSwipeUp, goToIndex, onSwipeUp, photos]
  );

  // 渲染单张照片
  const renderPhoto = useCallback((photo: Photo, index: number) => {
    const isVisible = preloadIndices.includes(index);
    const isCurrent = index === currentIndex;
    
    if (!isVisible) return null;
    
    return (
      <View
        key={photo.id}
        style={[
          styles.photoContainer,
          {
            opacity: isCurrent ? 1 : 0,
            zIndex: isCurrent ? 1 : 0,
          },
        ]}
      >
        <OptimizedImage
          photo={photo}
          width={screenWidth}
          height={screenHeight}
          style={styles.photo}
          resizeMode="contain"
          priority={isCurrent ? 'high' : 'normal'}
        />
      </View>
    );
  }, [preloadIndices, currentIndex]);

  if (photos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          {/* 空状态 */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.swiperContainer} {...panResponder.panHandlers}>
        {photos.map((photo, index) => renderPhoto(photo, index))}
        
        {/* 垃圾桶指示器 */}
        {enableSwipeUp && (
          <View style={styles.trashIndicator}>
            <View style={styles.trashIcon}>
              <View style={styles.trashIconInner} />
            </View>
          </View>
        )}
      </View>
      
      {/* 照片指示器 */}
      <View style={styles.indicator}>
        <View style={styles.indicatorContent}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                index === currentIndex && styles.indicatorDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  swiperContainer: {
    flex: 1,
    position: 'relative',
  },
  photoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 2,
  },
  indicatorDotActive: {
    backgroundColor: theme.colors.white,
  },
  trashIndicator: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.xl,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.base,
  },
  trashIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashIconInner: {
    width: 14,
    height: 2,
    backgroundColor: theme.colors.white,
    borderRadius: 1,
  },
});