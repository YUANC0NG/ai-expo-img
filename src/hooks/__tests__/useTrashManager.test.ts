import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTrashManager } from '../useTrashManager';
import { Photo } from '../../types/Photo';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock errorHandler
jest.mock('../../utils/errorHandler', () => ({
  errorHandler: {
    handleError: jest.fn((error) => ({ message: error.message })),
  },
}));

describe('useTrashManager', () => {
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

  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  it('should initialize with empty state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    expect(result.current.trashedPhotos).toEqual([]);
    expect(result.current.selectedPhotos.size).toBe(0);
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
  });

  it('should load existing trash data', async () => {
    const trashData = [
      {
        photo: mockPhoto,
        deletedAt: Date.now(),
      },
    ];

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(trashData));

    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    expect(result.current.trashedPhotos).toHaveLength(1);
    expect(result.current.trashedPhotos[0].photo.id).toBe(mockPhoto.id);
  });

  it('should add photo to trash', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    await act(async () => {
      await result.current.addToTrash(mockPhoto);
    });

    expect(result.current.trashedPhotos).toHaveLength(1);
    expect(result.current.trashedPhotos[0].photo.id).toBe(mockPhoto.id);
    expect(result.current.trashedPhotos[0].photo.isDeleted).toBe(true);
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should remove photo from trash', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    // 先添加照片
    await act(async () => {
      await result.current.addToTrash(mockPhoto);
    });

    expect(result.current.trashedPhotos).toHaveLength(1);

    // 然后移除照片
    await act(async () => {
      await result.current.removeFromTrash([mockPhoto.id]);
    });

    expect(result.current.trashedPhotos).toHaveLength(0);
  });

  it('should restore photo from trash', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    // 先添加照片
    await act(async () => {
      await result.current.addToTrash(mockPhoto);
    });

    expect(result.current.trashedPhotos).toHaveLength(1);

    // 然后恢复照片
    let restoredPhotos: Photo[] = [];
    await act(async () => {
      restoredPhotos = await result.current.restoreFromTrash([mockPhoto.id]);
    });

    expect(result.current.trashedPhotos).toHaveLength(0);
    expect(restoredPhotos).toHaveLength(1);
    expect(restoredPhotos[0].isDeleted).toBe(false);
  });

  it('should select and deselect photos', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    // 选择照片
    act(() => {
      result.current.selectPhoto(mockPhoto.id);
    });

    expect(result.current.selectedPhotos.has(mockPhoto.id)).toBe(true);
    expect(result.current.getSelectedCount()).toBe(1);
    expect(result.current.isPhotoSelected(mockPhoto.id)).toBe(true);

    // 取消选择照片
    act(() => {
      result.current.deselectPhoto(mockPhoto.id);
    });

    expect(result.current.selectedPhotos.has(mockPhoto.id)).toBe(false);
    expect(result.current.getSelectedCount()).toBe(0);
    expect(result.current.isPhotoSelected(mockPhoto.id)).toBe(false);
  });

  it('should toggle photo selection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    // 切换选择（选中）
    act(() => {
      result.current.togglePhotoSelection(mockPhoto.id);
    });

    expect(result.current.isPhotoSelected(mockPhoto.id)).toBe(true);

    // 切换选择（取消选中）
    act(() => {
      result.current.togglePhotoSelection(mockPhoto.id);
    });

    expect(result.current.isPhotoSelected(mockPhoto.id)).toBe(false);
  });

  it('should select all and deselect all photos', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    // 添加多张照片
    const photo2 = { ...mockPhoto, id: '2' };
    await act(async () => {
      await result.current.addToTrash(mockPhoto);
      await result.current.addToTrash(photo2);
    });

    // 全选
    act(() => {
      result.current.selectAllPhotos();
    });

    expect(result.current.getSelectedCount()).toBe(2);
    expect(result.current.isPhotoSelected(mockPhoto.id)).toBe(true);
    expect(result.current.isPhotoSelected(photo2.id)).toBe(true);

    // 取消全选
    act(() => {
      result.current.deselectAllPhotos();
    });

    expect(result.current.getSelectedCount()).toBe(0);
    expect(result.current.isPhotoSelected(mockPhoto.id)).toBe(false);
    expect(result.current.isPhotoSelected(photo2.id)).toBe(false);
  });

  it('should clear trash', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    // 添加照片
    await act(async () => {
      await result.current.addToTrash(mockPhoto);
    });

    expect(result.current.trashedPhotos).toHaveLength(1);

    // 清空垃圾桶
    await act(async () => {
      await result.current.clearTrash();
    });

    expect(result.current.trashedPhotos).toHaveLength(0);
    expect(result.current.selectedPhotos.size).toBe(0);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
  });

  it('should filter expired items on load', async () => {
    const now = Date.now();
    const expiredTime = now - (31 * 24 * 60 * 60 * 1000); // 31天前
    const validTime = now - (1 * 24 * 60 * 60 * 1000); // 1天前

    const trashData = [
      {
        photo: { ...mockPhoto, id: '1' },
        deletedAt: expiredTime, // 过期
      },
      {
        photo: { ...mockPhoto, id: '2' },
        deletedAt: validTime, // 有效
      },
    ];

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(trashData));

    const { result, waitForNextUpdate } = renderHook(() => useTrashManager());

    await waitForNextUpdate();

    // 应该只有1个有效项目
    expect(result.current.trashedPhotos).toHaveLength(1);
    expect(result.current.trashedPhotos[0].photo.id).toBe('2');
    
    // 应该更新存储以移除过期项目
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });
});