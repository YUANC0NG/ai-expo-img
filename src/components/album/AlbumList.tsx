import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlbumGroup, MonthlyAlbum } from '../../types/Photo';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/common';
import PhotoThumbnail from '../photo/PhotoThumbnail';
import VirtualizedList from '../common/VirtualizedList';

interface AlbumListProps {
  albumGroups: AlbumGroup[];
  onAlbumPress: (album: MonthlyAlbum) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

interface AlbumItemProps {
  album: MonthlyAlbum;
  onPress: (album: MonthlyAlbum) => void;
}

const AlbumItem = memo(({ album, onPress }: AlbumItemProps) => {
  const handlePress = () => {
    onPress(album);
  };

  const getMonthName = (month: number): string => {
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return monthNames[month - 1] || '未知月份';
  };

  return (
    <Pressable
      style={styles.albumItem}
      onPress={handlePress}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <View style={styles.albumCover}>
        {album.coverPhoto && (
          <PhotoThumbnail
            photo={album.coverPhoto}
            size={80}
            borderRadius={theme.borderRadius.base}
          />
        )}
      </View>
      
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle}>
          {album.year}年{getMonthName(album.month)}
        </Text>
        <Text style={styles.albumSubtitle}>
          {album.photoCount} 张照片
        </Text>
      </View>
      
      <View style={styles.albumArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </Pressable>
  );
});

interface YearSectionProps {
  year: number;
  albums: MonthlyAlbum[];
  onAlbumPress: (album: MonthlyAlbum) => void;
}

const YearSection = memo(({ year, albums, onAlbumPress }: YearSectionProps) => {
  const totalPhotos = albums.reduce((sum, album) => sum + album.photoCount, 0);

  return (
    <View style={styles.yearSection}>
      <View style={styles.yearHeader}>
        <Text style={styles.yearTitle}>{year}年</Text>
        <Text style={styles.yearSubtitle}>{totalPhotos} 张照片</Text>
      </View>
      
      {albums.map((album) => (
        <AlbumItem
          key={`${album.year}-${album.month}`}
          album={album}
          onPress={onAlbumPress}
        />
      ))}
    </View>
  );
});

export default function AlbumList({
  albumGroups,
  onAlbumPress,
  refreshing = false,
  onRefresh,
}: AlbumListProps) {
  const renderYearSection = ({ item }: { item: AlbumGroup }) => (
    <YearSection
      year={item.year}
      albums={item.months}
      onAlbumPress={onAlbumPress}
    />
  );

  const keyExtractor = (item: AlbumGroup) => item.year.toString();

  if (albumGroups.length === 0) {
    return (
      <View style={commonStyles.emptyContainer}>
        <Text style={commonStyles.emptyText}>
          暂无照片
        </Text>
        <Text style={[commonStyles.emptyText, { marginTop: theme.spacing.xs }]}>
          请检查照片访问权限
        </Text>
      </View>
    );
  }

  return (
    <VirtualizedList
      data={albumGroups}
      renderItem={renderYearSection}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshing={refreshing}
      onRefresh={onRefresh}
      estimatedItemSize={200}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.base,
  },
  yearSection: {
    marginBottom: theme.spacing.lg,
  },
  yearHeader: {
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  yearTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  yearSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  albumCover: {
    marginRight: theme.spacing.sm,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  albumSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  albumArrow: {
    marginLeft: theme.spacing.sm,
  },
  arrowText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textTertiary,
  },
});