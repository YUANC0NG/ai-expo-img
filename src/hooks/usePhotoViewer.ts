import { useState, useEffect, useCallback } from 'react';
import { Photo } from '../types/Photo';
import { AlbumService } from '../services/AlbumService';
import { errorHandler } from '../utils/errorHandler';

interface UsePhotoViewerProps {
  year: number;
  month: number;
  initialPhotoId?: string;
}

interface UsePhotoViewerResult {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
  currentPhoto: Photo | null;
  setCurrentIndex: (index: number) => void;
  refresh: () => Promise<void>;
}

export function usePhotoViewer({
  year,
  month,
  initialPhotoId,
}: UsePhotoViewerProps): UsePhotoViewerResult {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const albumService = AlbumService.getInstance();

  // 加载照片数据
  const loadPhotos = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const monthPhotos = await albumService.getPhotosByMonth(year, month);
      setPhotos(monthPhotos);

      // 如果指定了初始照片ID，找到对应的索引
      if (initialPhotoId && monthPhotos.length > 0) {
        const initialIndex = monthPhotos.findIndex(photo => photo.id === initialPhotoId);
        if (initialIndex >= 0) {
          setCurrentIndex(initialIndex);
        }
      }
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'loadPhotos');
      setError(appError.message);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [albumService, year, month, initialPhotoId]);

  // 刷新数据
  const refresh = useCallback(async () => {
    await loadPhotos();
  }, [loadPhotos]);

  // 获取当前照片
  const currentPhoto = photos[currentIndex] || null;

  // 安全设置当前索引
  const safeSetCurrentIndex = useCallback((index: number) => {
    if (index >= 0 && index < photos.length) {
      setCurrentIndex(index);
    }
  }, [photos.length]);

  // 初始化加载
  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // 当照片列表变化时，确保当前索引有效
  useEffect(() => {
    if (photos.length > 0 && currentIndex >= photos.length) {
      setCurrentIndex(Math.max(0, photos.length - 1));
    }
  }, [photos.length, currentIndex]);

  return {
    photos,
    loading,
    error,
    currentIndex,
    currentPhoto,
    setCurrentIndex: safeSetCurrentIndex,
    refresh,
  };
}