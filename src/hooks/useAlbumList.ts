import { useState, useEffect, useCallback } from 'react';
import { AlbumGroup } from '../types/Photo';
import { AlbumService } from '../services/AlbumService';
import { PermissionService } from '../services/PermissionService';
import { PermissionStatus } from '../types/Error';
import { errorHandler } from '../utils/errorHandler';

interface UseAlbumListResult {
  albumGroups: AlbumGroup[];
  loading: boolean;
  error: string | null;
  permissionStatus: PermissionStatus;
  refreshing: boolean;
  refresh: () => Promise<void>;
  loadAlbums: () => Promise<void>;
  requestPermission: () => Promise<void>;
}

export function useAlbumList(): UseAlbumListResult {
  const [albumGroups, setAlbumGroups] = useState<AlbumGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED
  );
  const [refreshing, setRefreshing] = useState(false);

  const albumService = AlbumService.getInstance();
  const permissionService = PermissionService.getInstance();

  // 检查权限状态
  const checkPermission = useCallback(async () => {
    try {
      const result = await permissionService.checkPermissionStatus();
      setPermissionStatus(result.status);
      return result.granted;
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'checkPermission');
      setError(appError.message);
      return false;
    }
  }, [permissionService]);

  // 请求权限
  const requestPermission = useCallback(async () => {
    try {
      setError(null);
      const result = await permissionService.requestPermission();
      setPermissionStatus(result.status);
      
      if (result.granted) {
        await loadAlbums();
      } else {
        setError('需要照片访问权限才能使用此功能');
      }
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'requestPermission');
      setError(appError.message);
    }
  }, [permissionService]);

  // 加载相册数据
  const loadAlbums = useCallback(async () => {
    try {
      setError(null);
      
      // 检查权限
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const albums = await albumService.getMonthlyAlbums();
      setAlbumGroups(albums);
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'loadAlbums');
      setError(appError.message);
      setAlbumGroups([]);
    } finally {
      setLoading(false);
    }
  }, [albumService, checkPermission]);

  // 刷新数据
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAlbums();
    } finally {
      setRefreshing(false);
    }
  }, [loadAlbums]);

  // 初始化加载
  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  return {
    albumGroups,
    loading,
    error,
    permissionStatus,
    refreshing,
    refresh,
    loadAlbums,
    requestPermission,
  };
}