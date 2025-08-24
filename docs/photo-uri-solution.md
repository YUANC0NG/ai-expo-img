# iOS 照片 URI 问题解决方案

## 问题描述

在 iOS 设备上，`expo-media-library` 返回的照片 URI 使用 `ph://` 协议，这种 URI 无法直接在 React Native 的 `Image` 组件中使用，会导致以下错误：

```
No suitable URL request handler found for ph://5128E54F-171F-46B2-847E-7599045449A3/L0/001
```

## 解决方案

### 1. 使用 expo-image 替代 React Native Image

`expo-image` 组件能够更好地处理各种 URI 格式，包括 iOS 的 `ph://` 协议。

```tsx
import { Image } from 'expo-image';

// 替代 React Native 的 Image
<Image 
  source={{ uri: photoUri }} 
  style={styles.image}
  contentFit="cover"
  cachePolicy="memory-disk"
/>
```

### 2. 配置权限

在 `app.json` 中添加 media-library 插件配置：

```json
{
  "plugins": [
    [
      "expo-media-library",
      {
        "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
        "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
        "isAccessMediaLocationEnabled": true
      }
    ]
  ]
}
```

### 3. 优化的图片组件

创建了 `OptimizedImage` 组件来处理各种情况：

```tsx
import { OptimizedImage } from './components/OptimizedImage';

<OptimizedImage 
  uri={photo.uri}
  style={styles.photo}
  contentFit="cover"
/>
```

### 4. 备选方案：URI 转换

如果需要获取本地文件路径，可以使用 `getAssetInfoAsync`：

```tsx
const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
const localUri = assetInfo.localUri || asset.uri;
```

但这种方法会增加加载时间，建议直接使用 `expo-image`。

## 实现的组件

### MediaLibraryService
- 简化的照片获取服务
- 直接使用原始 URI，让 expo-image 处理

### OptimizedImage
- 基于 expo-image 的优化图片组件
- 支持缓存和加载状态

### PhotoDebug
- 调试工具，帮助诊断权限和 URI 问题

### 自定义 Hooks
- `usePhotos`: 完整的照片管理
- `usePhotosList`: 简化的照片列表
- `useMonthlyAlbums`: 按月分组的相册

## 使用建议

1. **优先使用 expo-image**: 它能处理更多 URI 格式
2. **避免不必要的 URI 转换**: 直接使用原始 URI 性能更好
3. **正确配置权限**: 确保 app.json 中有正确的权限配置
4. **使用调试工具**: PhotoDebug 组件可以帮助诊断问题

## 测试步骤

1. 使用 PhotoDebug 组件检查权限状态
2. 获取少量照片进行测试
3. 查看照片 URI 格式和详细信息
4. 验证图片是否能正确显示

## 注意事项

- iOS 模拟器可能没有照片，需要在真机上测试
- 确保应用有相册访问权限
- expo-image 需要正确安装和配置
- 大量照片加载时注意性能优化