import {
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Dimensions } from 'react-native';
import { AnimationType, AnimationConfig, DeleteAnimationConfig } from '../types/Animation';
import { ANIMATION_CONFIG } from '../utils/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export class AnimationService {
  private static instance: AnimationService;

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  /**
   * 创建删除动画 - 照片飞向垃圾桶
   */
  createDeleteAnimation(
    translateX: SharedValue<number>,
    translateY: SharedValue<number>,
    scale: SharedValue<number>,
    rotation: SharedValue<number>,
    opacity: SharedValue<number>,
    onComplete?: () => void
  ) {
    const config = ANIMATION_CONFIG.DELETE_ANIMATION;
    const timingConfig = {
      duration: config.duration,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    };

    // 计算垃圾桶位置（右上角）
    const trashX = screenWidth * 0.8;
    const trashY = -screenHeight * 0.1;

    // 创建抛物线路径动画
    const parabolicPath = this.createParabolicPath(
      0, 0, // 起始位置
      trashX, trashY, // 目标位置
      config.duration
    );

    // 执行动画序列
    translateX.value = withTiming(trashX, timingConfig);
    translateY.value = withTiming(trashY, timingConfig);
    
    scale.value = withSequence(
      withTiming(1.1, { duration: config.duration * 0.2 }), // 先放大
      withTiming(config.scale, { duration: config.duration * 0.8 }) // 再缩小
    );
    
    rotation.value = withTiming(config.rotation, timingConfig);
    
    opacity.value = withSequence(
      withDelay(config.duration * 0.6, // 延迟开始淡出
        withTiming(0, { duration: config.duration * 0.4 })
      )
    );

    // 动画完成回调
    if (onComplete) {
      translateX.value = withTiming(trashX, timingConfig, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
    }

    return {
      duration: config.duration,
      cleanup: () => {
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
        rotation.value = 0;
        opacity.value = 1;
      },
    };
  }

  /**
   * 创建恢复动画 - 照片从垃圾桶飞回
   */
  createRestoreAnimation(
    translateX: SharedValue<number>,
    translateY: SharedValue<number>,
    scale: SharedValue<number>,
    rotation: SharedValue<number>,
    opacity: SharedValue<number>,
    onComplete?: () => void
  ) {
    const springConfig = ANIMATION_CONFIG.SWIPE_ANIMATION;

    // 先设置初始状态（垃圾桶位置）
    translateX.value = screenWidth * 0.8;
    translateY.value = -screenHeight * 0.1;
    scale.value = 0.3;
    rotation.value = 15;
    opacity.value = 0;

    // 执行恢复动画
    translateX.value = withSpring(0, springConfig);
    translateY.value = withSpring(0, springConfig);
    scale.value = withSpring(1, springConfig);
    rotation.value = withSpring(0, springConfig);
    opacity.value = withSpring(1, springConfig, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });

    return {
      duration: 600, // Spring动画估计时长
      cleanup: () => {
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
        rotation.value = 0;
        opacity.value = 1;
      },
    };
  }

  /**
   * 创建淡入动画
   */
  createFadeInAnimation(
    opacity: SharedValue<number>,
    scale?: SharedValue<number>,
    onComplete?: () => void
  ) {
    const config = ANIMATION_CONFIG.DEFAULT;
    
    opacity.value = 0;
    if (scale) scale.value = 0.8;

    opacity.value = withTiming(1, config, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });

    if (scale) {
      scale.value = withSpring(1, ANIMATION_CONFIG.SWIPE_ANIMATION);
    }

    return {
      duration: config.duration,
      cleanup: () => {
        opacity.value = 1;
        if (scale) scale.value = 1;
      },
    };
  }

  /**
   * 创建淡出动画
   */
  createFadeOutAnimation(
    opacity: SharedValue<number>,
    scale?: SharedValue<number>,
    onComplete?: () => void
  ) {
    const config = ANIMATION_CONFIG.DEFAULT;

    opacity.value = withTiming(0, config, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });

    if (scale) {
      scale.value = withTiming(0.8, config);
    }

    return {
      duration: config.duration,
      cleanup: () => {
        opacity.value = 1;
        if (scale) scale.value = 1;
      },
    };
  }

  /**
   * 创建弹跳动画
   */
  createBounceAnimation(
    scale: SharedValue<number>,
    onComplete?: () => void
  ) {
    scale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(0.9, { duration: 100 }),
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 100 }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );

    return {
      duration: 450,
      cleanup: () => {
        scale.value = 1;
      },
    };
  }

  /**
   * 创建摇摆动画
   */
  createShakeAnimation(
    translateX: SharedValue<number>,
    onComplete?: () => void
  ) {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );

    return {
      duration: 350,
      cleanup: () => {
        translateX.value = 0;
      },
    };
  }

  /**
   * 创建抛物线路径
   */
  private createParabolicPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number
  ) {
    // 计算抛物线的控制点
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 100; // 抛物线的顶点

    return {
      startX,
      startY,
      midX,
      midY,
      endX,
      endY,
      duration,
    };
  }

  /**
   * 触发触觉反馈
   */
  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }

  /**
   * 创建组合动画
   */
  createSequenceAnimation(
    animations: Array<{
      type: AnimationType;
      values: any;
      delay?: number;
      onComplete?: () => void;
    }>
  ) {
    const totalDuration = animations.reduce((sum, anim) => {
      return sum + (anim.delay || 0) + this.getAnimationDuration(anim.type);
    }, 0);

    animations.forEach((anim, index) => {
      const delay = animations.slice(0, index).reduce((sum, prevAnim) => {
        return sum + (prevAnim.delay || 0) + this.getAnimationDuration(prevAnim.type);
      }, 0) + (anim.delay || 0);

      setTimeout(() => {
        this.executeAnimation(anim.type, anim.values, anim.onComplete);
      }, delay);
    });

    return {
      duration: totalDuration,
      cancel: () => {
        // TODO: 实现动画取消逻辑
      },
    };
  }

  /**
   * 获取动画持续时间
   */
  private getAnimationDuration(type: AnimationType): number {
    switch (type) {
      case 'delete':
        return ANIMATION_CONFIG.DELETE_ANIMATION.duration;
      case 'fadeIn':
      case 'fadeOut':
        return ANIMATION_CONFIG.DEFAULT.duration;
      case 'swipeLeft':
      case 'swipeRight':
      case 'swipeUp':
      case 'restore':
        return 600; // Spring动画估计时长
      default:
        return ANIMATION_CONFIG.DEFAULT.duration;
    }
  }

  /**
   * 执行指定类型的动画
   */
  private executeAnimation(type: AnimationType, values: any, onComplete?: () => void) {
    switch (type) {
      case 'delete':
        return this.createDeleteAnimation(
          values.translateX,
          values.translateY,
          values.scale,
          values.rotation,
          values.opacity,
          onComplete
        );
      case 'restore':
        return this.createRestoreAnimation(
          values.translateX,
          values.translateY,
          values.scale,
          values.rotation,
          values.opacity,
          onComplete
        );
      case 'fadeIn':
        return this.createFadeInAnimation(values.opacity, values.scale, onComplete);
      case 'fadeOut':
        return this.createFadeOutAnimation(values.opacity, values.scale, onComplete);
      default:
        console.warn(`未知的动画类型: ${type}`);
        return null;
    }
  }
}