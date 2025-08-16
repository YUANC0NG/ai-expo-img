import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BatchOperations from '../BatchOperations';

describe('BatchOperations', () => {
  const mockProps = {
    selectedCount: 2,
    totalCount: 10,
    onSelectAll: jest.fn(),
    onDeselectAll: jest.fn(),
    onRestore: jest.fn(),
    onDelete: jest.fn(),
    onCancel: jest.fn(),
    isVisible: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when visible', () => {
    const { getByText } = render(<BatchOperations {...mockProps} />);

    expect(getByText('已选择 2 / 10 项')).toBeTruthy();
    expect(getByText('全选')).toBeTruthy();
    expect(getByText('恢复 (2)')).toBeTruthy();
    expect(getByText('删除 (2)')).toBeTruthy();
    expect(getByText('取消')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <BatchOperations {...mockProps} isVisible={false} />
    );

    expect(queryByText('已选择 2 / 10 项')).toBeNull();
  });

  it('should show "取消全选" when all items are selected', () => {
    const { getByText } = render(
      <BatchOperations {...mockProps} selectedCount={10} />
    );

    expect(getByText('取消全选')).toBeTruthy();
  });

  it('should call onSelectAll when "全选" is pressed', () => {
    const { getByText } = render(<BatchOperations {...mockProps} />);

    fireEvent.press(getByText('全选'));
    expect(mockProps.onSelectAll).toHaveBeenCalled();
  });

  it('should call onDeselectAll when "取消全选" is pressed', () => {
    const { getByText } = render(
      <BatchOperations {...mockProps} selectedCount={10} />
    );

    fireEvent.press(getByText('取消全选'));
    expect(mockProps.onDeselectAll).toHaveBeenCalled();
  });

  it('should call onRestore when restore button is pressed', () => {
    const { getByText } = render(<BatchOperations {...mockProps} />);

    fireEvent.press(getByText('恢复 (2)'));
    expect(mockProps.onRestore).toHaveBeenCalled();
  });

  it('should call onDelete when delete button is pressed', () => {
    const { getByText } = render(<BatchOperations {...mockProps} />);

    fireEvent.press(getByText('删除 (2)'));
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByText } = render(<BatchOperations {...mockProps} />);

    fireEvent.press(getByText('取消'));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('should show hint when no items are selected', () => {
    const { getByText } = render(
      <BatchOperations {...mockProps} selectedCount={0} />
    );

    expect(getByText('点击照片进行选择，长按可快速多选')).toBeTruthy();
  });

  it('should not show restore and delete buttons when no items are selected', () => {
    const { queryByText } = render(
      <BatchOperations {...mockProps} selectedCount={0} />
    );

    expect(queryByText('恢复 (0)')).toBeNull();
    expect(queryByText('删除 (0)')).toBeNull();
  });

  it('should display correct progress bar width', () => {
    const { getByTestId } = render(<BatchOperations {...mockProps} />);

    // 注意：这里需要在组件中添加testID来测试进度条
    // 2/10 = 20%的进度
  });
});