import { Photo } from '../types/Photo';

/**
 * 照片工具类
 */
export class PhotoUtils {
  /**
   * 计算照片的宽高比
   */
  static getAspectRatio(photo: Photo): number {
    return photo.width / photo.height;
  }

  /**
   * 判断照片是否为横向
   */
  static isLandscape(photo: Photo): boolean {
    return photo.width > photo.height;
  }

  /**
   * 判断照片是否为竖向
   */
  static isPortrait(photo: Photo): boolean {
    return photo.height > photo.width;
  }

  /**
   * 判断照片是否为正方形
   */
  static isSquare(photo: Photo): boolean {
    return photo.width === photo.height;
  }

  /**
   * 获取照片的显示尺寸（保持宽高比）
   */
  static getDisplaySize(
    photo: Photo, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = this.getAspectRatio(photo);
    
    let width = maxWidth;
    let height = maxWidth / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }
    
    return { width, height };
  }

  /**
   * 格式化照片文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化照片创建时间
   */
  static formatCreationTime(timestamp: number, format: 'date' | 'datetime' | 'relative' = 'date'): string {
    const date = new Date(timestamp);
    const now = new Date();
    
    switch (format) {
      case 'date':
        return date.toLocaleDateString('zh-CN');
      
      case 'datetime':
        return date.toLocaleString('zh-CN');
      
      case 'relative':
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return '今天';
        } else if (diffDays === 1) {
          return '昨天';
        } else if (diffDays < 7) {
          return `${diffDays}天前`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          return `${weeks}周前`;
        } else if (diffDays < 365) {
          const months = Math.floor(diffDays / 30);
          return `${months}个月前`;
        } else {
          const years = Math.floor(diffDays / 365);
          return `${years}年前`;
        }
      
      default:
        return date.toLocaleDateString('zh-CN');
    }
  }

  /**
   * 生成照片的唯一标识符
   */
  static generatePhotoKey(photo: Photo): string {
    return `${photo.id}_${photo.creationTime}`;
  }

  /**
   * 比较两张照片是否相同
   */
  static isSamePhoto(photo1: Photo, photo2: Photo): boolean {
    return photo1.id === photo2.id && 
           photo1.creationTime === photo2.creationTime &&
           photo1.filename === photo2.filename;
  }

  /**
   * 按创建时间排序照片
   */
  static sortPhotosByCreationTime(photos: Photo[], order: 'asc' | 'desc' = 'desc'): Photo[] {
    return [...photos].sort((a, b) => {
      return order === 'desc' 
        ? b.creationTime - a.creationTime
        : a.creationTime - b.creationTime;
    });
  }

  /**
   * 过滤照片（排除视频）
   */
  static filterPhotosOnly(photos: Photo[]): Photo[] {
    return photos.filter(photo => photo.mediaType === 'photo');
  }

  /**
   * 获取照片的缩略图URI（如果存在）
   */
  static getThumbnailUri(photo: Photo): string {
    return photo.thumbnailUri || photo.uri;
  }

  /**
   * 检查照片是否已被标记为删除
   */
  static isDeleted(photo: Photo): boolean {
    return photo.isDeleted === true;
  }

  /**
   * 创建照片的副本
   */
  static clonePhoto(photo: Photo): Photo {
    return { ...photo };
  }

  /**
   * 批量处理照片
   */
  static batchProcess<T>(
    photos: Photo[], 
    processor: (photo: Photo) => T,
    batchSize: number = 10
  ): T[] {
    const results: T[] = [];
    
    for (let i = 0; i < photos.length; i += batchSize) {
      const batch = photos.slice(i, i + batchSize);
      const batchResults = batch.map(processor);
      results.push(...batchResults);
    }
    
    return results;
  }
}