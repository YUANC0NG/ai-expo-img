import { Photo, Album } from './Photo';
import { PermissionStatus } from './Error';

export interface PhotoServiceConfig {
  batchSize: number;
  enableCaching: boolean;
  thumbnailQuality: number;
  preloadDistance: number;
}

export interface PhotoLibraryResult {
  photos: Photo[];
  hasNextPage: boolean;
  endCursor?: string;
}

export interface AlbumServiceConfig {
  groupByMonth: boolean;
  sortOrder: 'asc' | 'desc';
  includeVideos: boolean;
}

export interface PermissionServiceResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  granted: boolean;
}

export interface CacheServiceConfig {
  maxMemoryUsage: number;
  compressionQuality: number;
  enablePersistence: boolean;
  persistencePath?: string;
}

export interface DeleteServiceConfig {
  enableTrash: boolean;
  trashRetentionDays: number;
  requireConfirmation: boolean;
  enableBatchDelete: boolean;
}