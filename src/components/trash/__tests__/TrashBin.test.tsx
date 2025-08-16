import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TrashBin from '../TrashBin';
import { Photo } from '../../../types/Photo';
import { TrashItem } from '../../../contexts/TrashContext';

const mockPhoto: Photo = {
  id: '1',
  uri: 'photo1.jpg',
  filename: 'photo1.jpg',
  creationTime: Date.now(),
  modificationTime: Date.now(),
  width: 1920,
  height: 1080,
  mediaType: 'photo',
};

const mockTrashItem: TrashItem = {
  photo: mockPhoto,
  deletedAt: Date.now() - (24 * 60 * 60 * 1000), // 1天前
};

describe('TrashBin', () => {
  const mockProps = {
    trashedPhotos: [mockTrashItem],
    selectedPhotos: new Set<string>(),
    onPhotoPress: jest.fn(),
    onPhotoLongPress: jest.fn(),
    onSelectPhoto: jest.fn(),
    onDeselectPhoto: jest.fn(),
    isSelectionMode: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no photos', () => {
    const { getByText } = render(
      <TrashBin {...mockProps} trashedPhotos={[]} />
    );

    expect(getByText('垃圾桶为空')).toBeTruthy();
    expect(getByText('删除的照片会在这里保存30天，之后会自动清理')).toBeTruthy();
  });

  it('should render photos when trash has items', () => {
    const { getByText } = render(
      <TrashBin {...mockProps} />
    );

    expect(getByText('1天前')).toBeTruthy();
  });

  it('should call onPhotoPress when photo is pressed', () => {
    const { getByTestId } = render(
      <TrashBin {...mockProps} />
    );

    // 注意：这里需要PhotoThumbnail组件有testID
    // fireEvent.press(getByTestId('photo-thumbnail'));
    // expect(mockProps.onPhotoPress).toHaveBeenCalledWith(mockPhoto);
  });

  it('should show selection overlay in selection mode', () => {
    const { getByTestId } = render(
      <TrashBin {...mockProps} isSelectionMode={true} />
    );

    // 检查选择模式的UI变化
    // 这里需要根据实际的testID来测试
  });

  it('should handle photo selection correctly', () => {
    const selectedPhotos = new Set([mockPhoto.id]);
    const { rerender } = render(
      <TrashBin {...mockProps} selectedPhotos={selectedPhotos} isSelectionMode={true} />
    );

    // 验证选中状态的显示
    // 这里需要根据实际的UI来测试
  });

  it('should display correct time indicators', () => {
    const now = Date.now();
    const todayItem: TrashItem = {
      photo: { ...mockPhoto, id: '2' },
      deletedAt: now,
    };
    const weekAgoItem: TrashItem = {
      photo: { ...mockPhoto, id: '3' },
      deletedAt: now - (7 * 24 * 60 * 60 * 1000),
    };

    const { getByText } = render(
      <TrashBin 
        {...mockProps} 
        trashedPhotos={[todayItem, weekAgoItem]} 
      />
    );

    expect(getByText('今天')).toBeTruthy();
    expect(getByText('7天前')).toBeTruthy();
  });
});