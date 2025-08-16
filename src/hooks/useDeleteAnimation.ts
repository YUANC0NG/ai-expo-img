import { useCallback, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { AnimationService } from '../services/AnimationService';
import { Photo } from '../types/Photo';

interface UseDeleteAnimationProps {
  onDeleteComplete?: (photo: Photo) => void;
  onAnimationStart?: (photo: Photo) => void;
  enableHaptics?: boolean;
}

interface UseDeleteAnimationResult {
  translateX: any;
  translateY: any;
  scale: any;
  rotation: any;
  opacity: any;
  triggerDeleteAnimation: (photo: Photo) => Promise<void>;
  triggerRestoreAnimation: (photo: Photo) => Promise<void>;
  resetAnimation: () => void;
  isAnimating: boolean;
}

export function useDeleteAnimation({
  onDeleteComplete,
  onAnimationStart,
  enableHaptics = true,
}: UseDeleteAnimationProps = {}): UseDeleteAnimationResult {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animationService = AnimationService.getInstance();
  const isAnimating = useRef(false);

  // 触发删除动画
  const triggerDeleteAnimation = useCallback(async (photo: Photo): Promise<void> => {
    if (isAnimating.current) return;

    return new Promise((resolve) => {
      isAnimating.current = true;
      onAnimationStart?.(photo);

      if (enableHaptics) {
        animationService.triggerHapticFeedback('medium');
      }

      const animation = animationService.createDeleteAnimation(
        translateX,
        translateY,
        scale,
        rotation,
        opacity,
        () => {
          isAnimating.current = false;
          onDeleteComplete?.(photo);
          resolve();
        }
      );
    });
  }, [
    translateX,
    translateY,
    scale,
    rotation,
    opacity,
    animationService,
    onDeleteComplete,
    onAnimationStart,
    enableHaptics,
  ]);

  // 触发恢复动画
  const triggerRestoreAnimation = useCallback(async (photo: Photo): Promise<void> => {
    if (isAnimating.current) return;

    return new Promise((resolve) => {
      isAnimating.current = true;
      onAnimationStart?.(photo);

      if (enableHaptics) {
        animationService.triggerHapticFeedback('light');
      }

      const animation = animationService.createRestoreAnimation(
        translateX,
        translateY,
        scale,
        rotation,
        opacity,
        () => {
          isAnimating.current = false;
          resolve();
        }
      );
    });
  }, [
    translateX,
    translateY,
    scale,
    rotation,
    opacity,
    animationService,
    onAnimationStart,
    enableHaptics,
  ]);

  // 重置动画
  const resetAnimation = useCallback(() => {
    if (isAnimating.current) return;

    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    rotation.value = 0;
    opacity.value = 1;
  }, [translateX, translateY, scale, rotation, opacity]);

  return {
    translateX,
    translateY,
    scale,
    rotation,
    opacity,
    triggerDeleteAnimation,
    triggerRestoreAnimation,
    resetAnimation,
    isAnimating: isAnimating.current,
  };
}