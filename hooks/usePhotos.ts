import { useState, useEffect, useCallback } from 'react';
import { mediaLibraryService, PhotoAsset, AlbumMonth } from '../services/MediaLibraryService';

interface UsePhotosState {
  photos: PhotoAsset[];
  albums: AlbumMonth[];
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

interface UsePhotosReturn extends UsePhotosState {
  refreshPhotos: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

export const usePhotos = (): UsePhotosReturn => {
  const [state, setState] = useState<UsePhotosState>({
    photos: [],
    albums: [],
    loading: false,
    error: null,
    hasPermission: false,
  });

  // 请求权限
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const granted = await mediaLibraryService.requestPermissions();
      setState(prev => ({ ...prev, hasPermission: granted, loading: false }));
      return granted;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '请求权限失败',
        loading: false 
      }));
      return false;
    }
  }, []);

  // 获取照片数据
  const fetchPhotos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // 获取所有照片
      const photos = await mediaLibraryService.getAllPhotos();
      
      // 获取按月分组的相册
      const albums = await mediaLibraryService.getMonthlyAlbums();
      
      setState(prev => ({
        ...prev,
        photos,
        albums,
        loading: false,
        hasPermission: true,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '获取照片失败',
        loading: false,
      }));
    }
  }, []);

  // 刷新照片数据
  const refreshPhotos = useCallback(async (): Promise<void> => {
    await fetchPhotos();
  }, [fetchPhotos]);

  // 初始化时获取数据
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    ...state,
    refreshPhotos,
    requestPermissions,
  };
};

// 简化版本的 hook，只获取照片列表
export const usePhotosList = () => {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const photoList = await mediaLibraryService.getAllPhotos();
      setPhotos(photoList);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取照片失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    loading,
    error,
    refetch: fetchPhotos,
  };
};

// 获取月度相册的 hook
export const useMonthlyAlbums = () => {
  const [albums, setAlbums] = useState<AlbumMonth[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const albumList = await mediaLibraryService.getMonthlyAlbums();
      setAlbums(albumList);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取相册失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return {
    albums,
    loading,
    error,
    refetch: fetchAlbums,
  };
};

