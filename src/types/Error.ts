export enum ErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  MEDIA_LOAD_FAILED = 'MEDIA_LOAD_FAILED',
  CACHE_OVERFLOW = 'CACHE_OVERFLOW',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

export enum PermissionStatus {
  UNDETERMINED = 'undetermined',
  GRANTED = 'granted',
  DENIED = 'denied',
  RESTRICTED = 'restricted'
}