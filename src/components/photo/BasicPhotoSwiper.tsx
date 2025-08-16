import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  PanResponder, 
  Animated,
  Text,
  Pressable
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Photo } from '../../types/Photo';
import OptimizedImage from '../common/OptimizedImage';
import { theme } from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BasicPhotoSwiperProps {
  photos: Photo[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onSwipeUp?: (photo: Photo, index: number) => void;
}

export default function BasicPhotoSwiper({
  photos,
  initialIndex = 0,
  onIndexChange,
  onSwipeUp,
}: BasicPhotoSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // 动画值
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;

  // 切换照片
  const changePhoto = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= photos.length) return;
    
    setCurrentIndex(newIndex);
    onIndexChange?.(newIndex);
    
    // 重置动画
    pan.setValue({ x: 0, y: 0 });
    scale.setValue(1);
    deleteOpacity.setValue(0);
  }, [photos.length, onIndexChange, pan, scale, deleteOpacity]);

  // 执行删除
  const executeDelete = useCallback(() => {
    const photo = photos[currentIndex];
    
    // 删除动画
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: screenWidth * 0.7, y: -screenHeight * 0.2 },
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSwipeUp?.(photo, currentIndex);
      
      // 重置动画
      pan.setValue({ x: 0, y: 0 });
      scale.setValue(1);
      deleteOpacity.setValue(0);
    });
  }, [photos, currentIndex, onSwipeUp, pan, scale, deleteOpacity]);

  // 手势处理
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        pan.setValue({ x: dx, y: dy });
        
        // 根据移动距离调整缩放
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scaleValue = Math.max(0.9, 1 - distance / 1000);
        scale.setValue(scaleValue);
        
        // 上滑删除进度
        if (dy < 0) {
          const progress = Math.min(Math.abs(dy) / 150, 1);
          deleteOpacity.setValue(progress);
          
          if (progress > 0.7) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        } else {
          deleteOpacity.setValue(0);
        }
      },
      
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy, vx, vy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        // 水平滑动切换照片
        if (absX > absY && (absX > 80 || Math.abs(vx) > 0.5)) {
          if (dx > 0) {
            // 右滑 - 上一张
            changePhoto(currentIndex - 1);
          } else {
            // 左滑 - 下一张
            changePhoto(currentIndex + 1);
          }
          return;
        }
        
        // 上滑删除
        if (dy < 0 && (absY > 100 || Math.abs(vy) > 0.8)) {
          executeDelete();
          return;
        }
        
        // 回弹
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

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
      {/* 主照片 */}
      <View style={styles.photoContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.photoWrapper,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
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
      <Animated.View
        style={[
          styles.trashIndicator,
          {
            opacity: deleteOpacity,
            transform: [
              {
                scale: deleteOpacity.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.1, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.trashEmoji}>🗑️</Text>
      </Animated.View>

      {/* 删除进度提示 */}
      <Animated.View
        style={[
          styles.deleteHint,
          {
            opacity: deleteOpacity.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0, 1, 1],
            }),
          },
        ]}
      >
        <Text style={styles.deleteHintText}>继续上滑删除</Text>
      </Animated.View>

      {/* 照片计数 */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {photos.length}
        </Text>
      </View>

      {/* 底部指示器 */}
      {photos.length > 1 && (
        <View style={styles.indicator}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* 左右箭头提示 */}
      {currentIndex > 0 && (
        <View style={styles.leftArrow}>
          <Text style={styles.arrowText}>‹</Text>
        </View>
      )}
      
      {currentIndex < photos.length - 1 && (
        <View style={styles.rightArrow}>
          <Text style={styles.arrowText}>›</Text>
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
  trashEmoji: {
    fontSize: 28,
  },
  deleteHint: {
    position: 'absolute',
    top: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  deleteHintText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: theme.typography.fontSize.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  counter: {
    position: 'absolute',
    top: 40,
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
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leftArrow: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 24,
    fontWeight: 'bold',
  },
});