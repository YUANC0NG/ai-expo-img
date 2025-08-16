export interface Photo {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  modificationTime: number;
  width: number;
  height: number;
  mediaType: 'photo' | 'video';
  albumId?: string;
  isDeleted?: boolean;
  thumbnailUri?: string;
}

export interface Album {
  id: string;
  title: string;
  assetCount: number;
  startTime: number;
  endTime: number;
  photos: Photo[];
  coverPhoto?: Photo;
}

export interface MonthlyAlbum {
  year: number;
  month: number;
  photos: Photo[];
  photoCount: number;
  coverPhoto: Photo;
}

export interface AlbumGroup {
  year: number;
  months: MonthlyAlbum[];
}