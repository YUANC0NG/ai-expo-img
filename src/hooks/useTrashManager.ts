import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Photo } from '../types/Photo';
import { errorHandler } from '../utils/errorHandler';

interface TrashItem {
  photo: Photo;
  deletedAt: number;
  originalIndex?: number;
}

interface UseTrashManagerResult {
  trashedPhotos: TrashItem[];
  selectedPhotos: Set<string>;
  isLoading: boolean;
  error: string | null;
  addToTrash: (photo: Photo, originalIndex?: number) => Promise<void>;
  removeFromTrash: (photoIds: string[]) => Promise<void>;
  restoreFromTrash: (photoIds: string[]) => Promise<Photo[]>;
  clearTrash: () => Promise<void>;
  selectPhoto: (photoId: string) => void;
  deselectPhoto: (photoId: string) => void;
  selectAllPhotos: () => void;
  deselectAllPhotos: () => void;
  togglePhotoSelection: (photoId: string) => void;
  getSelectedCount: () => number;
  getTotalCount: () => number;
  isPhotoSelected: (photoId: string) => boolean;
  loadTrash: () => Promise<void>;
}

const TRASH_STORAGE_KEY = '@photo_cleaner_trash';
const TRASH_RETENTION_DAYS = 30; // 垃圾桶保留天数

export function useTrashManager(): UseTrashManagerResult {
  const [trashedPhotos, setTrashedPhotos] = useState<TrashItem[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从存储加载垃圾桶数据
  const loadTrash = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stored = await AsyncStorage.getItem(TRASH_STORAGE_KEY);
      if (stored) {
        const parsedData: TrashItem[] = JSON.parse(stored);
        
        // 过滤过期的项目
        const now = Date.now();
        const validItems = parsedData.filter(item => {
          const daysSinceDeleted = (now - item.deletedAt) / (1000 * 60 * 60 * 24);
          return daysSinceDeleted <= TRASH_RETENTION_DAYS;
        });

        setTrashedPhotos(validItems);

        // 如果有过期项目被清理，更新存储
        if (validItems.length !== parsedData.length) {
          await saveTrashToStorage(validItems);
        }
      }
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'loadTrash');
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 保存垃圾桶数据到存储
  const saveTrashToStorage = useCallback(async (items: TrashItem[]) => {
    try {
      await AsyncStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('保存垃圾桶数据失败:', error);
      throw error;
    }
  }, []);

  // 添加照片到垃圾桶
  const addToTrash = useCallback(async (photo: Photo, originalIndex?: number) => {
    try {
      const trashItem: TrashItem = {
        photo: { ...photo, isDeleted: true },
        deletedAt: Date.now(),
        originalIndex,
      };

      const updatedTrash = [...trashedPhotos, trashItem];
      setTrashedPhotos(updatedTrash);
      await saveTrashToStorage(updatedTrash);
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'addToTrash');
      setError(appError.message);
      throw error;
    }
  }, [trashedPhotos, saveTrashToStorage]);

  // 从垃圾桶移除照片（永久删除）
  const removeFromTrash = useCallback(async (photoIds: string[]) => {
    try {
      const updatedTrash = trashedPhotos.filter(
        item => !photoIds.includes(item.photo.id)
      );
      
      setTrashedPhotos(updatedTrash);
      await saveTrashToStorage(updatedTrash);

      // 同时从选中列表中移除
      const updatedSelected = new Set(selectedPhotos);
      photoIds.forEach(id => updatedSelected.delete(id));
      setSelectedPhotos(updatedSelected);
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'removeFromTrash');
      setError(appError.message);
      throw error;
    }
  }, [trashedPhotos, selectedPhotos, saveTrashToStorage]);

  // 从垃圾桶恢复照片
  const restoreFromTrash = useCallback(async (photoIds: string[]): Promise<Photo[]> => {
    try {
      const itemsToRestore = trashedPhotos.filter(
        item => photoIds.includes(item.photo.id)
      );
      
      const restoredPhotos = itemsToRestore.map(item => ({
        ...item.photo,
        isDeleted: false,
      }));

      const updatedTrash = trashedPhotos.filter(
        item => !photoIds.includes(item.photo.id)
      );
      
      setTrashedPhotos(updatedTrash);
      await saveTrashToStorage(updatedTrash);

      // 同时从选中列表中移除
      const updatedSelected = new Set(selectedPhotos);
      photoIds.forEach(id => updatedSelected.delete(id));
      setSelectedPhotos(updatedSelected);

      return restoredPhotos;
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'restoreFromTrash');
      setError(appError.message);
      throw error;
    }
  }, [trashedPhotos, selectedPhotos, saveTrashToStorage]);

  // 清空垃圾桶
  const clearTrash = useCallback(async () => {
    try {
      setTrashedPhotos([]);
      setSelectedPhotos(new Set());
      await AsyncStorage.removeItem(TRASH_STORAGE_KEY);
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, 'clearTrash');
      setError(appError.message);
      throw error;
    }
  }, []);

  // 选择照片
  const selectPhoto = useCallback((photoId: string) => {
    setSelectedPhotos(prev => new Set([...prev, photoId]));
  }, []);

  // 取消选择照片
  const deselectPhoto = useCallback((photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      newSet.delete(photoId);
      return newSet;
    });
  }, []);

  // 全选照片
  const selectAllPhotos = useCallback(() => {
    const allPhotoIds = trashedPhotos.map(item => item.photo.id);
    setSelectedPhotos(new Set(allPhotoIds));
  }, [trashedPhotos]);

  // 取消全选
  const deselectAllPhotos = useCallback(() => {
    setSelectedPhotos(new Set());
  }, []);

  // 切换照片选择状态
  const togglePhotoSelection = useCallback((photoId: string) => {
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

  // 获取选中数量
  const getSelectedCount = useCallback(() => {
    return selectedPhotos.size;
  }, [selectedPhotos]);

  // 获取总数量
  const getTotalCount = useCallback(() => {
    return trashedPhotos.length;
  }, [trashedPhotos]);

  // 检查照片是否被选中
  const isPhotoSelected = useCallback((photoId: string) => {
    return selectedPhotos.has(photoId);
  }, [selectedPhotos]);

  // 初始化加载
  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  // 定期清理过期项目
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const validItems = trashedPhotos.filter(item => {
        const daysSinceDeleted = (now - item.deletedAt) / (1000 * 60 * 60 * 24);
        return daysSinceDeleted <= TRASH_RETENTION_DAYS;
      });

      if (validItems.length !== trashedPhotos.length) {
        setTrashedPhotos(validItems);
        saveTrashToStorage(validItems);
      }
    }, 60 * 60 * 1000); // 每小时检查一次

    return () => clearInterval(cleanupInterval);
  }, [trashedPhotos, saveTrashToStorage]);

  return {
    trashedPhotos,
    selectedPhotos,
    isLoading,
    error,
    addToTrash,
    removeFromTrash,
    restoreFromTrash,
    clearTrash,
    selectPhoto,
    deselectPhoto,
    selectAllPhotos,
    deselectAllPhotos,
    togglePhotoSelection,
    getSelectedCount,
    getTotalCount,
    isPhotoSelected,
    loadTrash,
  };
}