import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';
import { AnimationService } from '../../services/AnimationService';

interface TrashIconProps {
  size?: number;
  color?: string;
  isActive?: boolean;
  itemCount?: number;
  onAnimationTrigger?: boolean; // 当有照片飞向垃圾桶时触发
}

export default function TrashIcon({
  size = 40,
  color = theme.colors.white,
  isActive = false,
  itemCount = 0,
  onAnimationTrigger = false,
}: TrashIconProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lidRotation = useSharedValue(0);
  const lidTranslateY = useSharedValue(0);

  const animationService = AnimationService.getInstance();

  // 当有照片飞向垃圾桶时的动画
  useEffect(() => {
    if (onAnimationTrigger) {
      // 垃圾桶接收动画
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );

      // 垃圾桶盖子打开动画
      lidRotation.value = withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );

      lidTranslateY.value = withSequence(
        withTiming(-2, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );

      // 轻微摇摆
      rotation.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );

      // 触觉反馈
      animationService.triggerHapticFeedback('success');
    }
  }, [onAnimationTrigger, scale, rotation, lidRotation, lidTranslateY, animationService]);

  // 激活状态动画
  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(-2, { damping: 15, stiffness: 150 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    }
  }, [isActive, scale, translateY]);

  // 垃圾桶主体动画样式
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
        { translateY: translateY.value },
      ],
    };
  });

  // 垃圾桶盖子动画样式
  const lidAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${lidRotation.value}deg` },
        { translateY: lidTranslateY.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, containerAnimatedStyle]}>
      {/* 垃圾桶主体 */}
      <View style={[styles.body, { 
        width: size * 0.7, 
        height: size * 0.6,
        backgroundColor: color,
      }]}>
        {/* 垃圾桶纹理线条 */}
        <View style={[styles.line, { backgroundColor: color, opacity: 0.3 }]} />
        <View style={[styles.line, { backgroundColor: color, opacity: 0.3, top: '40%' }]} />
        <View style={[styles.line, { backgroundColor: color, opacity: 0.3, top: '70%' }]} />
      </View>

      {/* 垃圾桶盖子 */}
      <Animated.View style={[
        styles.lid,
        {
          width: size * 0.8,
          height: size * 0.15,
          backgroundColor: color,
          top: -size * 0.05,
        },
        lidAnimatedStyle,
      ]}>
        {/* 盖子把手 */}
        <View style={[styles.handle, {
          width: size * 0.3,
          height: size * 0.08,
          backgroundColor: color,
          top: -size * 0.04,
        }]} />
      </Animated.View>

      {/* 数量指示器 */}
      {itemCount > 0 && (
        <View style={[styles.badge, {
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: size * 0.2,
        }]}>
          <Animated.Text style={[styles.badgeText, {
            fontSize: size * 0.2,
          }]}>
            {itemCount > 99 ? '99+' : itemCount}
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  body: {
    borderRadius: 4,
    position: 'relative',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  line: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 1,
    top: '20%',
  },
  lid: {
    position: 'absolute',
    borderRadius: 2,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  handle: {
    position: 'absolute',
    left: '50%',
    marginLeft: -15, // 一半宽度
    borderRadius: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
});