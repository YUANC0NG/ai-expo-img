import { renderHook, act } from '@testing-library/react-hooks';
import { useBatchSelection } from '../useBatchSelection';

interface TestItem {
  id: string;
  name: string;
}

describe('useBatchSelection', () => {
  const testItems: TestItem[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  const getItemId = (item: TestItem) => item.id;
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty selection', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: testItems,
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.isSelectionMode).toBe(false);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isPartiallySelected).toBe(false);
  });

  it('should select and deselect items', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: testItems,
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    // 选择项目
    act(() => {
      result.current.selectItem('1');
    });

    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isItemSelected('1')).toBe(true);
    expect(result.current.isPartiallySelected).toBe(true);
    expect(mockOnSelectionChange).toHaveBeenCalledWith(new Set(['1']));

    // 取消选择项目
    act(() => {
      result.current.deselectItem('1');
    });

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isItemSelected('1')).toBe(false);
    expect(result.current.isPartiallySelected).toBe(false);
  });

  it('should toggle item selection', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: testItems,
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    // 切换选择（选中）
    act(() => {
      result.current.toggleItem('1');
    });

    expect(result.current.isItemSelected('1')).toBe(true);

    // 切换选择（取消选中）
    act(() => {
      result.current.toggleItem('1');
    });

    expect(result.current.isItemSelected('1')).toBe(false);
  });

  it('should select all and deselect all', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: testItems,
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    // 全选
    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedCount).toBe(3);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.isPartiallySelected).toBe(false);

    // 取消全选
    act(() => {
      result.current.deselectAll();
    });

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
  });

  it('should toggle select all correctly', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: testItems,
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    // 从无选择到全选
    act(() => {
      result.current.toggleSelectAll();
    });

    expect(result.current.isAllSelected).toBe(true);

    // 从全选到无选择
    act(() => {
      result.current.toggleSelectAll();
    });

    expect(result.current.selectedCount).toBe(0);
  });

  it('should enter and exit selection mode', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: testItems,
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    // 进入选择模式
    act(() => {
      result.current.enterSelectionMode('1');
    });

    expect(result.current.isSelectionMode).toBe(true);
    expect(result.current.isItemSelected('1')).toBe(true);

    // 退出选择模式
    act(() => {
      result.current.exitSelectionMode();
    });

    expect(result.current.isSelectionMode).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('should get selected items correctly', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: testItems,
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    // 选择一些项目
    act(() => {
      result.current.selectItem('1');
      result.current.selectItem('3');
    });

    const selectedItems = result.current.getSelectedItems(testItems, getItemId);
    
    expect(selectedItems).toHaveLength(2);
    expect(selectedItems[0].id).toBe('1');
    expect(selectedItems[1].id).toBe('3');
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() =>
      useBatchSelection({
        items: [],
        getItemId,
        onSelectionChange: mockOnSelectionChange,
      })
    );

    expect(result.current.totalCount).toBe(0);
    expect(result.current.isAllSelected).toBe(false);

    // 尝试全选空数组
    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedCount).toBe(0);
  });
});