import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import { Photo } from '../../types/Photo';
import { TrashItem } from '../../contexts/TrashContext';
import PhotoThumbnail from '../photo/PhotoThumbnail';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/common';

interface TrashBinProps {
  trashedPhotos: TrashItem[];
  selectedPhotos: Set<string>;
  onPhotoPress: (photo: Photo) => void;
  onPhotoLongPress: (photo: Photo) => void;
  onSelectPhoto: (photoId: string) => void;
  onDeselectPhoto: (photoId: string) => void;
  isSelectionMode?: boolean;
}

export default function TrashBin({
  trashedPhotos,
  selectedPhotos,
  onPhotoPress,
  onPhotoLongPress,
  onSelectPhoto,
  onDeselectPhoto,
  isSelectionMode = false,
}: TrashBinProps) {
  const [itemDimension, setItemDimension] = useState(120);

  // 处理照片点击
  const handlePhotoPress = useCallback((photo: Photo) => {
    if (isSelectionMode) {
      if (selectedPhotos.has(photo.id)) {
        onDeselectPhoto(photo.id);
      } else {
        onSelectPhoto(photo.id);
      }
    } else {
      onPhotoPress(photo);
    }
  }, [isSelectionMode, selectedPhotos, onSelectPhoto, onDeselectPhoto, onPhotoPress]);

  // 处理照片长按
  const handlePhotoLongPress = useCallback((photo: Photo) => {
    onPhotoLongPress(photo);
  }, [onPhotoLongPress]);

  // 渲染单个照片项
  const renderPhotoItem = useCallback(({ item }: { item: TrashItem }) => {
    const isSelected = selectedPhotos.has(item.photo.id);
    const daysSinceDeleted = Math.floor((Date.now() - item.deletedAt) / (1000 * 60 * 60 * 24));

    return (
      <View style={styles.photoItemContainer}>
        <PhotoThumbnail
          photo={item.photo}
          size={itemDimension}
          onPress={handlePhotoPress}
          onLongPress={handlePhotoLongPress}
          selected={isSelected}
          borderRadius={theme.borderRadius.base}
        />
        
        {/* 删除时间指示器 */}
        <View style={styles.timeIndicator}>
          <Text style={styles.timeText}>
            {daysSinceDeleted === 0 ? '今天' : `${daysSinceDeleted}天前`}
          </Text>
        </View>

        {/* 选择模式下的遮罩 */}
        {isSelectionMode && (
          <View style={[styles.selectionOverlay, isSelected && styles.selectedOverlay]} />
        )}
      </View>
    );
  }, [itemDimension, selectedPhotos, handlePhotoPress, handlePhotoLongPress, isSelectionMode]);

  // 渲染空状态
  const renderEmptyState = () => (
    <View style={commonStyles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>🗑️</Text>
      </View>
      <Text style={styles.emptyTitle}>垃圾桶为空</Text>
      <Text style={styles.emptyMessage}>
        删除的照片会在这里保存30天，之后会自动清理
      </Text>
    </View>
  );

  // 计算网格布局
  const onLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    const spacing = theme.spacing.xs;
    const padding = theme.spacing.base * 2;
    const availableWidth = width - padding;
    const minItemWidth = 100;
    const itemsPerRow = Math.floor(availableWidth / (minItemWidth + spacing));
    const newItemDimension = (availableWidth - (spacing * (itemsPerRow - 1))) / itemsPerRow;
    setItemDimension(newItemDimension);
  }, []);

  if (trashedPhotos.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <FlatGrid
        itemDimension={itemDimension}
        data={trashedPhotos}
        style={styles.grid}
        spacing={theme.spacing.xs}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.photo.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    padding: theme.spacing.base,
  },
  photoItemContainer: {
    position: 'relative',
  },
  timeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    textAlign: 'center',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.base,
  },
  selectedOverlay: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    paddingHorizontal: theme.spacing.lg,
  },
});