import { AppError, ErrorType } from '../types/Error';
import { ERROR_MESSAGES } from './constants';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: ((error: AppError) => void)[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   */
  handleError(error: Error | AppError, context?: string): AppError {
    let appError: AppError;

    if (this.isAppError(error)) {
      appError = error;
    } else {
      appError = this.convertToAppError(error, context);
    }

    // 记录错误
    this.logError(appError, context);

    // 通知监听器
    this.notifyListeners(appError);

    return appError;
  }

  /**
   * 创建特定类型的错误
   */
  createError(type: ErrorType, message?: string, recoverable: boolean = true): AppError {
    return {
      type,
      message: message || ERROR_MESSAGES[type] || '未知错误',
      recoverable,
    };
  }

  /**
   * 添加错误监听器
   */
  addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * 移除错误监听器
   */
  removeErrorListener(listener: (error: AppError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * 检查是否为AppError
   */
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'type' in error && 'message' in error;
  }

  /**
   * 将普通错误转换为AppError
   */
  private convertToAppError(error: Error, context?: string): AppError {
    let type: ErrorType = ErrorType.NETWORK_ERROR;
    let recoverable = true;

    // 根据错误消息或上下文判断错误类型
    if (error.message.includes('permission') || error.message.includes('权限')) {
      type = ErrorType.PERMISSION_DENIED;
      recoverable = false;
    } else if (error.message.includes('load') || error.message.includes('加载')) {
      type = ErrorType.MEDIA_LOAD_FAILED;
    } else if (error.message.includes('cache') || error.message.includes('缓存')) {
      type = ErrorType.CACHE_OVERFLOW;
    } else if (context?.includes('animation') || context?.includes('动画')) {
      type = ErrorType.ANIMATION_ERROR;
    }

    return {
      type,
      message: error.message,
      recoverable,
    };
  }

  /**
   * 记录错误
   */
  private logError(error: AppError, context?: string): void {
    const logMessage = `[${error.type}] ${error.message}`;
    
    if (context) {
      console.error(`${logMessage} (Context: ${context})`);
    } else {
      console.error(logMessage);
    }

    // 在生产环境中，这里可以发送到错误监控服务
    if (!__DEV__) {
      // 发送到错误监控服务
      // crashlytics().recordError(error);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error listener failed:', listenerError);
      }
    });
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();