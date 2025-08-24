import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { OptimizedImage } from './OptimizedImage';

export const PhotoDebug: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('未知');
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const checkPermissions = async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setPermissionStatus(status);
      console.log('权限状态:', status);
    } catch (error) {
      console.error('检查权限失败:', error);
      setPermissionStatus('错误');
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);
      console.log('请求权限结果:', status);
      
      if (status === 'granted') {
        Alert.alert('成功', '相册权限已获取');
      } else {
        Alert.alert('失败', '未获取到相册权限');
      }
    } catch (error) {
      console.error('请求权限失败:', error);
      Alert.alert('错误', '请求权限时发生错误');
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      console.log('开始获取照片...');
      
      const { assets: photoAssets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: 'creationTime',
        first: 5, // 只获取5张照片用于测试
      });
      
      console.log('获取到照片数量:', photoAssets.length);
      photoAssets.forEach((asset, index) => {
        console.log(`照片 ${index + 1}:`, {
          id: asset.id,
          uri: asset.uri,
          filename: asset.filename,
          mediaType: asset.mediaType,
        });
      });
      
      setAssets(photoAssets);
    } catch (error) {
      console.error('获取照片失败:', error);
      Alert.alert('错误', '获取照片失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testAssetInfo = async (asset: MediaLibrary.Asset) => {
    try {
      console.log('获取照片详细信息:', asset.id);
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      console.log('照片详细信息:', assetInfo);
      
      Alert.alert(
        '照片信息',
        `ID: ${asset.id}\n原始URI: ${asset.uri}\n本地URI: ${assetInfo.localUri || '无'}\n文件名: ${asset.filename}`,
        [{ text: '确定' }]
      );
    } catch (error) {
      console.error('获取照片信息失败:', error);
      Alert.alert('错误', '获取照片信息失败');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>照片调试工具</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>权限状态</Text>
        <Text style={styles.status}>当前状态: {permissionStatus}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={checkPermissions}>
            <Text style={styles.buttonText}>检查权限</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>请求权限</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>照片测试</Text>
        <TouchableOpacity 
          style={[styles.button, styles.fullButton]} 
          onPress={loadPhotos}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '加载中...' : '获取照片'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.status}>照片数量: {assets.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>照片列表</Text>
        {assets.map((asset, index) => (
          <View key={asset.id} style={styles.photoItem}>
            <Text style={styles.photoTitle}>照片 {index + 1}</Text>
            <Text style={styles.photoUri} numberOfLines={2}>
              URI: {asset.uri}
            </Text>
            <Text style={styles.photoInfo}>
              {asset.filename} • {asset.mediaType}
            </Text>
            
            <View style={styles.imageContainer}>
              <OptimizedImage
                uri={asset.uri}
                style={styles.image}
                contentFit="cover"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => testAssetInfo(asset)}
            >
              <Text style={styles.infoButtonText}>查看详细信息</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullButton: {
    flex: 0,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  photoUri: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  photoInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});