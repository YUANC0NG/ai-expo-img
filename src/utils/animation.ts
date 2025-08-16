import {
  Easing,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  SharedValue,
} from 'react-native-reanimated';
import { ANIMATION_CONFIG } from './constants';

/**
 * 动画工具函数
 */

// 预定义的缓动函数
export const easingFunctions = {
  // 标准缓动
  easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
  easeOut: Easing.bezier(0, 0, 0.2, 1),
  easeIn: Easing.bezier(0.4, 0, 1, 1),
  
  // 物理缓动
  spring: Easing.elastic(1),
  bounce: Easing.bounce,
  
  // 自定义缓动
  smooth: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
  
  // 删除动画专用
  deleteEasing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
};

// 动画配置预设
export const animationPresets = {
  // 快速动画
  fast: {
    duration: 150,
    easing: easingFunctions.easeOut,
  },
  
  // 标准动画
  standard: {
    duration: 250,
    easing: easingFunctions.easeInOut,
  },
  
  // 慢速动画
  slow: {
    duration: 400,
    easing: easingFunctions.easeInOut,
  },
  
  // 弹簧动画
  spring: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },
  
  // 删除动画
  delete: {
    duration: ANIMATION_CONFIG.DELETE_ANIMATION.duration,
    easing: easingFunctions.deleteEasing,
  },
};

/**
 * 创建时序动画
 */
export function createTimingAnimation(
  value: number,
  config: {
    duration?: number;
    easing?: any;
  } = {}
) {
  return withTiming(value, {
    duration: config.duration || animationPresets.standard.duration,
    easing: config.easing || animationPresets.standard.easing,
  });
}

/**
 * 创建弹簧动画
 */
export function createSpringAnimation(
  value: number,
  config: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  } = {}
) {
  return withSpring(value, {
    damping: config.damping || animationPresets.spring.damping,
    stiffness: config.stiffness || animationPresets.spring.stiffness,
    mass: config.mass || animationPresets.spring.mass,
  });
}

/**
 * 创建序列动画
 */
export function createSequenceAnimation(...animations: any[]) {
  return withSequence(...animations);
}

/**
 * 创建延迟动画
 */
export function createDelayedAnimation(delay: number, animation: any) {
  return withDelay(delay, animation);
}

/**
 * 创建淡入动画
 */
export function createFadeIn(
  opacity: SharedValue<number>,
  duration: number = animationPresets.standard.duration
) {
  opacity.value = createTimingAnimation(1, { duration });
}

/**
 * 创建淡出动画
 */
export function createFadeOut(
  opacity: SharedValue<number>,
  duration: number = animationPresets.standard.duration
) {
  opacity.value = createTimingAnimation(0, { duration });
}

/**
 * 创建缩放动画
 */
export function createScale(
  scale: SharedValue<number>,
  targetScale: number,
  useSpring: boolean = true
) {
  if (useSpring) {
    scale.value = createSpringAnimation(targetScale);
  } else {
    scale.value = createTimingAnimation(targetScale);
  }
}

/**
 * 创建旋转动画
 */
export function createRotation(
  rotation: SharedValue<number>,
  targetRotation: number,
  duration: number = animationPresets.standard.duration
) {
  rotation.value = createTimingAnimation(targetRotation, { duration });
}

/**
 * 创建平移动画
 */
export function createTranslation(
  translateX: SharedValue<number>,
  translateY: SharedValue<number>,
  targetX: number,
  targetY: number,
  useSpring: boolean = false
) {
  if (useSpring) {
    translateX.value = createSpringAnimation(targetX);
    translateY.value = createSpringAnimation(targetY);
  } else {
    translateX.value = createTimingAnimation(targetX);
    translateY.value = createTimingAnimation(targetY);
  }
}

/**
 * 创建弹跳效果
 */
export function createBounceEffect(
  scale: SharedValue<number>,
  intensity: number = 0.1
) {
  scale.value = createSequenceAnimation(
    createTimingAnimation(1 + intensity, { duration: 100 }),
    createTimingAnimation(1 - intensity * 0.5, { duration: 100 }),
    createTimingAnimation(1, { duration: 100 })
  );
}

/**
 * 创建摇摆效果
 */
export function createShakeEffect(
  translateX: SharedValue<number>,
  intensity: number = 10
) {
  translateX.value = createSequenceAnimation(
    createTimingAnimation(-intensity, { duration: 50 }),
    createTimingAnimation(intensity, { duration: 50 }),
    createTimingAnimation(-intensity * 0.8, { duration: 50 }),
    createTimingAnimation(intensity * 0.8, { duration: 50 }),
    createTimingAnimation(-intensity * 0.5, { duration: 50 }),
    createTimingAnimation(intensity * 0.5, { duration: 50 }),
    createTimingAnimation(0, { duration: 50 })
  );
}

/**
 * 创建脉冲效果
 */
export function createPulseEffect(
  scale: SharedValue<number>,
  pulseCount: number = 2,
  intensity: number = 0.1
) {
  const pulses = [];
  for (let i = 0; i < pulseCount; i++) {
    pulses.push(
      createTimingAnimation(1 + intensity, { duration: 200 }),
      createTimingAnimation(1, { duration: 200 })
    );
  }
  
  scale.value = createSequenceAnimation(...pulses);
}

/**
 * 重置所有动画值
 */
export function resetAnimationValues(values: {
  translateX?: SharedValue<number>;
  translateY?: SharedValue<number>;
  scale?: SharedValue<number>;
  rotation?: SharedValue<number>;
  opacity?: SharedValue<number>;
}) {
  if (values.translateX) values.translateX.value = 0;
  if (values.translateY) values.translateY.value = 0;
  if (values.scale) values.scale.value = 1;
  if (values.rotation) values.rotation.value = 0;
  if (values.opacity) values.opacity.value = 1;
}

/**
 * 插值函数
 */
export function interpolateValue(
  value: number,
  inputRange: number[],
  outputRange: number[],
  extrapolate?: 'clamp' | 'extend' | 'identity'
) {
  // 简单的线性插值实现
  if (inputRange.length !== outputRange.length) {
    throw new Error('输入范围和输出范围长度必须相同');
  }
  
  if (value <= inputRange[0]) {
    return extrapolate === 'clamp' ? outputRange[0] : outputRange[0];
  }
  
  if (value >= inputRange[inputRange.length - 1]) {
    return extrapolate === 'clamp' 
      ? outputRange[outputRange.length - 1] 
      : outputRange[outputRange.length - 1];
  }
  
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (value >= inputRange[i] && value <= inputRange[i + 1]) {
      const progress = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + progress * (outputRange[i + 1] - outputRange[i]);
    }
  }
  
  return outputRange[0];
}