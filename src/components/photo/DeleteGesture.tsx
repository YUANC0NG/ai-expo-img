import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface DeleteGestureProps {
  children: React.ReactNode;
  enabled?: boolean;
  onDelete?: () => void;
}

export default function DeleteGesture({
  children,
  enabled = true,
}: DeleteGestureProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.gestureContainer}>
        {children}
      </View>
      
      {/* 删除指示器 - 固定显示垃圾桶图标 */}
      <View style={styles.deleteIndicator}>
        <View style={styles.deleteIcon}>
          <View style={styles.deleteIconInner} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
  deleteIndicator: {
    position: 'absolute',
    top: theme.spacing.xl + 40, // 调整位置避免与状态栏重叠
    right: theme.spacing.xl,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.base,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconInner: {
    width: 14,
    height: 2,
    backgroundColor: theme.colors.white,
    borderRadius: 1,
  },
});