import React from 'react';
import { Image } from 'expo-image';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface OptimizedImageProps {
  uri: string;
  style?: any;
  placeholder?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  transition?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  placeholder,
  contentFit = 'cover',
  transition = 200,
}) => {
  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      placeholder={placeholder}
      contentFit={contentFit}
      transition={transition}
      cachePolicy="memory-disk"
      recyclingKey={uri}
    />
  );
};

// 带加载状态的图片组件
export const OptimizedImageWithLoader: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  placeholder,
  contentFit = 'cover',
  transition = 200,
}) => {
  const [loading, setLoading] = React.useState(true);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri }}
        style={styles.image}
        placeholder={placeholder}
        contentFit={contentFit}
        transition={transition}
        cachePolicy="memory-disk"
        recyclingKey={uri}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});