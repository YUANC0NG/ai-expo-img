import { useEffect, useCallback, useRef } from 'react';
import { Image } from 'react-native';
import { Photo } from '../types/Photo';
import { PERFORMANCE_CONFIG } from '../utils/constants';

interface UsePhotoPreloaderProps {
  photos: Photo[];
  currentIndex: number;
  preloadDistance?: number;
}

export function usePhotoPreloader({
  photos,
  currentIndex,
  preloadDistance = PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.preloadDistance,
}: UsePhotoPreloaderProps) {
  const preloadedImages = useRef<Set<string>>(new Set());
  const preloadQueue = useRef<string[]>([]);
  const isPreloading = useRef(false);

  // 预加载单张图片
  const preloadImage = useCallback(async (uri: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(uri)) {
        resolve();
        return;
      }

      Image.prefetch(uri)
        .then(() => {
          preloadedImages.current.add(uri);
          resolve();
        })
        .catch(reject);
    });
  }, []);

  // 处理预加载队列
  const processPreloadQueue = useCallback(async () => {
    if (isPreloading.current || preloadQueue.current.length === 0) {
      return;
    }

    isPreloading.current = true;

    try {
      // 批量预加载，限制并发数
      const maxConcurrent = 3;
      const batch = preloadQueue.current.splice(0, maxConcurrent);
      
      await Promise.allSettled(
        batch.map(uri => preloadImage(uri))
      );
    } catch (error) {
      console.warn('预加载图片失败:', error);
    } finally {
      isPreloading.current = false;
      
      // 如果还有待预加载的图片，继续处理
      if (preloadQueue.current.length > 0) {
        setTimeout(processPreloadQueue, 100);
      }
    }
  }, [preloadImage]);

  // 添加图片到预加载队列
  const addToPreloadQueue = useCallback((uris: string[]) => {
    const newUris = uris.filter(uri => 
      !preloadedImages.current.has(uri) && 
      !preloadQueue.current.includes(uri)
    );
    
    preloadQueue.current.push(...newUris);
    processPreloadQueue();
  }, [processPreloadQueue]);

  // 获取需要预加载的照片索引范围
  const getPreloadRange = useCallback(() => {
    const start = Math.max(0, currentIndex - preloadDistance);
    const end = Math.min(photos.length - 1, currentIndex + preloadDistance);
    return { start, end };
  }, [currentIndex, preloadDistance, photos.length]);

  // 预加载当前索引周围的照片
  const preloadAroundCurrentIndex = useCallback(() => {
    const { start, end } = getPreloadRange();
    const urisToPreload: string[] = [];

    for (let i = start; i <= end; i++) {
      const photo = photos[i];
      if (photo) {
        // 优先预加载缩略图
        if (photo.thumbnailUri) {
          urisToPreload.push(photo.thumbnailUri);
        }
        // 然后预加载原图
        urisToPreload.push(photo.uri);
      }
    }

    // 按优先级排序：当前照片 > 相邻照片 > 其他照片
    const prioritizedUris = urisToPreload.sort((a, b) => {
      const aIndex = photos.findIndex(p => p.uri === a || p.thumbnailUri === a);
      const bIndex = photos.findIndex(p => p.uri === b || p.thumbnailUri === b);
      
      const aDistance = Math.abs(aIndex - currentIndex);
      const bDistance = Math.abs(bIndex - currentIndex);
      
      return aDistance - bDistance;
    });

    addToPreloadQueue(prioritizedUris);
  }, [photos, currentIndex, getPreloadRange, addToPreloadQueue]);

  // 清理不需要的预加载图片
  const cleanupPreloadedImages = useCallback(() => {
    const { start, end } = getPreloadRange();
    const currentUris = new Set<string>();

    // 收集当前需要的图片URI
    for (let i = start; i <= end; i++) {
      const photo = photos[i];
      if (photo) {
        currentUris.add(photo.uri);
        if (photo.thumbnailUri) {
          currentUris.add(photo.thumbnailUri);
        }
      }
    }

    // 清理不再需要的预加载图片
    preloadedImages.current.forEach(uri => {
      if (!currentUris.has(uri)) {
        preloadedImages.current.delete(uri);
      }
    });

    // 清理预加载队列中不需要的图片
    preloadQueue.current = preloadQueue.current.filter(uri => 
      currentUris.has(uri)
    );
  }, [photos, getPreloadRange]);

  // 当前索引变化时触发预加载
  useEffect(() => {
    if (photos.length > 0) {
      preloadAroundCurrentIndex();
      cleanupPreloadedImages();
    }
  }, [currentIndex, photos, preloadAroundCurrentIndex, cleanupPreloadedImages]);

  // 返回预加载状态和控制函数
  return {
    preloadedCount: preloadedImages.current.size,
    queueLength: preloadQueue.current.length,
    isPreloading: isPreloading.current,
    preloadImage,
    clearPreloadCache: () => {
      preloadedImages.current.clear();
      preloadQueue.current = [];
    },
  };
}