import { Photo, Album, MonthlyAlbum, AlbumGroup } from '../types/Photo';
import { AlbumServiceConfig } from '../types/Service';
import { PhotoService } from './PhotoService';
import { APP_CONFIG } from '../config/app';

export class AlbumService {
  private static instance: AlbumService;
  private photoService: PhotoService;
  private config: AlbumServiceConfig;

  constructor(config: AlbumServiceConfig = APP_CONFIG.albumService) {
    this.photoService = PhotoService.getInstance();
    this.config = config;
  }

  static getInstance(): AlbumService {
    if (!AlbumService.instance) {
      AlbumService.instance = new AlbumService();
    }
    return AlbumService.instance;
  }

  /**
   * 获取按月份分组的相册
   */
  async getMonthlyAlbums(): Promise<AlbumGroup[]> {
    try {
      const allPhotos = await this.getAllPhotosFromLibrary();
      
      if (allPhotos.length === 0) {
        return [];
      }

      const groupedPhotos = this.groupPhotosByMonth(allPhotos);
      const albumGroups = this.convertToAlbumGroups(groupedPhotos);

      return this.config.sortOrder === 'desc' 
        ? albumGroups.reverse() 
        : albumGroups;
    } catch (error) {
      console.error('获取月度相册失败:', error);
      throw error;
    }
  }

  /**
   * 根据年月获取特定月份的照片
   */
  async getPhotosByMonth(year: number, month: number): Promise<Photo[]> {
    try {
      const allPhotos = await this.getAllPhotosFromLibrary();
      
      return allPhotos.filter(photo => {
        const photoDate = new Date(photo.creationTime);
        return photoDate.getFullYear() === year && photoDate.getMonth() === month - 1;
      });
    } catch (error) {
      console.error('获取月份照片失败:', error);
      throw error;
    }
  }

  /**
   * 获取相册统计信息
   */
  async getAlbumStats(): Promise<{
    totalPhotos: number;
    totalMonths: number;
    oldestPhoto: Date | null;
    newestPhoto: Date | null;
  }> {
    try {
      const allPhotos = await this.getAllPhotosFromLibrary();
      
      if (allPhotos.length === 0) {
        return {
          totalPhotos: 0,
          totalMonths: 0,
          oldestPhoto: null,
          newestPhoto: null,
        };
      }

      const dates = allPhotos.map(photo => new Date(photo.creationTime));
      const uniqueMonths = new Set(
        dates.map(date => `${date.getFullYear()}-${date.getMonth()}`)
      );

      return {
        totalPhotos: allPhotos.length,
        totalMonths: uniqueMonths.size,
        oldestPhoto: new Date(Math.min(...dates.map(d => d.getTime()))),
        newestPhoto: new Date(Math.max(...dates.map(d => d.getTime()))),
      };
    } catch (error) {
      console.error('获取相册统计失败:', error);
      throw error;
    }
  }

  /**
   * 从照片库获取所有照片
   */
  private async getAllPhotosFromLibrary(): Promise<Photo[]> {
    const allPhotos: Photo[] = [];
    let hasNextPage = true;
    let endCursor: string | undefined;

    while (hasNextPage) {
      const result = await this.photoService.getAllPhotos(endCursor);
      allPhotos.push(...result.photos);
      hasNextPage = result.hasNextPage;
      endCursor = result.endCursor;
    }

    return allPhotos;
  }

  /**
   * 按月份分组照片
   */
  private groupPhotosByMonth(photos: Photo[]): Map<string, Photo[]> {
    const grouped = new Map<string, Photo[]>();

    photos.forEach(photo => {
      const date = new Date(photo.creationTime);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      
      grouped.get(key)!.push(photo);
    });

    // 对每个月的照片进行排序
    grouped.forEach(monthPhotos => {
      monthPhotos.sort((a, b) => {
        return this.config.sortOrder === 'desc' 
          ? b.creationTime - a.creationTime
          : a.creationTime - b.creationTime;
      });
    });

    return grouped;
  }

  /**
   * 将分组的照片转换为AlbumGroup结构
   */
  private convertToAlbumGroups(groupedPhotos: Map<string, Photo[]>): AlbumGroup[] {
    const yearGroups = new Map<number, MonthlyAlbum[]>();

    groupedPhotos.forEach((photos, key) => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      if (!yearGroups.has(year)) {
        yearGroups.set(year, []);
      }

      const monthlyAlbum: MonthlyAlbum = {
        year,
        month,
        photos,
        photoCount: photos.length,
        coverPhoto: photos[0], // 使用第一张照片作为封面
      };

      yearGroups.get(year)!.push(monthlyAlbum);
    });

    // 转换为AlbumGroup数组并排序
    const albumGroups: AlbumGroup[] = [];
    
    yearGroups.forEach((months, year) => {
      // 对月份进行排序
      months.sort((a, b) => {
        return this.config.sortOrder === 'desc' 
          ? b.month - a.month
          : a.month - b.month;
      });

      albumGroups.push({
        year,
        months,
      });
    });

    // 对年份进行排序
    albumGroups.sort((a, b) => {
      return this.config.sortOrder === 'desc' 
        ? b.year - a.year
        : a.year - b.year;
    });

    return albumGroups;
  }

  /**
   * 获取月份名称（中文）
   */
  getMonthName(month: number): string {
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return monthNames[month - 1] || '未知月份';
  }

  /**
   * 格式化相册标题
   */
  formatAlbumTitle(year: number, month: number): string {
    return `${year}年${this.getMonthName(month)}`;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AlbumServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}