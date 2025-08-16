import React, { useMemo, useCallback } from 'react';
import { FlatList, ListRenderItem, ViewStyle, RefreshControl } from 'react-native';
import { PERFORMANCE_CONFIG } from '../../utils/constants';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  numColumns?: number;
  horizontal?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  getItemLayout?: (data: T[] | null | undefined, index: number) => {
    length: number;
    offset: number;
    index: number;
  };
  estimatedItemSize?: number;
}

export default function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  numColumns = 1,
  horizontal = false,
  style,
  contentContainerStyle,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  getItemLayout,
  estimatedItemSize,
}: VirtualizedListProps<T>) {
  
  // 性能优化配置
  const performanceProps = useMemo(() => ({
    initialNumToRender: PERFORMANCE_CONFIG.VIRTUALIZATION.initialNumToRender,
    maxToRenderPerBatch: PERFORMANCE_CONFIG.VIRTUALIZATION.maxToRenderPerBatch,
    updateCellsBatchingPeriod: PERFORMANCE_CONFIG.VIRTUALIZATION.updateCellsBatchingPeriod,
    windowSize: PERFORMANCE_CONFIG.VIRTUALIZATION.windowSize,
    removeClippedSubviews: true,
    scrollEventThrottle: 16,
  }), []);

  // 自动计算item布局（如果提供了estimatedItemSize）
  const autoGetItemLayout = useCallback((
    data: T[] | null | undefined,
    index: number
  ) => {
    if (!estimatedItemSize) return undefined;
    
    return {
      length: estimatedItemSize,
      offset: estimatedItemSize * index,
      index,
    };
  }, [estimatedItemSize]);

  // 渲染刷新控件
  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;
    
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="#007AFF"
        colors={['#007AFF']}
      />
    );
  }, [refreshing, onRefresh]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      horizontal={horizontal}
      style={style}
      contentContainerStyle={contentContainerStyle}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={refreshControl}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      getItemLayout={getItemLayout || autoGetItemLayout}
      {...performanceProps}
    />
  );
}