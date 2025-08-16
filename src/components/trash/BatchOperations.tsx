import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface BatchOperationsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export default function BatchOperations({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onRestore,
  onDelete,
  onCancel,
  isVisible,
}: BatchOperationsProps) {
  const translateY = useSharedValue(isVisible ? 0 : 100);
  const opacity = useSharedValue(isVisible ? 1 : 0);

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // 更新动画状态
  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(100, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, translateY, opacity]);

  // 计算选择状态
  const selectionState = useMemo(() => {
    if (selectedCount === 0) return 'none';
    if (selectedCount === totalCount) return 'all';
    return 'partial';
  }, [selectedCount, totalCount]);

  // 处理全选/取消全选
  const handleToggleSelectAll = () => {
    if (selectionState === 'all') {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* 选择状态指示器 */}
      <View style={styles.selectionIndicator}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            已选择 {selectedCount} / {totalCount} 项
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(selectedCount / totalCount) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* 操作按钮组 */}
      <View style={styles.actionsContainer}>
        {/* 左侧：全选/取消全选 */}
        <Pressable 
          style={[styles.actionButton, styles.selectAllButton]} 
          onPress={handleToggleSelectAll}
        >
          <Text style={styles.selectAllButtonText}>
            {selectionState === 'all' ? '取消全选' : '全选'}
          </Text>
        </Pressable>

        {/* 右侧：主要操作 */}
        <View style={styles.mainActions}>
          <Pressable 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </Pressable>

          {selectedCount > 0 && (
            <>
              <Pressable 
                style={[styles.actionButton, styles.restoreButton]} 
                onPress={onRestore}
              >
                <Text style={styles.restoreButtonText}>
                  恢复 ({selectedCount})
                </Text>
              </Pressable>

              <Pressable 
                style={[styles.actionButton, styles.deleteButton]} 
                onPress={onDelete}
              >
                <Text style={styles.deleteButtonText}>
                  删除 ({selectedCount})
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* 快捷操作提示 */}
      {selectedCount === 0 && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            点击照片进行选择，长按可快速多选
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  selectionIndicator: {
    marginBottom: theme.spacing.sm,
  },
  selectionInfo: {
    alignItems: 'center',
  },
  selectionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.base,
    minWidth: 60,
    alignItems: 'center',
  },
  selectAllButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectAllButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  mainActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  restoreButton: {
    backgroundColor: theme.colors.primary,
  },
  restoreButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.white,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  deleteButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.white,
  },
  hintContainer: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  hintText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});