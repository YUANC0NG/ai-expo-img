# 设计文档

## 概述

照片清理应用采用现代化的移动应用架构，基于Expo和React Native构建。应用设计重点关注性能优化、流畅的动画效果和直观的用户交互体验。为了处理大量照片数据（一万张以上），我们将采用虚拟化渲染、懒加载、内存管理等多种优化策略。

## 架构

### 整体架构模式

应用采用分层架构模式，包含以下层次：

1. **表现层 (Presentation Layer)**: React Native组件和屏幕
2. **业务逻辑层 (Business Logic Layer)**: 自定义Hooks和服务
3. **数据访问层 (Data Access Layer)**: 照片访问和缓存管理
4. **平台层 (Platform Layer)**: Expo APIs和原生模块

### 技术栈

- **框架**: Expo SDK 53 + React Native 0.79
- **导航**: Expo Router (基于React Navigation)
- **动画**: React Native Reanimated 3.17
- **手势**: React Native Gesture Handler 2.24
- **图片处理**: Expo Image 2.4
- **状态管理**: React Context + useReducer
- **照片访问**: Expo Media Library
- **触觉反馈**: Expo Haptics

## 组件和接口

### 核心组件架构

```
src/
├── components/
│   ├── common/
│   │   ├── VirtualizedList.tsx      # 虚拟化列表组件
│   │   ├── OptimizedImage.tsx       # 优化的图片组件
│   │   └── LoadingSpinner.tsx       # 加载指示器
│   ├── photo/
│   │   ├── PhotoViewer.tsx          # 照片查看器
│   │   ├── PhotoSwiper.tsx          # 照片滑动组件
│   │   ├── DeleteGesture.tsx        # 删除手势组件
│   │   └── PhotoThumbnail.tsx       # 照片缩略图
│   ├── album/
│   │   ├── AlbumList.tsx            # 相册列表
│   │   ├── MonthlyAlbum.tsx         # 月度相册组件
│   │   └── AlbumHeader.tsx          # 相册头部
│   └── trash/
│       ├── TrashBin.tsx             # 垃圾桶组件
│       ├── TrashIcon.tsx            # 垃圾桶图标
│       └── BatchOperations.tsx      # 批量操作组件
├── screens/
│   ├── AlbumListScreen.tsx          # 相册列表屏幕
│   ├── PhotoViewerScreen.tsx        # 照片查看屏幕
│   └── TrashBinScreen.tsx           # 垃圾桶屏幕
├── hooks/
│   ├── usePhotoLibrary.ts           # 照片库访问Hook
│   ├── useVirtualization.ts         # 虚拟化Hook
│   ├── useGestureHandler.ts         # 手势处理Hook
│   ├── usePhotoCache.ts             # 照片缓存Hook
│   └── useTrashManager.ts           # 垃圾桶管理Hook
├── services/
│   ├── PhotoService.ts              # 照片服务
│   ├── CacheService.ts              # 缓存服务
│   ├── AnimationService.ts          # 动画服务
│   └── PermissionService.ts         # 权限服务
├── types/
│   ├── Photo.ts                     # 照片类型定义
│   ├── Album.ts                     # 相册类型定义
│   └── Gesture.ts                   # 手势类型定义
└── utils/
    ├── performance.ts               # 性能优化工具
    ├── animation.ts                 # 动画工具
    └── constants.ts                 # 常量定义
```

### 关键接口定义

#### 照片接口
```typescript
interface Photo {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  modificationTime: number;
  width: number;
  height: number;
  mediaType: 'photo' | 'video';
  albumId?: string;
  isDeleted?: boolean;
  thumbnailUri?: string;
}

interface Album {
  id: string;
  title: string;
  assetCount: number;
  startTime: number;
  endTime: number;
  photos: Photo[];
  coverPhoto?: Photo;
}
```

#### 手势接口
```typescript
interface GestureState {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  state: GestureStateType;
}

interface DeleteGestureConfig {
  threshold: number;
  animationDuration: number;
  hapticFeedback: boolean;
}
```

## 数据模型

### 照片数据管理

#### 数据结构设计
```typescript
// 照片缓存结构
interface PhotoCache {
  thumbnails: Map<string, string>;    // 缩略图缓存
  fullImages: Map<string, string>;    // 全尺寸图片缓存
  metadata: Map<string, Photo>;       // 照片元数据
  lruQueue: string[];                 // LRU队列
}

// 相册分组结构
interface AlbumGroup {
  year: number;
  months: MonthlyAlbum[];
}

interface MonthlyAlbum {
  year: number;
  month: number;
  photos: Photo[];
  photoCount: number;
  coverPhoto: Photo;
}
```

#### 数据流设计
1. **照片获取流程**: 权限检查 → 媒体库扫描 → 按月分组 → 缓存元数据
2. **缓存策略**: LRU缓存 + 预加载 + 内存压力监控
3. **数据同步**: 增量更新 + 变更监听

### 状态管理

#### 全局状态结构
```typescript
interface AppState {
  photos: {
    albums: Album[];
    currentAlbum: Album | null;
    currentPhotoIndex: number;
    loading: boolean;
    error: string | null;
  };
  trash: {
    deletedPhotos: Photo[];
    selectedPhotos: Set<string>;
    isVisible: boolean;
  };
  ui: {
    isGestureActive: boolean;
    animationInProgress: boolean;
    permissionStatus: PermissionStatus;
  };
  cache: {
    thumbnailCache: Map<string, string>;
    imageCache: Map<string, string>;
    cacheSize: number;
  };
}
```

## 错误处理

### 错误类型定义
```typescript
enum ErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  MEDIA_LOAD_FAILED = 'MEDIA_LOAD_FAILED',
  CACHE_OVERFLOW = 'CACHE_OVERFLOW',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}
```

### 错误处理策略
1. **权限错误**: 显示权限引导界面，提供设置跳转
2. **加载错误**: 显示占位符，提供重试机制
3. **缓存错误**: 自动清理缓存，降级到基础功能
4. **动画错误**: 回退到简单过渡，保证功能可用

## 测试策略

### 测试层次

#### 单元测试
- **组件测试**: 使用React Native Testing Library
- **Hook测试**: 测试自定义Hook的逻辑
- **服务测试**: 测试业务逻辑和数据处理
- **工具函数测试**: 测试纯函数和工具方法

#### 集成测试
- **屏幕导航测试**: 测试页面间的导航流程
- **手势交互测试**: 测试滑动和删除手势
- **数据流测试**: 测试从数据获取到UI展示的完整流程

#### 性能测试
- **内存使用测试**: 监控大量照片加载时的内存占用
- **渲染性能测试**: 测试列表滚动和动画的帧率
- **启动时间测试**: 测试应用冷启动和热启动时间

### 测试工具配置
```typescript
// 测试配置示例
const testConfig = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapping: {
    '\\.(jpg|jpeg|png|gif|svg)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
};
```

## 性能优化策略

### 渲染优化

#### 虚拟化渲染
```typescript
// 虚拟化配置
const virtualizationConfig = {
  itemHeight: 200,           // 固定项目高度
  bufferSize: 10,           // 缓冲区大小
  windowSize: 5,            // 渲染窗口大小
  initialNumToRender: 10,   // 初始渲染数量
  maxToRenderPerBatch: 5,   // 每批最大渲染数量
  updateCellsBatchingPeriod: 50, // 批量更新周期
};
```

#### 图片优化
```typescript
// 图片加载策略
const imageOptimization = {
  thumbnailSize: { width: 200, height: 200 },
  preloadDistance: 3,        // 预加载距离
  cacheSize: 100,           // 缓存大小
  compressionQuality: 0.8,   // 压缩质量
  placeholder: 'blur',       // 占位符类型
};
```

### 内存管理

#### LRU缓存实现
```typescript
class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, T>;
  private usage: string[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.usage = [];
  }

  get(key: string): T | undefined {
    if (this.cache.has(key)) {
      this.updateUsage(key);
      return this.cache.get(key);
    }
    return undefined;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      const lru = this.usage.shift();
      if (lru) this.cache.delete(lru);
    }
    this.cache.set(key, value);
    this.updateUsage(key);
  }

  private updateUsage(key: string): void {
    const index = this.usage.indexOf(key);
    if (index > -1) this.usage.splice(index, 1);
    this.usage.push(key);
  }
}
```

### 动画优化

#### 动画配置
```typescript
// 动画性能配置
const animationConfig = {
  useNativeDriver: true,     // 使用原生驱动
  duration: 300,             // 动画时长
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // 缓动函数
  fps: 60,                   // 目标帧率
  enableVSync: true,         // 启用垂直同步
};

// 删除动画配置
const deleteAnimationConfig = {
  translationY: -200,        // Y轴移动距离
  translationX: 100,         // X轴移动距离
  scale: 0.3,               // 缩放比例
  rotation: 15,             // 旋转角度
  duration: 400,            // 动画时长
};
```

## 安全考虑

### 权限管理
1. **最小权限原则**: 只请求必要的照片访问权限
2. **权限状态检查**: 实时监控权限状态变化
3. **优雅降级**: 权限被拒绝时提供替代方案

### 数据安全
1. **本地存储**: 敏感数据仅存储在设备本地
2. **缓存清理**: 应用卸载时自动清理缓存
3. **删除确认**: 永久删除操作需要用户明确确认

### 性能安全
1. **内存监控**: 防止内存泄漏和溢出
2. **CPU限制**: 限制后台处理任务的CPU使用
3. **电池优化**: 优化动画和处理逻辑以节省电量