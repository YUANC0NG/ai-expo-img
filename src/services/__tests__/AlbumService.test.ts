import { AlbumService } from '../AlbumService';
import { PhotoService } from '../PhotoService';
import { Photo } from '../../types/Photo';

// Mock PhotoService
jest.mock('../PhotoService');

describe('AlbumService', () => {
  let albumService: AlbumService;
  let mockPhotoService: jest.Mocked<PhotoService>;

  const mockPhotos: Photo[] = [
    {
      id: '1',
      uri: 'photo1.jpg',
      filename: 'photo1.jpg',
      creationTime: new Date('2024-01-15').getTime(),
      modificationTime: new Date('2024-01-15').getTime(),
      width: 1920,
      height: 1080,
      mediaType: 'photo',
    },
    {
      id: '2',
      uri: 'photo2.jpg',
      filename: 'photo2.jpg',
      creationTime: new Date('2024-01-20').getTime(),
      modificationTime: new Date('2024-01-20').getTime(),
      width: 1080,
      height: 1920,
      mediaType: 'photo',
    },
    {
      id: '3',
      uri: 'photo3.jpg',
      filename: 'photo3.jpg',
      creationTime: new Date('2024-02-10').getTime(),
      modificationTime: new Date('2024-02-10').getTime(),
      width: 1920,
      height: 1080,
      mediaType: 'photo',
    },
  ];

  beforeEach(() => {
    albumService = AlbumService.getInstance();
    mockPhotoService = PhotoService.getInstance() as jest.Mocked<PhotoService>;
    jest.clearAllMocks();
  });

  describe('getMonthlyAlbums', () => {
    it('should group photos by month correctly', async () => {
      mockPhotoService.getAllPhotos.mockResolvedValueOnce({
        photos: mockPhotos,
        hasNextPage: false,
      });

      const albumGroups = await albumService.getMonthlyAlbums();

      expect(albumGroups).toHaveLength(1); // 2024年
      expect(albumGroups[0].year).toBe(2024);
      expect(albumGroups[0].months).toHaveLength(2); // 1月和2月

      // 检查1月的照片
      const januaryAlbum = albumGroups[0].months.find(m => m.month === 1);
      expect(januaryAlbum).toBeDefined();
      expect(januaryAlbum!.photoCount).toBe(2);
      expect(januaryAlbum!.photos).toHaveLength(2);

      // 检查2月的照片
      const februaryAlbum = albumGroups[0].months.find(m => m.month === 2);
      expect(februaryAlbum).toBeDefined();
      expect(februaryAlbum!.photoCount).toBe(1);
      expect(februaryAlbum!.photos).toHaveLength(1);
    });

    it('should return empty array when no photos exist', async () => {
      mockPhotoService.getAllPhotos.mockResolvedValueOnce({
        photos: [],
        hasNextPage: false,
      });

      const albumGroups = await albumService.getMonthlyAlbums();

      expect(albumGroups).toHaveLength(0);
    });

    it('should handle pagination correctly', async () => {
      mockPhotoService.getAllPhotos
        .mockResolvedValueOnce({
          photos: mockPhotos.slice(0, 2),
          hasNextPage: true,
          endCursor: 'cursor1',
        })
        .mockResolvedValueOnce({
          photos: mockPhotos.slice(2),
          hasNextPage: false,
        });

      const albumGroups = await albumService.getMonthlyAlbums();

      expect(mockPhotoService.getAllPhotos).toHaveBeenCalledTimes(2);
      expect(albumGroups[0].months).toHaveLength(2);
    });
  });

  describe('getPhotosByMonth', () => {
    it('should return photos for specific month', async () => {
      mockPhotoService.getAllPhotos.mockResolvedValueOnce({
        photos: mockPhotos,
        hasNextPage: false,
      });

      const januaryPhotos = await albumService.getPhotosByMonth(2024, 1);

      expect(januaryPhotos).toHaveLength(2);
      expect(januaryPhotos.every(photo => {
        const date = new Date(photo.creationTime);
        return date.getFullYear() === 2024 && date.getMonth() === 0; // 0-based month
      })).toBe(true);
    });

    it('should return empty array for month with no photos', async () => {
      mockPhotoService.getAllPhotos.mockResolvedValueOnce({
        photos: mockPhotos,
        hasNextPage: false,
      });

      const marchPhotos = await albumService.getPhotosByMonth(2024, 3);

      expect(marchPhotos).toHaveLength(0);
    });
  });

  describe('getAlbumStats', () => {
    it('should return correct statistics', async () => {
      mockPhotoService.getAllPhotos.mockResolvedValueOnce({
        photos: mockPhotos,
        hasNextPage: false,
      });

      const stats = await albumService.getAlbumStats();

      expect(stats.totalPhotos).toBe(3);
      expect(stats.totalMonths).toBe(2);
      expect(stats.oldestPhoto).toEqual(new Date('2024-01-15'));
      expect(stats.newestPhoto).toEqual(new Date('2024-02-10'));
    });

    it('should handle empty photo library', async () => {
      mockPhotoService.getAllPhotos.mockResolvedValueOnce({
        photos: [],
        hasNextPage: false,
      });

      const stats = await albumService.getAlbumStats();

      expect(stats.totalPhotos).toBe(0);
      expect(stats.totalMonths).toBe(0);
      expect(stats.oldestPhoto).toBeNull();
      expect(stats.newestPhoto).toBeNull();
    });
  });

  describe('utility methods', () => {
    it('should format month names correctly', () => {
      expect(albumService.getMonthName(1)).toBe('一月');
      expect(albumService.getMonthName(12)).toBe('十二月');
      expect(albumService.getMonthName(13)).toBe('未知月份');
    });

    it('should format album titles correctly', () => {
      expect(albumService.formatAlbumTitle(2024, 1)).toBe('2024年一月');
      expect(albumService.formatAlbumTitle(2023, 12)).toBe('2023年十二月');
    });
  });
});