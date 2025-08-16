import { PermissionService } from '../PermissionService';
import { PermissionStatus } from '../../types/Error';
import * as MediaLibrary from 'expo-media-library';

// Mock expo-media-library
jest.mock('expo-media-library');

describe('PermissionService', () => {
  let permissionService: PermissionService;
  const mockMediaLibrary = MediaLibrary as jest.Mocked<typeof MediaLibrary>;

  beforeEach(() => {
    permissionService = PermissionService.getInstance();
    jest.clearAllMocks();
  });

  describe('checkPermissionStatus', () => {
    it('should return granted status when permission is granted', async () => {
      mockMediaLibrary.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await permissionService.checkPermissionStatus();

      expect(result.status).toBe(PermissionStatus.GRANTED);
      expect(result.granted).toBe(true);
      expect(result.canAskAgain).toBe(true);
    });

    it('should return denied status when permission is denied', async () => {
      mockMediaLibrary.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
        expires: 'never',
      });

      const result = await permissionService.checkPermissionStatus();

      expect(result.status).toBe(PermissionStatus.DENIED);
      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockMediaLibrary.getPermissionsAsync.mockRejectedValue(new Error('Permission check failed'));

      const result = await permissionService.checkPermissionStatus();

      expect(result.status).toBe(PermissionStatus.DENIED);
      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('should request and return granted permission', async () => {
      mockMediaLibrary.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await permissionService.requestPermission();

      expect(result.status).toBe(PermissionStatus.GRANTED);
      expect(result.granted).toBe(true);
      expect(mockMediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle permission request failure', async () => {
      mockMediaLibrary.requestPermissionsAsync.mockRejectedValue(new Error('Request failed'));

      const result = await permissionService.requestPermission();

      expect(result.status).toBe(PermissionStatus.DENIED);
      expect(result.granted).toBe(false);
    });
  });

  describe('ensurePermission', () => {
    it('should return current permission if already granted', async () => {
      mockMediaLibrary.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await permissionService.ensurePermission();

      expect(result.granted).toBe(true);
      expect(mockMediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permission if not granted and can ask again', async () => {
      mockMediaLibrary.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
        granted: false,
        expires: 'never',
      });

      mockMediaLibrary.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await permissionService.ensurePermission();

      expect(result.granted).toBe(true);
      expect(mockMediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
    });
  });
});