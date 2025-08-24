# 相册整理页面问题修复

## 修复的问题

### 1. 只有前四张能看到图片，后面的都是空白

**问题原因:**
- Card 组件的 key 值使用了 `photo.url`，但真实照片数据使用的是 `uri` 字段
- 当 `photo.url` 为 undefined 时，key 变成 `${index}-undefined`，导致 React 无法正确识别组件

**解决方案:**
```tsx
// 修复前
key={`${currentIndex + index}-${photo.url}`}

// 修复后
key={`${currentIndex + index}-${photo.id}`}
```

### 2. 垃圾桶里面点击删除后没有删除

**问题原因:**
- 多个地方使用 `photo.url` 来生成 photoId，但真实照片数据没有 `url` 字段
- 导致选择状态和实际照片数据不匹配

**解决方案:**
```tsx
// 修复前
const photoId = photo.id || `${index}-${photo.url}`;

// 修复后
const photoId = photo.id || `${index}-${photo.uri || photo.url}`;
```

## 具体修复内容

### 1. 修复 Card 组件的 key 值
- 使用 `photo.id` 作为 key 的一部分
- 确保每个卡片都有唯一且稳定的标识

### 2. 修复 photoId 生成逻辑
- 在所有使用 photoId 的地方优先使用 `photo.uri`
- 包括：`handleSelectAll`、`handleConfirmDelete`、`handleRestore`、`keyExtractor`

### 3. 添加数据转换验证
- 在 `convertPhotoAssetToPhotoItem` 中确保每个照片都有唯一 ID
- 添加调试信息来跟踪数据转换过程

### 4. 添加调试功能
- 在 StackedCards 组件中添加状态调试信息
- 创建 PhotoDataDebug 组件用于测试真实照片数据

## 调试工具

### PhotoDataDebug 组件
- 显示相册列表和照片数据
- 可以选择相册并测试滑动卡片功能
- 显示原始数据和转换后数据的对比

### 使用方法
1. 导航到 `/test-organize` 页面
2. 选择一个相册
3. 查看照片数据是否正确
4. 点击"测试滑动卡片"验证功能

## 数据流程

```
真实照片数据 (PhotoAsset)
    ↓ convertPhotoAssetToPhotoItem
转换后数据 (PhotoItem)
    ↓ StackedCards 组件
显示和交互
```

## 关键修复点

1. **唯一标识**: 确保每个照片都有唯一且稳定的 ID
2. **字段映射**: 正确处理 `uri` vs `url` 字段
3. **状态同步**: 确保选择状态和实际数据匹配
4. **错误处理**: 添加容错机制和调试信息

## 测试建议

1. 使用 PhotoDataDebug 组件测试数据转换
2. 验证所有照片都能正确显示
3. 测试删除和恢复功能
4. 检查垃圾桶操作是否正常

## 已知限制

1. 需要在真机上测试真实照片数据
2. 大量照片可能影响性能
3. 某些照片格式可能需要特殊处理

## 后续优化建议

1. 添加照片加载失败的占位图
2. 实现照片预加载机制
3. 优化大量照片的渲染性能
4. 添加照片元数据显示