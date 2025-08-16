import { State as GestureState } from 'react-native-gesture-handler';

export interface GestureEventData {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  state: GestureState;
  absoluteX: number;
  absoluteY: number;
}

export interface DeleteGestureConfig {
  threshold: number;
  animationDuration: number;
  hapticFeedback: boolean;
  confirmationRequired: boolean;
}

export interface SwipeGestureConfig {
  horizontalThreshold: number;
  verticalThreshold: number;
  velocityThreshold: number;
  enableHorizontal: boolean;
  enableVertical: boolean;
}

export interface GestureHandlerConfig {
  swipe: SwipeGestureConfig;
  delete: DeleteGestureConfig;
  simultaneousHandlers?: any[];
  waitFor?: any[];
}

export type GestureDirection = 'left' | 'right' | 'up' | 'down';

export interface GestureResult {
  direction: GestureDirection;
  distance: number;
  velocity: number;
  shouldTriggerAction: boolean;
}