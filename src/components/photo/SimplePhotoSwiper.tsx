import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { Photo } from '../../types/Photo';
import OptimizedImage from '../common/OptimizedImage';
import { theme } from '../../styles/theme';
import { GESTURE_CONFIG } from '../../utils/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SimplePhotoSwiperProps {
  photos: Photo[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onSwipeUp?: (photo: Photo, index: number) => void;
  enableSwipeUp?: boolean;
}

export default function SimplePhotoSwiper({
  photos,
  initialIndex = 0,
  onIndexChange,
  onSwipeUp,
  enableSwipeUp = true,
}: SimplePhotoSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 切换到指定索引
  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= photos.length) return;
    
    setCurrentIndex(index);
    onIndexChange?.(index);
  }, [photos.length, onIndexChange]);

  // 创建手势响应器
  const panResponder = useMemo(() => 
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 20 || (enableSwipeUp && dy < -20);
      },
      
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        if (absX > absY && absX > 50) {
          // 水平滑动
          if (dx > 0 && currentIndex > 0) {
            // 右滑 - 上一张
            goToIndex(currentIndex - 1);
          } else if (dx < 0 && currentIndex < photos.length - 1) {
            // 左滑 - 下一张
            goToIndex(currentIndex + 1);
          }
        } else if (enableSwipeUp && dy < -50 && absY > 50) {
          // 上滑删除
          const currentPhoto = photos[currentIndex];
          onSwipeUp?.(currentPhoto, currentIndex);
        }
      },
    }), 
    [currentIndex, photos.length, enableSwipeUp, goToIndex, onSwipeUp, photos]
  );

  if (photos.length === 0) {
    return <View style={styles.container} />;
  }

  const currentPhoto = photos[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.swiperContainer} {...panResponder.panHandlers}>
        <View style={styles.photoContainer}>
          <OptimizedImage
            photo={currentPhoto}
            width={screenWidth}
            height={screenHeight}
            style={styles.photo}
            resizeMode="contain"
            priority="high"
          />
        </View>
        
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
      {photos.length > 1 && (
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
      )}
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
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
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
});