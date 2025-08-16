import { useCallback, useRef } from 'react';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GestureEventData, GestureResult, GestureDirection } from '../types/Gesture';
import { GESTURE_CONFIG } from '../utils/constants';

interface UseGestureHandlerProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  enableHaptics?: boolean;
  customThresholds?: {
    horizontal?: number;
    vertical?: number;
    velocity?: number;
  };
}

interface UseGestureHandlerResult {
  gestureHandler: React.RefObject<PanGestureHandler>;
  translateX: any;
  translateY: any;
  isGestureActive: any;
  resetGesture: () => void;
}

export function useGestureHandler({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onGestureStart,
  onGestureEnd,
  enableHaptics = true,
  customThresholds,
}: UseGestureHandlerProps): UseGestureHandlerResult {
  const gestureHandler = useRef<PanGestureHandler>(null);
  
  // 动画值
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isGestureActive = useSharedValue(false);
  
  // 手势状态
  const gestureStartTime = useRef<number>(0);
  const initialPosition = useRef({ x: 0, y: 0 });
  
  // 获取阈值配置
  const thresholds = {
    horizontal: customThresholds?.horizontal ?? GESTURE_CONFIG.SWIPE.horizontalThreshold,
    vertical: customThresholds?.vertical ?? GESTURE_CONFIG.SWIPE.verticalThreshold,
    velocity: customThresholds?.velocity ?? GESTURE_CONFIG.SWIPE.velocityThreshold,
  };

  // 触发触觉反馈
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics) return;
    
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
    }
  }, [enableHaptics]);

  // 分析手势方向和强度
  const analyzeGesture = useCallback((
    dx: number,
    dy: number,
    vx: number,
    vy: number
  ): GestureResult | null => {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const absVx = Math.abs(vx);
    const absVy = Math.abs(vy);
    
    let direction: GestureDirection;
    let distance: number;
    let velocity: number;
    
    // 判断主要方向
    if (absX > absY) {
      // 水平方向
      direction = dx > 0 ? 'right' : 'left';
      distance = absX;
      velocity = absVx;
    } else {
      // 垂直方向
      direction = dy > 0 ? 'down' : 'up';
      distance = absY;
      velocity = absVy;
    }
    
    // 判断是否应该触发动作
    const distanceThreshold = direction === 'left' || direction === 'right' 
      ? thresholds.horizontal 
      : thresholds.vertical;
    
    const shouldTriggerAction = distance > distanceThreshold || velocity > thresholds.velocity;
    
    return {
      direction,
      distance,
      velocity,
      shouldTriggerAction,
    };
  }, [thresholds]);

  // 执行手势动作
  const executeGestureAction = useCallback((result: GestureResult) => {
    if (!result.shouldTriggerAction) return;
    
    // 触发触觉反馈
    triggerHapticFeedback('medium');
    
    // 执行对应的回调
    switch (result.direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, triggerHapticFeedback]);

  // 手势开始处理
  const handleGestureStart = useCallback(() => {
    isGestureActive.value = true;
    gestureStartTime.current = Date.now();
    onGestureStart?.();
    
    if (enableHaptics) {
      triggerHapticFeedback('light');
    }
  }, [isGestureActive, onGestureStart, enableHaptics, triggerHapticFeedback]);

  // 手势更新处理
  const handleGestureUpdate = useCallback((event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    
    translateX.value = translationX;
    translateY.value = translationY;
  }, [translateX, translateY]);

  // 手势结束处理
  const handleGestureEnd = useCallback((event: any) => {
    const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
    
    isGestureActive.value = false;
    
    // 分析手势
    const gestureResult = analyzeGesture(translationX, translationY, velocityX, velocityY);
    
    if (gestureResult) {
      runOnJS(executeGestureAction)(gestureResult);
    }
    
    // 重置位置
    translateX.value = 0;
    translateY.value = 0;
    
    onGestureEnd?.();
  }, [isGestureActive, translateX, translateY, analyzeGesture, executeGestureAction, onGestureEnd]);

  // 重置手势状态
  const resetGesture = useCallback(() => {
    translateX.value = 0;
    translateY.value = 0;
    isGestureActive.value = false;
  }, [translateX, translateY, isGestureActive]);

  // 手势事件处理器
  const onGestureEvent = useCallback((event: any) => {
    const { state } = event.nativeEvent;
    
    switch (state) {
      case State.BEGAN:
        runOnJS(handleGestureStart)();
        break;
      case State.ACTIVE:
        handleGestureUpdate(event);
        break;
      case State.END:
      case State.CANCELLED:
        runOnJS(handleGestureEnd)(event);
        break;
    }
  }, [handleGestureStart, handleGestureUpdate, handleGestureEnd]);

  return {
    gestureHandler,
    translateX,
    translateY,
    isGestureActive,
    resetGesture,
  };
}