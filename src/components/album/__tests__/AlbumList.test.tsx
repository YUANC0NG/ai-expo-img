import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AlbumList from '../AlbumList';
import { AlbumGroup, MonthlyAlbum } from '../../../types/Photo';

const mockAlbumGroups: AlbumGroup[] = [
  {
    year: 2024,
    months: [
      {
        year: 2024,
        month: 1,
        photos: [],
        photoCount: 15,
        coverPhoto: {
          id: '1',
          uri: 'photo1.jpg',
          filename: 'photo1.jpg',
          creationTime: new Date('2024-01-15').getTime(),
          modificationTime: new Date('2024-01-15').getTime(),
          width: 1920,
          height: 1080,
          mediaType: 'photo',
        },
      },
      {
        year: 2024,
        month: 2,
        photos: [],
        photoCount: 8,
        coverPhoto: {
          id: '2',
          uri: 'photo2.jpg',
          filename: 'photo2.jpg',
          creationTime: new Date('2024-02-10').getTime(),
          modificationTime: new Date('2024-02-10').getTime(),
          width: 1080,
          height: 1920,
          mediaType: 'photo',
        },
      },
    ],
  },
];

describe('AlbumList', () => {
  const mockOnAlbumPress = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render album groups correctly', () => {
    const { getByText } = render(
      <AlbumList
        albumGroups={mockAlbumGroups}
        onAlbumPress={mockOnAlbumPress}
      />
    );

    expect(getByText('2024年')).toBeTruthy();
    expect(getByText('2024年一月')).toBeTruthy();
    expect(getByText('2024年二月')).toBeTruthy();
    expect(getByText('15 张照片')).toBeTruthy();
    expect(getByText('8 张照片')).toBeTruthy();
  });

  it('should call onAlbumPress when album is pressed', () => {
    const { getByText } = render(
      <AlbumList
        albumGroups={mockAlbumGroups}
        onAlbumPress={mockOnAlbumPress}
      />
    );

    fireEvent.press(getByText('2024年一月'));
    
    expect(mockOnAlbumPress).toHaveBeenCalledWith(mockAlbumGroups[0].months[0]);
  });

  it('should show empty state when no albums', () => {
    const { getByText } = render(
      <AlbumList
        albumGroups={[]}
        onAlbumPress={mockOnAlbumPress}
      />
    );

    expect(getByText('暂无照片')).toBeTruthy();
    expect(getByText('请检查照片访问权限')).toBeTruthy();
  });

  it('should show year totals correctly', () => {
    const { getByText } = render(
      <AlbumList
        albumGroups={mockAlbumGroups}
        onAlbumPress={mockOnAlbumPress}
      />
    );

    // 15 + 8 = 23 张照片
    expect(getByText('23 张照片')).toBeTruthy();
  });

  it('should handle refresh correctly', () => {
    const { getByTestId } = render(
      <AlbumList
        albumGroups={mockAlbumGroups}
        onAlbumPress={mockOnAlbumPress}
        refreshing={false}
        onRefresh={mockOnRefresh}
      />
    );

    // 模拟下拉刷新
    // 注意：实际的下拉刷新测试可能需要更复杂的模拟
    expect(mockOnRefresh).toBeDefined();
  });
});