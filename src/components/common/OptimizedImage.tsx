import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Photo } from '../../types/Photo';
import { PhotoUtils } from '../../utils/photoUtils';
import LoadingSpinner from './LoadingSpinner';

interface OptimizedImageProps {
  photo: Photo;
  width: number;
  height: number;
  style?: ViewStyle;
  onLoad?: () => void;
  onError?: (error: any) => void;
  priority?: 'high' | 'normal' | 'low';
  placeholder?: 'blur' | 'spinner' | 'none';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export default function OptimizedImage({
  photo,
  width,
  height,
  style,
  onLoad,
  onError,
  priority = 'normal',
  placeholder = 'blur',
  resizeMode = 'cover',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 计算显示尺寸，保持宽高比
  const displaySize = useMemo(() => {
    return PhotoUtils.getDisplaySize(photo, width, height);
  }, [photo, width, height]);

  // 选择合适的图片源
  const imageSource = useMemo(() => {
    // 如果有缩略图且尺寸较小，使用缩略图
    if (photo.thumbnailUri && (width <= 200 || height <= 200)) {
      return photo.thumbnailUri;
    }
    return photo.uri;
  }, [photo, width, height]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  }, [onError]);

  const containerStyle = useMemo(() => [
    styles.container,
    {
      width: displaySize.width,
      height: displaySize.height,
    },
    style,
  ], [displaySize, style]);

  const imageStyle = useMemo(() => [
    styles.image,
    {
      width: displaySize.width,
      height: displaySize.height,
    },
  ], [displaySize]);

  // 渲染占位符
  const renderPlaceholder = () => {
    if (placeholder === 'none') return null;
    
    if (placeholder === 'spinner') {
      return (
        <View style={[styles.placeholder, { width: displaySize.width, height: displaySize.height }]}>
          <LoadingSpinner size="small" />
        </View>
      );
    }

    // 默认模糊占位符
    return (
      <View style={[styles.placeholder, { width: displaySize.width, height: displaySize.height }]}>
        <View style={styles.blurPlaceholder} />
      </View>
    );
  };

  // 渲染错误状态
  const renderError = () => (
    <View style={[styles.errorContainer, { width: displaySize.width, height: displaySize.height }]}>
      <View style={styles.errorIcon}>
        <View style={styles.errorIconInner} />
      </View>
    </View>
  );

  if (hasError) {
    return renderError();
  }

  return (
    <View style={containerStyle}>
      {isLoading && renderPlaceholder()}
      <Image
        source={{ uri: imageSource }}
        style={imageStyle}
        contentFit={resizeMode}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="memory-disk"
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  blurPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconInner: {
    width: 20,
    height: 20,
    backgroundColor: '#999',
    borderRadius: 2,
  },
});