export interface CacheItem<T> {
  data: T;
  timestamp: number;
  size: number;
}

export interface LRUCacheConfig {
  maxSize: number;
  maxItems: number;
  ttl?: number; // Time to live in milliseconds
}

export interface PhotoCache {
  thumbnails: Map<string, CacheItem<string>>;
  fullImages: Map<string, CacheItem<string>>;
  metadata: Map<string, CacheItem<any>>;
  lruQueue: string[];
  currentSize: number;
  maxSize: number;
}

export interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missRate: number;
}

export interface PreloadConfig {
  distance: number;
  maxConcurrent: number;
  priority: 'high' | 'normal' | 'low';
}