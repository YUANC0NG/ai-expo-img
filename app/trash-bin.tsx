import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Photo } from '../src/types/Photo';
import { useTrash } from '../src/contexts/TrashContext';
import TrashBin from '../src/components/trash/TrashBin';
import BatchOperations from '../src/components/trash/BatchOperations';
import LoadingSpinner from '../src/components/common/LoadingSpinner';
import { theme } from '../src/styles/theme';
import { commonStyles } from '../src/styles/common';

export default function TrashBinScreen() {
  const {
    trashedPhotos,
    selectedPhotos,
    isLoading,
    error,
    selectPhoto,
    deselectPhoto,
    selectAllPhotos,
    deselectAllPhotos,
    restoreFromTrash,
    removeFromTrash,
    getSelectedCount,
    getTotalCount,
  } = useTrash();

  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // 处理关闭
  const handleClose = useCallback(() => {
    router.back();
  }, []);

  // 处理照片点击
  const handlePhotoPress = useCallback((photo: Photo) => {
    if (!isSelectionMode) {
      // 进入选择模式
      setIsSelectionMode(true);
      selectPhoto(photo.id);
    }
  }, [isSelectionMode, selectPhoto]);

  // 处理照片长按
  const handlePhotoLongPress = useCallback((photo: Photo) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
    selectPhoto(photo.id);
  }, [isSelectionMode, selectPhoto]);

  // 处理全选
  const handleSelectAll = useCallback(() => {
    if (getSelectedCount() === getTotalCount()) {
      deselectAllPhotos();
    } else {
      selectAllPhotos();
    }
  }, [getSelectedCount, getTotalCount, deselectAllPhotos, selectAllPhotos]);

  // 处理恢复
  const handleRestore = useCallback(async () => {
    const selectedIds = Array.from(selectedPhotos);
    if (selectedIds.length === 0) return;

    try {
      await restoreFromTrash(selectedIds);
      setIsSelectionMode(false);
      Alert.alert('恢复成功', `已恢复 ${selectedIds.length} 张照片`);
    } catch (error) {
      Alert.alert('恢复失败', '无法恢复照片，请重试');
    }
  }, [selectedPhotos, restoreFromTrash]);

  // 处理永久删除
  const handlePermanentDelete = useCallback(() => {
    const selectedIds = Array.from(selectedPhotos);
    if (selectedIds.length === 0) return;

    Alert.alert(
      '永久删除',
      `确定要永久删除 ${selectedIds.length} 张照片吗？此操作无法撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromTrash(selectedIds);
              setIsSelectionMode(false);
              Alert.alert('删除成功', `已永久删除 ${selectedIds.length} 张照片`);
            } catch (error) {
              Alert.alert('删除失败', '无法删除照片，请重试');
            }
          },
        },
      ]
    );
  }, [selectedPhotos, removeFromTrash]);

  // 退出选择模式
  const handleExitSelection = useCallback(() => {
    setIsSelectionMode(false);
    deselectAllPhotos();
  }, [deselectAllPhotos]);

  // 渲染头部
  const renderHeader = () => {
    const selectedCount = getSelectedCount();
    const totalCount = getTotalCount();

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.headerButton} onPress={handleClose}>
            <Text style={styles.headerButtonText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isSelectionMode ? `已选择 ${selectedCount} 项` : '垃圾桶'}
          </Text>
          {!isSelectionMode && totalCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {totalCount} 张照片
            </Text>
          )}
        </View>

        <View style={styles.headerRight}>
          {totalCount > 0 && (
            <Pressable 
              style={styles.headerButton} 
              onPress={isSelectionMode ? handleExitSelection : () => setIsSelectionMode(true)}
            >
              <Text style={styles.headerButtonText}>
                {isSelectionMode ? '取消' : '选择'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  // 渲染批量操作组件
  const renderBatchOperations = () => (
    <BatchOperations
      selectedCount={getSelectedCount()}
      totalCount={getTotalCount()}
      onSelectAll={selectAllPhotos}
      onDeselectAll={deselectAllPhotos}
      onRestore={handleRestore}
      onDelete={handlePermanentDelete}
      onCancel={handleExitSelection}
      isVisible={isSelectionMode}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        {renderHeader()}
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        {renderHeader()}
        <View style={commonStyles.errorContainer}>
          <Text style={commonStyles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {renderHeader()}
      
      <TrashBin
        trashedPhotos={trashedPhotos}
        selectedPhotos={selectedPhotos}
        onPhotoPress={handlePhotoPress}
        onPhotoLongPress={handlePhotoLongPress}
        onSelectPhoto={selectPhoto}
        onDeselectPhoto={deselectPhoto}
        isSelectionMode={isSelectionMode}
      />

      {renderBatchOperations()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    minHeight: theme.layout.headerHeight,
  },
  headerLeft: {
    width: 60,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  headerButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  headerButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

});