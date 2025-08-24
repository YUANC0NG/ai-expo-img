import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export interface PhotoAsset {
    id: string;
    uri: string;
    filename: string;
    creationTime: number;
    modificationTime: number;
    mediaType: string;
    width: number;
    height: number;
}

export interface AlbumMonth {
    id: string;
    month: string;
    year: number;
    photoCount: number;
    coverImage: string;
    photos: PhotoAsset[];
}

class MediaLibraryService {
    private hasPermission = false;

    // 请求相册权限
    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            this.hasPermission = status === 'granted';

            if (!this.hasPermission) {
                Alert.alert(
                    '需要相册权限',
                    '请在设置中允许访问相册，以便查看和整理您的照片',
                    [
                        { text: '取消', style: 'cancel' },
                        { text: '去设置', onPress: () => MediaLibrary.requestPermissionsAsync() }
                    ]
                );
            }

            return this.hasPermission;
        } catch (error) {
            console.error('请求权限失败:', error);
            return false;
        }
    }

    // 获取所有照片 - 简化版本，直接使用原始 URI
    async getAllPhotos(): Promise<PhotoAsset[]> {
        if (!this.hasPermission) {
            const granted = await this.requestPermissions();
            if (!granted) return [];
        }

        try {
            const { assets } = await MediaLibrary.getAssetsAsync({
                mediaType: 'photo',
                sortBy: 'creationTime',
                first: 1000, // 获取最近1000张照片
            });

            // 直接使用原始 URI，让 expo-image 处理
            return assets.map(asset => ({
                id: asset.id,
                uri: asset.uri, // 直接使用原始 URI
                filename: asset.filename,
                creationTime: asset.creationTime,
                modificationTime: asset.modificationTime,
                mediaType: asset.mediaType,
                width: asset.width,
                height: asset.height,
            }));
        } catch (error) {
            console.error('获取照片失败:', error);
            return [];
        }
    }

    // 按月分组照片
    groupPhotosByMonth(photos: PhotoAsset[]): AlbumMonth[] {
        const monthGroups: { [key: string]: PhotoAsset[] } = {};

        photos.forEach(photo => {
            const date = new Date(photo.creationTime);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const key = `${year}-${month.toString().padStart(2, '0')}`;

            if (!monthGroups[key]) {
                monthGroups[key] = [];
            }
            monthGroups[key].push(photo);
        });

        // 转换为AlbumMonth格式并按时间倒序排列
        const albums: AlbumMonth[] = Object.entries(monthGroups)
            .map(([key, photos]) => {
                const [year, month] = key.split('-');
                const monthNames = [
                    '1月', '2月', '3月', '4月', '5月', '6月',
                    '7月', '8月', '9月', '10月', '11月', '12月'
                ];

                return {
                    id: key,
                    month: monthNames[parseInt(month) - 1],
                    year: parseInt(year),
                    photoCount: photos.length,
                    coverImage: photos[0]?.uri || '',
                    photos: photos.sort((a, b) => b.creationTime - a.creationTime),
                };
            })
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]);
            });

        return albums;
    }

    // 获取按月分组的相册数据
    async getMonthlyAlbums(): Promise<AlbumMonth[]> {
        const photos = await this.getAllPhotos();
        return this.groupPhotosByMonth(photos);
    }
}

export const mediaLibraryService = new MediaLibraryService();