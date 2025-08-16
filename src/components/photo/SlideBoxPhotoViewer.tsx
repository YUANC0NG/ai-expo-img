import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  PanResponder, 
  Animated,
  Text,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Photo } from '../../types/Photo';
import OptimizedImage from '../common/OptimizedImage';
import { theme } from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SlideBoxPhotoViewerProps {
  photos: Photo[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onSwipeUp?: (photo: Photo, index: number) => void;
  enableSwipeUp?: boolean;
}

export default function SlideBoxPhotoViewer({
  photos,
  initialIndex = 0,
  onIndexChange,
  onSwipeUp,
  enableSwipeUp = true,
}: SlideBoxPhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // 动画值
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const deleteProgress = useRef(new Animated.Value(0)).current;
  
  // 状态
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 切换到指定索引
  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= photos.length || isDeleting) return;
    
    setCurrentIndex(index);
    onIndexChange?.(index);
    
    // 重置动画值
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [photos.length, onIndexChange, isDeleting, translateX, translateY, scale]);

  // 执行删除动画
  const executeDeleteAnimation = useCallback(() => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // 删除动画：飞向右上角
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: screenWidth * 0.8,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -screenHeight * 0.3,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.3,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(deleteProgress, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // 动画完成后执行删除
      const currentPhoto = photos[currentIndex];
      onSwipeUp?.(currentPhoto, currentIndex);
      
      // 重置状态
      setIsDeleting(false);
      translateX.setValue(0);
      translateY.setValue(0);
      scale.setValue(1);
      deleteProgress.setValue(0);
    });
  }, [isDeleting, currentIndex, photos, onSwipeUp, translateX, translateY, scale, deleteProgress]);

  // 创建手势响应器
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 || Math.abs(dy) > 10;
      },
      
      onPanResponderGrant: () => {
        if (isDeleting) return;
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      
      onPanResponderMove: (_, gestureState) => {
        if (isDeleting) return;
        
        const { dx, dy } = gestureState;
        
        // 水平滑动
        if (Math.abs(dx) > Math.abs(dy)) {
          translateX.setValue(dx * 0.8); // 减少移动幅度
          
          // 根据滑动距离调整缩放
          const progress = Math.min(Math.abs(dx) / screenWidth, 0.3);
          scale.setValue(1 - progress * 0.1);
        }
        // 垂直滑动（仅向上）
        else if (enableSwipeUp && dy < 0) {
          const progress = Math.min(Math.abs(dy) / 200, 1);
          
          translateY.setValue(dy * 0.6);
          translateX.setValue(dx * 0.3);
          scale.setValue(1 - progress * 0.2);
          deleteProgress.setValue(progress);
          
          // 触觉反馈
          if (progress > 0.7) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      },
      
      onPanResponderRelease: (_, gestureState) => {
        if (isDeleting) return;
        
        setIsDragging(false);
        const { dx, dy, vx, vy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        // 判断手势类型
        if (absX > absY) {
          // 水平滑动
          const threshold = screenWidth * 0.3;
          const velocityThreshold = 0.5;
          
          if (absX > threshold || Math.abs(vx) > velocityThreshold) {
            if (dx > 0 && currentIndex > 0) {
              // 右滑 - 上一张
              goToIndex(currentIndex - 1);
              return;
            } else if (dx < 0 && currentIndex < photos.length - 1) {
              // 左滑 - 下一张
              goToIndex(currentIndex + 1);
              return;
            }
          }
        } else if (enableSwipeUp && dy < 0) {
          // 上滑删除
          const threshold = 100;
          const velocityThreshold = 0.8;
          
          if (absY > threshold || Math.abs(vy) > velocityThreshold) {
            executeDeleteAnimation();
            return;
          }
        }
        
        // 回弹到原位置
        Animated.parallel([
          Animated.spring(translateX, { 
            toValue: 0, 
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(translateY, { 
            toValue: 0, 
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(scale, { 
            toValue: 1, 
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(deleteProgress, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  // 当索引变化时重置动画
  useEffect(() => {
    translateX.setValue(0);
    translateY.setValue(0);
    scale.setValue(1);
    deleteProgress.setValue(0);
  }, [currentIndex, translateX, translateY, scale, deleteProgress]);

  if (photos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>没有照片</Text>
      </View>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* 主要照片容器 */}
      <View style={styles.photoContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.photoWrapper,
            {
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            },
          ]}
        >
          <OptimizedImage
            photo={currentPhoto}
            width={screenWidth}
            height={screenHeight}
            style={styles.photo}
            resizeMode="contain"
            priority="high"
          />
        </Animated.View>
      </View>

      {/* 垃圾桶指示器 */}
      {enableSwipeUp && (
        <Animated.View
          style={[
            styles.trashIndicator,
            {
              opacity: deleteProgress,
              transform: [
                {
                  scale: deleteProgress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.1, 1.3],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.trashIcon}>
            <Text style={styles.trashEmoji}>🗑️</Text>
          </View>
        </Animated.View>
      )}

      {/* 删除进度指示器 */}
      {enableSwipeUp && (
        <Animated.View
          style={[
            styles.deleteProgressContainer,
            {
              opacity: deleteProgress.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [0, 1, 1],
              }),
            },
          ]}
        >
          <View style={styles.deleteProgressBar}>
            <Animated.View
              style={[
                styles.deleteProgressFill,
                {
                  width: deleteProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.deleteHint}>继续上滑删除</Text>
        </Animated.View>
      )}

      {/* 照片计数器 */}
      {photos.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>
      )}

      {/* 底部指示器 */}
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
  photoContainer: {
    flex: 1,
  },
  photoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptyText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    textAlign: 'center',
    marginTop: screenHeight * 0.4,
  },
  trashIndicator: {
    position: 'absolute',
    top: 80,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trashIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashEmoji: {
    fontSize: 28,
  },
  deleteProgressContainer: {
    position: 'absolute',
    top: 160,
    left: 30,
    right: 30,
    alignItems: 'center',
  },
  deleteProgressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  deleteProgressFill: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 2,
  },
  deleteHint: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: theme.typography.fontSize.sm,
    marginTop: 8,
    textAlign: 'center',
  },
  counter: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counterText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicator: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});