import React, { createContext, useContext, ReactNode } from 'react';
import { useTrashManager } from '../hooks/useTrashManager';
import { Photo } from '../types/Photo';

interface TrashItem {
  photo: Photo;
  deletedAt: number;
  originalIndex?: number;
}

interface TrashContextType {
  trashedPhotos: TrashItem[];
  selectedPhotos: Set<string>;
  isLoading: boolean;
  error: string | null;
  addToTrash: (photo: Photo, originalIndex?: number) => Promise<void>;
  removeFromTrash: (photoIds: string[]) => Promise<void>;
  restoreFromTrash: (photoIds: string[]) => Promise<Photo[]>;
  clearTrash: () => Promise<void>;
  selectPhoto: (photoId: string) => void;
  deselectPhoto: (photoId: string) => void;
  selectAllPhotos: () => void;
  deselectAllPhotos: () => void;
  togglePhotoSelection: (photoId: string) => void;
  getSelectedCount: () => number;
  getTotalCount: () => number;
  isPhotoSelected: (photoId: string) => boolean;
  loadTrash: () => Promise<void>;
}

const TrashContext = createContext<TrashContextType | undefined>(undefined);

interface TrashProviderProps {
  children: ReactNode;
}

export function TrashProvider({ children }: TrashProviderProps) {
  const trashManager = useTrashManager();

  return (
    <TrashContext.Provider value={trashManager}>
      {children}
    </TrashContext.Provider>
  );
}

export function useTrash(): TrashContextType {
  const context = useContext(TrashContext);
  if (context === undefined) {
    throw new Error('useTrash must be used within a TrashProvider');
  }
  return context;
}

// 导出类型供其他组件使用
export type { TrashItem, TrashContextType };