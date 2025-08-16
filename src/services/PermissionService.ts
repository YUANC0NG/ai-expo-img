import * as MediaLibrary from 'expo-media-library';
import { PermissionStatus } from '../types/Error';
import { PermissionServiceResult } from '../types/Service';

export class PermissionService {
  private static instance: PermissionService;
  private currentStatus: PermissionStatus = PermissionStatus.UNDETERMINED;

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * 检查当前权限状态
   */
  async checkPermissionStatus(): Promise<PermissionServiceResult> {
    try {
      const permission = await MediaLibrary.getPermissionsAsync();
      
      let status: PermissionStatus;
      switch (permission.status) {
        case 'granted':
          status = PermissionStatus.GRANTED;
          break;
        case 'denied':
          status = PermissionStatus.DENIED;
          break;
        case 'undetermined':
          status = PermissionStatus.UNDETERMINED;
          break;
        default:
          status = PermissionStatus.RESTRICTED;
      }

      this.currentStatus = status;

      return {
        status,
        canAskAgain: permission.canAskAgain,
        granted: permission.granted,
      };
    } catch (error) {
      console.error('检查权限状态失败:', error);
      return {
        status: PermissionStatus.DENIED,
        canAskAgain: false,
        granted: false,
      };
    }
  }

  /**
   * 请求照片访问权限
   */
  async requestPermission(): Promise<PermissionServiceResult> {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      
      let status: PermissionStatus;
      switch (permission.status) {
        case 'granted':
          status = PermissionStatus.GRANTED;
          break;
        case 'denied':
          status = PermissionStatus.DENIED;
          break;
        case 'undetermined':
          status = PermissionStatus.UNDETERMINED;
          break;
        default:
          status = PermissionStatus.RESTRICTED;
      }

      this.currentStatus = status;

      return {
        status,
        canAskAgain: permission.canAskAgain,
        granted: permission.granted,
      };
    } catch (error) {
      console.error('请求权限失败:', error);
      return {
        status: PermissionStatus.DENIED,
        canAskAgain: false,
        granted: false,
      };
    }
  }

  /**
   * 获取当前权限状态（缓存）
   */
  getCurrentStatus(): PermissionStatus {
    return this.currentStatus;
  }

  /**
   * 检查是否有权限访问照片
   */
  hasPermission(): boolean {
    return this.currentStatus === PermissionStatus.GRANTED;
  }

  /**
   * 确保有权限，如果没有则请求
   */
  async ensurePermission(): Promise<PermissionServiceResult> {
    const currentResult = await this.checkPermissionStatus();
    
    if (currentResult.granted) {
      return currentResult;
    }

    if (currentResult.canAskAgain) {
      return await this.requestPermission();
    }

    return currentResult;
  }
}