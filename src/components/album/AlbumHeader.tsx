import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../styles/theme';

interface AlbumHeaderProps {
  title: string;
  subtitle?: string;
  onTrashPress?: () => void;
  trashCount?: number;
  showTrash?: boolean;
}

export default function AlbumHeader({
  title,
  subtitle,
  onTrashPress,
  trashCount = 0,
  showTrash = true,
}: AlbumHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      
      {showTrash && (
        <Pressable
          style={[
            styles.trashButton,
            trashCount > 0 && styles.trashButtonActive
          ]}
          onPress={onTrashPress}
          android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
        >
          <View style={styles.trashIcon}>
            <Text style={[
              styles.trashIconText,
              trashCount > 0 && styles.trashIconTextActive
            ]}>
              🗑️
            </Text>
          </View>
          
          {trashCount > 0 && (
            <View style={styles.trashBadge}>
              <Text style={styles.trashBadgeText}>
                {trashCount > 99 ? '99+' : trashCount.toString()}
              </Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    minHeight: theme.layout.headerHeight,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  trashButton: {
    position: 'relative',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  trashIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashIconText: {
    fontSize: 20,
  },
  trashIconTextActive: {
    // 可以添加激活状态的样式
  },
  trashBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  trashBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
});