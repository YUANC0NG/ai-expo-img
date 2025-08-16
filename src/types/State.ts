import { Photo, Album } from './Photo';
import { PermissionStatus } from './Error';

export interface PhotoState {
  albums: Album[];
  currentAlbum: Album | null;
  currentPhotoIndex: number;
  loading: boolean;
  error: string | null;
}

export interface TrashState {
  deletedPhotos: Photo[];
  selectedPhotos: Set<string>;
  isVisible: boolean;
}

export interface UIState {
  isGestureActive: boolean;
  animationInProgress: boolean;
  permissionStatus: PermissionStatus;
}

export interface CacheState {
  thumbnailCache: Map<string, string>;
  imageCache: Map<string, string>;
  cacheSize: number;
}

export interface AppState {
  photos: PhotoState;
  trash: TrashState;
  ui: UIState;
  cache: CacheState;
}