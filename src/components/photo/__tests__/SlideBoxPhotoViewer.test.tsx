import React from 'react';
import { render } from '@testing-library/react-native';
import SlideBoxPhotoViewer from '../SlideBoxPhotoViewer';
import { Photo } from '../../../types/Photo';

const mockPhotos: Photo[] = [
  {
    id: '1',
    uri: 'photo1.jpg',
    filename: 'photo1.jpg',
    creationTime: Date.now(),
    modificationTime: Date.now(),
    width: 1920,
    height: 1080,
    mediaType: 'photo',
  },
  {
    id: '2',
    uri: 'photo2.jpg',
    filename: 'photo2.jpg',
    creationTime: Date.now(),
    modificationTime: Date.now(),
    width: 1080,
    height: 1920,
    mediaType: 'photo',
  },
];

describe('SlideBoxPhotoViewer', () => {
  const mockProps = {
    photos: mockPhotos,
    initialIndex: 0,
    onIndexChange: jest.fn(),
    onSwipeUp: jest.fn(),
    enableSwipeUp: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with photos', () => {
    const { getByText } = render(<SlideBoxPhotoViewer {...mockProps} />);
    
    expect(getByText('1 / 2')).toBeTruthy();
  });

  it('should render empty state when no photos', () => {
    const { getByText } = render(
      <SlideBoxPhotoViewer {...mockProps} photos={[]} />
    );
    
    expect(getByText('没有照片')).toBeTruthy();
  });

  it('should show trash indicator when swipe up is enabled', () => {
    const { getByText } = render(<SlideBoxPhotoViewer {...mockProps} />);
    
    expect(getByText('🗑️')).toBeTruthy();
  });

  it('should not show trash indicator when swipe up is disabled', () => {
    const { queryByText } = render(
      <SlideBoxPhotoViewer {...mockProps} enableSwipeUp={false} />
    );
    
    expect(queryByText('🗑️')).toBeNull();
  });
});