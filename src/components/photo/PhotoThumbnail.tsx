import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Photo } from '../../types/Photo';
import OptimizedImage from '../common/OptimizedImage';
import { PhotoUtils } from '../../utils/photoUtils';

interface PhotoThumbnailProps {
  photo: Photo;
  size: number;
  onPress?: (photo: Photo) => void;
  onLongPress?: (photo: Photo) => void;
  selected?: boolean;
  showInfo?: boolean;
  borderRadius?: number;
}

function PhotoThumbnail({
  photo,
  size,
  onPress,
  onLongPress,
  selected = false,
  showInfo = false,
  borderRadius = 8,
}: PhotoThumbnailProps) {
  const handlePress = () => {
    onPress?.(photo);
  };

  const handleLongPress = () => {
    onLongPress?.(photo);
  };

  const isLandscape = PhotoUtils.isLandscape(photo);
  const aspectRatio = PhotoUtils.getAspectRatio(photo);

  return (
    <Pressable
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
        selected && styles.selected,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <OptimizedImage
        photo={photo}
        width={size}
        height={size}
        style={[styles.image, { borderRadius }]}
        resizeMode="cover"
        placeholder="blur"
        priority="normal"
      />
      
      {/* 选中状态指示器 */}
      {selected && (
        <View style={styles.selectedOverlay}>
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </View>
      )}

      {/* 照片信息 */}
      {showInfo && (
        <View style={styles.infoOverlay}>
          <Text style={styles.infoText} numberOfLines={1}>
            {photo.filename}
          </Text>
          <Text style={styles.infoSubtext}>
            {photo.width} × {photo.height}
          </Text>
        </View>
      )}

      {/* 视频标识 */}
      {photo.mediaType === 'video' && (
        <View style={styles.videoIndicator}>
          <Text style={styles.videoIcon}>▶</Text>
        </View>
      )}

      {/* 宽高比指示器（可选） */}
      {isLandscape && (
        <View style={styles.aspectRatioIndicator}>
          <View style={styles.landscapeIcon} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selected: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
  },
  infoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  infoSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 8,
  },
  videoIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    color: 'white',
    fontSize: 10,
  },
  aspectRatioIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  landscapeIcon: {
    width: 12,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
});

export default memo(PhotoThumbnail);