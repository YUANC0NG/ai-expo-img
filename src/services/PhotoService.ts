import * as MediaLibrary from 'expo-media-library';
import { Photo } from '../types/Photo';
import { PhotoServiceConfig, PhotoLibraryResult } from '../types/Service';
import { PermissionService } from './PermissionService';
import { APP_CONFIG } from '../config/app';

export class PhotoService {
  private static instance: PhotoService;
  private permissionService: PermissionService;
  private config: PhotoServiceConfig;

  constructor(config: PhotoServiceConfig = APP_CONFIG.photoService) {
    this.permissionService = PermissionService.getInstance();
    this.config = config;
  }

  static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  /**
   * 获取所有照片
   */
  async getAllPhotos(after?: string): Promise<PhotoLibraryResult> {
    try {
      // 确保有权限
      const permissionResult = await this.permissionService.ensurePermission();
      if (!permissionResult.granted) {
        throw new Error('没有访问照片的权限');
      }

      const options: MediaLibrary.AssetsOptions = {
        first: this.config.batchSize,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
        after,
      };

      const result = await MediaLibrary.getAssetsAsync(options);
      
      const photos: Photo[] = result.assets.map(asset => this.convertAssetToPhoto(asset));

      return {
        photos,
        hasNextPage: result.hasNextPage,
        endCursor: result.endCursor,
      };
    } catch (error) {
      console.error('获取照片失败:', error);
      throw error;
    }
  }

  /**
   * 根据相册ID获取照片
   */
  async getPhotosByAlbum(albumId: string, after?: string): Promise<PhotoLibraryResult> {
    try {
      const permissionResult = await this.permissionService.ensurePermission();
      if (!permissionResult.granted) {
        throw new Error('没有访问照片的权限');
      }

      const options: MediaLibrary.AssetsOptions = {
        first: this.config.batchSize,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
        album: albumId,
        after,
      };

      const result = await MediaLibrary.getAssetsAsync(options);
      const photos: Photo[] = result.assets.map(asset => this.convertAssetToPhoto(asset));

      return {
        photos,
        hasNextPage: result.hasNextPage,
        endCursor: result.endCursor,
      };
    } catch (error) {
      console.error('根据相册获取照片失败:', error);
      throw error;
    }
  }

  /**
   * 获取照片的详细信息
   */
  async getPhotoInfo(photoId: string): Promise<Photo | null> {
    try {
      const permissionResult = await this.permissionService.ensurePermission();
      if (!permissionResult.granted) {
        throw new Error('没有访问照片的权限');
      }

      const asset = await MediaLibrary.getAssetInfoAsync(photoId);
      if (!asset) {
        return null;
      }

      return this.convertAssetToPhoto(asset);
    } catch (error) {
      console.error('获取照片信息失败:', error);
      return null;
    }
  }

  /**
   * 删除照片
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const permissionResult = await this.permissionService.ensurePermission();
      if (!permissionResult.granted) {
        throw new Error('没有访问照片的权限');
      }

      await MediaLibrary.deleteAssetsAsync([photoId]);
      return true;
    } catch (error) {
      console.error('删除照片失败:', error);
      return false;
    }
  }

  /**
   * 批量删除照片
   */
  async deletePhotos(photoIds: string[]): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    try {
      const permissionResult = await this.permissionService.ensurePermission();
      if (!permissionResult.granted) {
        throw new Error('没有访问照片的权限');
      }

      // 分批删除以避免一次性删除太多照片
      const batchSize = 10;
      for (let i = 0; i < photoIds.length; i += batchSize) {
        const batch = photoIds.slice(i, i + batchSize);
        
        try {
          await MediaLibrary.deleteAssetsAsync(batch);
          success.push(...batch);
        } catch (error) {
          console.error(`批量删除第${i / batchSize + 1}批失败:`, error);
          failed.push(...batch);
        }
      }
    } catch (error) {
      console.error('批量删除照片失败:', error);
      failed.push(...photoIds);
    }

    return { success, failed };
  }

  /**
   * 将MediaLibrary.Asset转换为Photo类型
   */
  private convertAssetToPhoto(asset: MediaLibrary.Asset): Photo {
    return {
      id: asset.id,
      uri: asset.uri,
      filename: asset.filename,
      creationTime: asset.creationTime,
      modificationTime: asset.modificationTime || asset.creationTime,
      width: asset.width,
      height: asset.height,
      mediaType: asset.mediaType === MediaLibrary.MediaType.photo ? 'photo' : 'video',
      albumId: asset.albumId,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<PhotoServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}