import { useState, useCallback, useMemo } from 'react';

interface UseBatchSelectionProps<T> {
  items: T[];
  getItemId: (item: T) => string;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

interface UseBatchSelectionResult {
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelectAll: () => void;
  enterSelectionMode: (initialId?: string) => void;
  exitSelectionMode: () => void;
  isItemSelected: (id: string) => boolean;
  getSelectedItems: <T>(items: T[], getItemId: (item: T) => string) => T[];
}

export function useBatchSelection<T>({
  items,
  getItemId,
  onSelectionChange,
}: UseBatchSelectionProps<T>): UseBatchSelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // 计算统计信息
  const selectedCount = selectedIds.size;
  const totalCount = items.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  // 选择单个项目
  const selectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      onSelectionChange?.(newSet);
      return newSet;
    });
  }, [onSelectionChange]);

  // 取消选择单个项目
  const deselectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      onSelectionChange?.(newSet);
      return newSet;
    });
  }, [onSelectionChange]);

  // 切换单个项目选择状态
  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onSelectionChange?.(newSet);
      return newSet;
    });
  }, [onSelectionChange]);

  // 全选
  const selectAll = useCallback(() => {
    const allIds = new Set(items.map(getItemId));
    setSelectedIds(allIds);
    onSelectionChange?.(allIds);
  }, [items, getItemId, onSelectionChange]);

  // 取消全选
  const deselectAll = useCallback(() => {
    const emptySet = new Set<string>();
    setSelectedIds(emptySet);
    onSelectionChange?.(emptySet);
  }, [onSelectionChange]);

  // 切换全选状态
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, deselectAll]);

  // 进入选择模式
  const enterSelectionMode = useCallback((initialId?: string) => {
    setIsSelectionMode(true);
    if (initialId) {
      selectItem(initialId);
    }
  }, [selectItem]);

  // 退出选择模式
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    deselectAll();
  }, [deselectAll]);

  // 检查项目是否被选中
  const isItemSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // 获取选中的项目
  const getSelectedItems = useCallback(<T>(items: T[], getItemId: (item: T) => string): T[] => {
    return items.filter(item => selectedIds.has(getItemId(item)));
  }, [selectedIds]);

  return {
    selectedIds,
    isSelectionMode,
    selectedCount,
    totalCount,
    isAllSelected,
    isPartiallySelected,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    enterSelectionMode,
    exitSelectionMode,
    isItemSelected,
    getSelectedItems,
  };
}