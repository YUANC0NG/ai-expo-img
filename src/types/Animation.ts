import { SharedValue } from 'react-native-reanimated';

export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
  easing?: any;
}

export interface DeleteAnimationConfig extends AnimationConfig {
  translationY: number;
  translationX: number;
  scale: number;
  rotation: number;
}

export interface SwipeAnimationConfig extends AnimationConfig {
  damping: number;
  stiffness: number;
}

export interface AnimationValues {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
  rotation: SharedValue<number>;
  opacity: SharedValue<number>;
}

export interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  queuedAnimations: string[];
}

export type AnimationType = 
  | 'swipeLeft' 
  | 'swipeRight' 
  | 'swipeUp' 
  | 'delete' 
  | 'restore' 
  | 'fadeIn' 
  | 'fadeOut';