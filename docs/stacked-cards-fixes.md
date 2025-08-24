# StackedCards 组件问题修复

## 修复的问题

### 1. 照片无法正确显示

**问题原因:**
- StackedCards 组件期望的是 `url` 字段
- 真实照片数据使用的是 `uri` 字段
- 使用 React Native Image 组件无法处理 iOS 的 `ph://` 协议

**解决方案:**
- 更新 PhotoItem 接口，同时支持 `uri` 和 `url` 字段
- 使用 OptimizedImage 组件替代 React Native Image
- 在组件中优先使用 `uri`，向后兼容 `url`

```tsx
// 修复前
<Image source={{ uri: photo.url }} style={styles.cardImage} />

// 修复后
const imageUri = photo.uri || photo.url || '';
<OptimizedImage uri={imageUri} style={styles.cardImage} contentFit="cover" />
```

### 2. 上滑删除后无法滑动

**问题原因:**
- 删除照片后动画状态没有正确重置
- 手势检测器的状态管理有问题
- 卡片索引和动画状态不同步

**解决方案:**
- 在照片变化时重置动画状态
- 优化手势检测的回调处理
- 改进删除后的状态管理逻辑

```tsx
// 添加照片变化时的状态重置
React.useEffect(() => {
  translateX.value = 0;
  translateY.value = 0;
}, [photo.id]);

// 优化删除逻辑
const handleSwipeUp = () => {
  // ... 删除逻辑
  setSlideInCard(null); // 重置滑入卡片状态
  // ... 其他状态管理
};
```

## 数据格式转换

### PhotoAsset 到 PhotoItem 的转换

在 organize.tsx 中添加了数据格式转换函数：

```tsx
const convertPhotoAssetToPhotoItem = (asset: PhotoAsset): PhotoItem => {
  const date = new Date(asset.creationTime);
  return {
    id: asset.id,
    uri: asset.uri,
    filename: asset.filename,
    time: date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    title: asset.filename || '未命名照片',
    // ... 其他字段
  };
};
```

## 手势优化

### 改进的手势处理

```tsx
const panGesture = Gesture.Pan()
  .enabled(isTop)
  .onUpdate((event) => {
    // 限制右滑范围，避免意外触发
    if (event.translationX < 0) {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    } else {
      translateX.value = 0;
      translateY.value = event.translationY;
    }
  })
  .onEnd((event) => {
    // 使用 finished 参数确保动画完成后才执行回调
    translateY.value = withTiming(-screenHeight, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onSwipeUp)();
      }
    });
  });
```

## 测试组件

创建了 `StackedCardsTest` 组件用于测试修复效果：

- 提供测试用的照片数据
- 包含操作说明
- 支持重置和添加照片功能
- 实时显示当前状态

## 使用建议

1. **数据格式**: 确保传入的照片数据包含正确的 `uri` 字段
2. **权限检查**: 使用前确保已获取相册权限
3. **错误处理**: 添加适当的错误处理和加载状态
4. **性能优化**: 对于大量照片，考虑分页加载

## 调试技巧

1. 使用 `console.log` 查看照片数据格式
2. 检查 OptimizedImage 组件的加载状态
3. 监听手势事件的触发情况
4. 使用 StackedCardsTest 组件进行功能测试

## 已知限制

1. iOS 模拟器可能无法显示真实照片
2. 需要在真机上测试完整功能
3. 大量照片可能影响性能
4. 某些 Android 设备的手势响应可能不同