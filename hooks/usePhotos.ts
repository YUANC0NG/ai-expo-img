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

// 高级照片 hook，支持分页和搜索
interface UseAdvancedPhotosOptions {
  pageSize?: number;
  searchQuery?: string;
  sortBy?: 'creationTime' | 'modificationTime';
  sortOrder?: 'asc' | 'desc';
}

export const useAdvancedPhotos = (options: UseAdvancedPhotosOptions = {}) => {
  const {
    pageSize = 20,
    searchQuery = '',
    sortBy = 'creationTime',
    sortOrder = 'desc'
  } = options;

  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // 获取初始照片数据
  const fetchInitialPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allPhotos = await mediaLibraryService.getAllPhotos();
      
      // 排序
      const sortedPhotos = [...allPhotos].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
      
      setPhotos(sortedPhotos);
      setCurrentPage(0);
      setHasMore(sortedPhotos.length > pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取照片失败');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, pageSize]);

  // 过滤照片
  const filterPhotos = useCallback(() => {
    let filtered = photos;
    
    if (searchQuery.trim()) {
      filtered = photos.filter(photo =>
        photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredPhotos(filtered);
    setCurrentPage(0);
    setHasMore(filtered.length > pageSize);
  }, [photos, searchQuery, pageSize]);

  // 加载更多照片
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = nextPage * pageSize;
      const endIndex = startIndex + pageSize;
      
      setCurrentPage(nextPage);
      setHasMore(endIndex < filteredPhotos.length);
      setLoadingMore(false);
    }, 500); // 模拟加载延迟
  }, [currentPage, pageSize, filteredPhotos.length, loadingMore, hasMore]);

  // 获取当前页面的照片
  const getCurrentPagePhotos = useCallback(() => {
    const endIndex = (currentPage + 1) * pageSize;
    return filteredPhotos.slice(0, endIndex);
  }, [filteredPhotos, currentPage, pageSize]);

  // 初始化
  useEffect(() => {
    fetchInitialPhotos();
  }, [fetchInitialPhotos]);

  // 搜索变化时重新过滤
  useEffect(() => {
    filterPhotos();
  }, [filterPhotos]);

  return {
    photos: getCurrentPagePhotos(),
    allPhotos: photos,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount: filteredPhotos.length,
    currentPage,
    loadMore,
    refresh: fetchInitialPhotos,
  };
};

// 照片选择 hook
export const usePhotoSelection = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const toggleSelection = useCallback((photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((photoIds: string[]) => {
    setSelectedPhotos(new Set(photoIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPhotos(new Set());
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      clearSelection();
    }
  }, [selectionMode, clearSelection]);

  return {
    selectedPhotos: Array.from(selectedPhotos),
    selectedCount: selectedPhotos.size,
    selectionMode,
    isSelected: (photoId: string) => selectedPhotos.has(photoId),
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
  };
};