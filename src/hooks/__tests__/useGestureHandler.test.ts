import { renderHook, act } from '@testing-library/react-hooks';
import { useGestureHandler } from '../useGestureHandler';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (value: any) => ({ value }),
  runOnJS: (fn: Function) => fn,
}));

describe('useGestureHandler', () => {
  const mockCallbacks = {
    onSwipeLeft: jest.fn(),
    onSwipeRight: jest.fn(),
    onSwipeUp: jest.fn(),
    onSwipeDown: jest.fn(),
    onGestureStart: jest.fn(),
    onGestureEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGestureHandler({}));

    expect(result.current.gestureHandler).toBeDefined();
    expect(result.current.translateX).toBeDefined();
    expect(result.current.translateY).toBeDefined();
    expect(result.current.isGestureActive).toBeDefined();
    expect(result.current.resetGesture).toBeInstanceOf(Function);
  });

  it('should provide gesture callbacks', () => {
    const { result } = renderHook(() => useGestureHandler(mockCallbacks));

    expect(result.current.resetGesture).toBeInstanceOf(Function);
  });

  it('should reset gesture values when resetGesture is called', () => {
    const { result } = renderHook(() => useGestureHandler({}));

    act(() => {
      result.current.resetGesture();
    });

    expect(result.current.translateX.value).toBe(0);
    expect(result.current.translateY.value).toBe(0);
    expect(result.current.isGestureActive.value).toBe(false);
  });

  it('should handle custom thresholds', () => {
    const customThresholds = {
      horizontal: 100,
      vertical: 150,
      velocity: 800,
    };

    const { result } = renderHook(() => 
      useGestureHandler({
        ...mockCallbacks,
        customThresholds,
      })
    );

    expect(result.current).toBeDefined();
  });

  it('should handle haptics configuration', () => {
    const { result } = renderHook(() => 
      useGestureHandler({
        ...mockCallbacks,
        enableHaptics: false,
      })
    );

    expect(result.current).toBeDefined();
  });
});