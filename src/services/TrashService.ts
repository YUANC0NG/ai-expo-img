import AsyncStorage from '@react-native-async-storage/async-storage';
import { Photo } from '../types/Photo';
import { PhotoService } from './PhotoService';
import { APP_CONFIG } from '../config/app';

interface TrashItem {
  photo: Photo;
  deletedAt: number;
  originalIndex?: number;
  source?: 'user_delete' | 'auto_cleanup' | 'batch_delete';
}

interface TrashStats {
  totalItems: number;
  totalSize: number; // 估算的文件大小
  oldestItem: Date | null;
  newestItem: Date | null;
  itemsBySource: Record<string, number>;
}

export class TrashService {
  private static instance: TrashService;
  private photoService: PhotoService;
  private readonly storageKey = '@photo_cleaner_trash';
  private readonly retentionDays: number;

  constructor() {
    this.photoService = PhotoService.getInstance();
    this.retentionDays = APP_CONFIG.deleteService.trashRetentionDays;
  }

  static getInstance(): TrashService {
    if (!TrashService.instance) {
      TrashService.instance = new TrashService();
    }
    return TrashService.instance;
  }

  /**
   * 获取垃圾桶中的所有项目
   */
  async getTrashItems(): Promise<TrashItem[]> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (!stored) return [];

      const items: TrashItem[] = JSON.parse(stored);
      
      // 过滤过期项目
      const validItems = this.filterExpiredItems(items);
      
      // 如果有过期项目被过滤，更新存储
      if (validItems.length !== items.length) {
        await this.saveTrashItems(validItems);
      }

      return validItems;
    } catch (error) {
      console.error('获取垃圾桶项目失败:', error);
      return [];
    }
  }

  /**
   * 添加照片到垃圾桶
   */
  async addToTrash(
    photo: Photo, 
    originalIndex?: number,
    source: 'user_delete' | 'auto_cleanup' | 'batch_delete' = 'user_delete'
  ): Promise<void> {
    try {
      const items = await this.getTrashItems();
      
      // 检查是否已存在
      const existingIndex = items.findIndex(item => item.photo.id === photo.id);
      if (existingIndex >= 0) {
        // 更新现有项目
        items[existingIndex] = {
          photo: { ...photo, isDeleted: true },
          deletedAt: Date.now(),
          originalIndex,
          source,
        };
      } else {
        // 添加新项目
        items.push({
          photo: { ...photo, isDeleted: true },
          deletedAt: Date.now(),
          originalIndex,
          source,
        });
      }

      await this.saveTrashItems(items);
    } catch (error) {
      console.error('添加到垃圾桶失败:', error);
      throw error;
    }
  }

  /**
   * 批量添加照片到垃圾桶
   */
  async addMultipleToTrash(
    photos: Photo[],
    source: 'user_delete' | 'auto_cleanup' | 'batch_delete' = 'batch_delete'
  ): Promise<void> {
    try {
      const items = await this.getTrashItems();
      const now = Date.now();

      photos.forEach((photo, index) => {
        const existingIndex = items.findIndex(item => item.photo.id === photo.id);
        const trashItem: TrashItem = {
          photo: { ...photo, isDeleted: true },
          deletedAt: now,
          originalIndex: index,
          source,
        };

        if (existingIndex >= 0) {
          items[existingIndex] = trashItem;
        } else {
          items.push(trashItem);
        }
      });

      await this.saveTrashItems(items);
    } catch (error) {
      console.error('批量添加到垃圾桶失败:', error);
      throw error;
    }
  }

  /**
   * 从垃圾桶恢复照片
   */
  async restoreFromTrash(photoIds: string[]): Promise<Photo[]> {
    try {
      const items = await this.getTrashItems();
      const itemsToRestore = items.filter(item => photoIds.includes(item.photo.id));
      const restoredPhotos = itemsToRestore.map(item => ({
        ...item.photo,
        isDeleted: false,
      }));

      // 从垃圾桶中移除恢复的项目
      const remainingItems = items.filter(item => !photoIds.includes(item.photo.id));
      await this.saveTrashItems(remainingItems);

      return restoredPhotos;
    } catch (error) {
      console.error('从垃圾桶恢复失败:', error);
      throw error;
    }
  }

  /**
   * 永久删除照片
   */
  async permanentlyDelete(photoIds: string[]): Promise<{ success: string[], failed: string[] }> {
    try {
      const items = await this.getTrashItems();
      const itemsToDelete = items.filter(item => photoIds.includes(item.photo.id));
      
      // 从设备中删除照片
      const deleteResult = await this.photoService.deletePhotos(
        itemsToDelete.map(item => item.photo.id)
      );

      // 从垃圾桶中移除已删除的项目
      const remainingItems = items.filter(item => 
        !deleteResult.success.includes(item.photo.id)
      );
      await this.saveTrashItems(remainingItems);

      return deleteResult;
    } catch (error) {
      console.error('永久删除失败:', error);
      throw error;
    }
  }

  /**
   * 清空垃圾桶
   */
  async emptyTrash(): Promise<{ success: string[], failed: string[] }> {
    try {
      const items = await this.getTrashItems();
      const photoIds = items.map(item => item.photo.id);
      
      if (photoIds.length === 0) {
        return { success: [], failed: [] };
      }

      const deleteResult = await this.permanentlyDelete(photoIds);
      
      // 清空垃圾桶存储
      await AsyncStorage.removeItem(this.storageKey);

      return deleteResult;
    } catch (error) {
      console.error('清空垃圾桶失败:', error);
      throw error;
    }
  }

  /**
   * 获取垃圾桶统计信息
   */
  async getTrashStats(): Promise<TrashStats> {
    try {
      const items = await this.getTrashItems();
      
      if (items.length === 0) {
        return {
          totalItems: 0,
          totalSize: 0,
          oldestItem: null,
          newestItem: null,
          itemsBySource: {},
        };
      }

      const deletedTimes = items.map(item => item.deletedAt);
      const itemsBySource: Record<string, number> = {};

      items.forEach(item => {
        const source = item.source || 'unknown';
        itemsBySource[source] = (itemsBySource[source] || 0) + 1;
      });

      // 估算文件大小（基于分辨率）
      const estimatedSize = items.reduce((total, item) => {
        const { width, height } = item.photo;
        // 粗略估算：每像素3字节（RGB），JPEG压缩率约10:1
        const estimatedBytes = (width * height * 3) / 10;
        return total + estimatedBytes;
      }, 0);

      return {
        totalItems: items.length,
        totalSize: estimatedSize,
        oldestItem: new Date(Math.min(...deletedTimes)),
        newestItem: new Date(Math.max(...deletedTimes)),
        itemsBySource,
      };
    } catch (error) {
      console.error('获取垃圾桶统计失败:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        oldestItem: null,
        newestItem: null,
        itemsBySource: {},
      };
    }
  }

  /**
   * 自动清理过期项目
   */
  async autoCleanup(): Promise<number> {
    try {
      const items = await this.getTrashItems();
      const validItems = this.filterExpiredItems(items);
      const cleanedCount = items.length - validItems.length;

      if (cleanedCount > 0) {
        await this.saveTrashItems(validItems);
      }

      return cleanedCount;
    } catch (error) {
      console.error('自动清理失败:', error);
      return 0;
    }
  }

  /**
   * 检查照片是否在垃圾桶中
   */
  async isInTrash(photoId: string): Promise<boolean> {
    try {
      const items = await this.getTrashItems();
      return items.some(item => item.photo.id === photoId);
    } catch (error) {
      console.error('检查垃圾桶状态失败:', error);
      return false;
    }
  }

  /**
   * 过滤过期项目
   */
  private filterExpiredItems(items: TrashItem[]): TrashItem[] {
    const now = Date.now();
    const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;

    return items.filter(item => {
      return (now - item.deletedAt) <= retentionMs;
    });
  }

  /**
   * 保存垃圾桶项目到存储
   */
  private async saveTrashItems(items: TrashItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('保存垃圾桶数据失败:', error);
      throw error;
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取保留天数
   */
  getRetentionDays(): number {
    return this.retentionDays;
  }
}