import { AnimationService } from '../AnimationService';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (value: any) => ({ value }),
  withTiming: jest.fn((value, config, callback) => {
    if (callback) setTimeout(callback, config?.duration || 250);
    return value;
  }),
  withSpring: jest.fn((value, config, callback) => {
    if (callback) setTimeout(callback, 600);
    return value;
  }),
  withSequence: jest.fn((...animations) => animations[animations.length - 1]),
  withDelay: jest.fn((delay, animation) => animation),
  runOnJS: (fn: Function) => fn,
  Easing: {
    bezier: jest.fn(),
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
}));

describe('AnimationService', () => {
  let animationService: AnimationService;
  let mockSharedValues: any;

  beforeEach(() => {
    animationService = AnimationService.getInstance();
    mockSharedValues = {
      translateX: { value: 0 },
      translateY: { value: 0 },
      scale: { value: 1 },
      rotation: { value: 0 },
      opacity: { value: 1 },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDeleteAnimation', () => {
    it('should create delete animation with correct parameters', () => {
      const onComplete = jest.fn();
      
      const result = animationService.createDeleteAnimation(
        mockSharedValues.translateX,
        mockSharedValues.translateY,
        mockSharedValues.scale,
        mockSharedValues.rotation,
        mockSharedValues.opacity,
        onComplete
      );

      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('cleanup');
      expect(typeof result.cleanup).toBe('function');
    });

    it('should call onComplete callback when animation finishes', (done) => {
      const onComplete = jest.fn(() => {
        expect(onComplete).toHaveBeenCalled();
        done();
      });

      animationService.createDeleteAnimation(
        mockSharedValues.translateX,
        mockSharedValues.translateY,
        mockSharedValues.scale,
        mockSharedValues.rotation,
        mockSharedValues.opacity,
        onComplete
      );
    });
  });

  describe('createRestoreAnimation', () => {
    it('should create restore animation with correct parameters', () => {
      const onComplete = jest.fn();
      
      const result = animationService.createRestoreAnimation(
        mockSharedValues.translateX,
        mockSharedValues.translateY,
        mockSharedValues.scale,
        mockSharedValues.rotation,
        mockSharedValues.opacity,
        onComplete
      );

      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('cleanup');
    });
  });

  describe('createFadeInAnimation', () => {
    it('should create fade in animation', () => {
      const onComplete = jest.fn();
      
      const result = animationService.createFadeInAnimation(
        mockSharedValues.opacity,
        mockSharedValues.scale,
        onComplete
      );

      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('cleanup');
    });
  });

  describe('createFadeOutAnimation', () => {
    it('should create fade out animation', () => {
      const onComplete = jest.fn();
      
      const result = animationService.createFadeOutAnimation(
        mockSharedValues.opacity,
        mockSharedValues.scale,
        onComplete
      );

      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('cleanup');
    });
  });

  describe('createBounceAnimation', () => {
    it('should create bounce animation', () => {
      const onComplete = jest.fn();
      
      const result = animationService.createBounceAnimation(
        mockSharedValues.scale,
        onComplete
      );

      expect(result).toHaveProperty('duration', 450);
      expect(result).toHaveProperty('cleanup');
    });
  });

  describe('createShakeAnimation', () => {
    it('should create shake animation', () => {
      const onComplete = jest.fn();
      
      const result = animationService.createShakeAnimation(
        mockSharedValues.translateX,
        onComplete
      );

      expect(result).toHaveProperty('duration', 350);
      expect(result).toHaveProperty('cleanup');
    });
  });

  describe('triggerHapticFeedback', () => {
    it('should trigger correct haptic feedback types', () => {
      const { impactAsync, notificationAsync } = require('expo-haptics');

      animationService.triggerHapticFeedback('light');
      expect(impactAsync).toHaveBeenCalledWith('light');

      animationService.triggerHapticFeedback('success');
      expect(notificationAsync).toHaveBeenCalledWith('success');
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AnimationService.getInstance();
      const instance2 = AnimationService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});