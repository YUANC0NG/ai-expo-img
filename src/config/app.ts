import { 
  PhotoServiceConfig, 
  AlbumServiceConfig, 
  CacheServiceConfig,
  DeleteServiceConfig 
} from '../types/Service';
import { PERFORMANCE_CONFIG, ANIMATION_CONFIG, GESTURE_CONFIG } from '../utils/constants';

export const APP_CONFIG = {
  // 照片服务配置
  photoService: {
    batchSize: 50,
    enableCaching: true,
    thumbnailQuality: 0.7,
    preloadDistance: PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.preloadDistance,
  } as PhotoServiceConfig,

  // 相册服务配置
  albumService: {
    groupByMonth: true,
    sortOrder: 'desc',
    includeVideos: false,
  } as AlbumServiceConfig,

  // 缓存服务配置
  cacheService: {
    maxMemoryUsage: PERFORMANCE_CONFIG.CACHE.maxSize,
    compressionQuality: PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.compressionQuality,
    enablePersistence: true,
    persistencePath: 'photo-cache',
  } as CacheServiceConfig,

  // 删除服务配置
  deleteService: {
    enableTrash: true,
    trashRetentionDays: 30,
    requireConfirmation: true,
    enableBatchDelete: true,
  } as DeleteServiceConfig,

  // 性能配置
  performance: PERFORMANCE_CONFIG,

  // 动画配置
  animation: ANIMATION_CONFIG,

  // 手势配置
  gesture: GESTURE_CONFIG,

  // 调试配置
  debug: {
    enableLogging: __DEV__,
    enablePerformanceMonitoring: __DEV__,
    showCacheStats: __DEV__,
  },
};