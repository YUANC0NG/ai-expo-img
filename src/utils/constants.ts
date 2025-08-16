// 性能配置
export const PERFORMANCE_CONFIG = {
  VIRTUALIZATION: {
    itemHeight: 200,
    bufferSize: 10,
    windowSize: 5,
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 50,
  },
  IMAGE_OPTIMIZATION: {
    thumbnailSize: { width: 200, height: 200 },
    preloadDistance: 3,
    cacheSize: 100,
    compressionQuality: 0.8,
  },
  CACHE: {
    maxSize: 100 * 1024 * 1024, // 100MB
    thumbnailCacheSize: 50,
    imageCacheSize: 20,
  },
};

// 动画配置
export const ANIMATION_CONFIG = {
  DEFAULT: {
    duration: 300,
    useNativeDriver: true,
  },
  DELETE_ANIMATION: {
    translationY: -200,
    translationX: 100,
    scale: 0.3,
    rotation: 15,
    duration: 400,
  },
  SWIPE_ANIMATION: {
    duration: 250,
    damping: 20,
    stiffness: 90,
  },
};

// 手势配置
export const GESTURE_CONFIG = {
  SWIPE: {
    horizontalThreshold: 50,
    verticalThreshold: 100,
    velocityThreshold: 500,
  },
  DELETE: {
    threshold: -150,
    animationDuration: 400,
    hapticFeedback: true,
  },
};

// UI常量
export const UI_CONSTANTS = {
  TRASH_ICON_SIZE: 40,
  PHOTO_GRID_SPACING: 2,
  HEADER_HEIGHT: 60,
  SAFE_AREA_PADDING: 20,
};

// 错误消息
export const ERROR_MESSAGES = {
  PERMISSION_DENIED: '需要访问照片权限才能使用此功能',
  MEDIA_LOAD_FAILED: '照片加载失败，请重试',
  CACHE_OVERFLOW: '缓存空间不足，正在清理...',
  ANIMATION_ERROR: '动画执行出错',
  NETWORK_ERROR: '网络连接异常',
};