# 照片获取自定义 Hooks 使用指南

## 概述

这个项目提供了多个自定义 hooks 来处理照片获取和管理功能，基于 Expo MediaLibrary。

## 可用的 Hooks

### 1. `usePhotos` - 完整功能 Hook

提供照片和相册的完整功能，包括权限管理。

```tsx
import { usePhotos } from '../hooks/usePhotos';

const MyComponent = () => {
  const { 
    photos, 
    albums, 
    loading, 
    error, 
    hasPermission, 
    refreshPhotos, 
    requestPermissions 
  } = usePhotos();

  // 使用数据...
};
```

**返回值:**
- `photos`: 所有照片数组
- `albums`: 按月分组的相册数组
- `loading`: 加载状态
- `error`: 错误信息
- `hasPermission`: 是否有权限
- `refreshPhotos`: 刷新照片数据
- `requestPermissions`: 请求权限

### 2. `usePhotosList` - 简化版本

只获取照片列表，适合简单场景。

```tsx
import { usePhotosList } from '../hooks/usePhotos';

const SimpleGallery = () => {
  const { photos, loading, error, refetch } = usePhotosList();
  
  // 渲染照片列表...
};
```

### 3. `useMonthlyAlbums` - 月度相册

只获取按月分组的相册数据。

```tsx
import { useMonthlyAlbums } from '../hooks/usePhotos';

const AlbumsView = () => {
  const { albums, loading, error, refetch } = useMonthlyAlbums();
  
  // 渲染相册...
};
```

### 4. `useAdvancedPhotos` - 高级功能

支持分页、搜索、排序等高级功能。

```tsx
import { useAdvancedPhotos } from '../hooks/usePhotos';

const AdvancedGallery = () => {
  const {
    photos,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    loadMore,
    refresh,
  } = useAdvancedPhotos({
    pageSize: 20,
    searchQuery: 'vacation',
    sortBy: 'creationTime',
    sortOrder: 'desc'
  });
  
  // 渲染带分页的照片列表...
};
```

**选项参数:**
- `pageSize`: 每页照片数量 (默认: 20)
- `searchQuery`: 搜索关键词
- `sortBy`: 排序字段 ('creationTime' | 'modificationTime')
- `sortOrder`: 排序顺序 ('asc' | 'desc')

### 5. `usePhotoSelection` - 照片选择

管理照片选择状态，适合批量操作。

```tsx
import { usePhotoSelection } from '../hooks/usePhotos';

const SelectableGallery = () => {
  const {
    selectedPhotos,
    selectedCount,
    selectionMode,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
  } = usePhotoSelection();
  
  // 处理照片选择...
};
```

## 使用示例

### 基础照片展示

```tsx
import React from 'react';
import { View, FlatList, Image } from 'react-native';
import { usePhotosList } from '../hooks/usePhotos';

export const BasicGallery = () => {
  const { photos, loading, error } = usePhotosList();

  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error}</Text>;

  return (
    <FlatList
      data={photos}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Image 
          source={{ uri: item.uri }} 
          style={{ width: 100, height: 100, margin: 2 }} 
        />
      )}
    />
  );
};
```

### 带搜索的照片列表

```tsx
import React, { useState } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import { useAdvancedPhotos } from '../hooks/usePhotos';

export const SearchableGallery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { photos, loading } = useAdvancedPhotos({
    searchQuery,
    pageSize: 30,
  });

  return (
    <View>
      <TextInput
        placeholder="搜索照片..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={photos}
        // ... 其他属性
      />
    </View>
  );
};
```

### 可选择的照片网格

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { usePhotosList, usePhotoSelection } from '../hooks/usePhotos';

export const SelectableGallery = () => {
  const { photos } = usePhotosList();
  const { 
    selectionMode, 
    isSelected, 
    toggleSelection, 
    toggleSelectionMode 
  } = usePhotoSelection();

  return (
    <View>
      <TouchableOpacity onPress={toggleSelectionMode}>
        <Text>{selectionMode ? '取消选择' : '选择照片'}</Text>
      </TouchableOpacity>
      
      <FlatList
        data={photos}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => selectionMode && toggleSelection(item.id)}
            style={[
              styles.photo,
              isSelected(item.id) && styles.selected
            ]}
          >
            <Image source={{ uri: item.uri }} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
```

## 权限处理

所有 hooks 都会自动处理权限请求，但你也可以手动控制：

```tsx
const { hasPermission, requestPermissions } = usePhotos();

if (!hasPermission) {
  return (
    <View>
      <Text>需要相册权限</Text>
      <Button title="授权" onPress={requestPermissions} />
    </View>
  );
}
```

## 错误处理

每个 hook 都提供错误状态：

```tsx
const { error, refresh } = usePhotosList();

if (error) {
  return (
    <View>
      <Text>加载失败: {error}</Text>
      <Button title="重试" onPress={refresh} />
    </View>
  );
}
```

## 性能优化建议

1. **使用合适的 hook**: 根据需求选择最简单的 hook
2. **分页加载**: 对于大量照片使用 `useAdvancedPhotos` 的分页功能
3. **图片缓存**: 使用 React Native 的图片缓存机制
4. **虚拟化列表**: 对于长列表使用 `VirtualizedList` 或 `FlatList`

## 注意事项

1. 确保在 `app.json` 中配置了相册权限
2. iOS 需要在 `Info.plist` 中添加权限描述
3. Android 需要在 `AndroidManifest.xml` 中添加权限
4. 测试时注意权限状态的变化