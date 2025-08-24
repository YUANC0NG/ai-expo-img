import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { OptimizedImage } from './OptimizedImage';
import { useAdvancedPhotos, usePhotoSelection } from '../hooks/usePhotos';

export const AdvancedPhotoGallery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'creationTime' | 'modificationTime'>('creationTime');
  
  const {
    photos,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
  } = useAdvancedPhotos({
    pageSize: 20,
    searchQuery,
    sortBy,
    sortOrder: 'desc',
  });

  const {
    selectedPhotos,
    selectedCount,
    selectionMode,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
  } = usePhotoSelection();

  const handlePhotoPress = (photoId: string) => {
    if (selectionMode) {
      toggleSelection(photoId);
    } else {
      // 这里可以添加查看大图的逻辑
      Alert.alert('查看照片', `照片ID: ${photoId}`);
    }
  };

  const handleLongPress = (photoId: string) => {
    if (!selectionMode) {
      toggleSelectionMode();
      toggleSelection(photoId);
    }
  };

  const renderPhoto = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.photoContainer,
        isSelected(item.id) && styles.selectedPhoto,
      ]}
      onPress={() => handlePhotoPress(item.id)}
      onLongPress={() => handleLongPress(item.id)}
    >
      <OptimizedImage uri={item.uri} style={styles.photo} />
      {selectionMode && (
        <View style={styles.selectionOverlay}>
          {isSelected(item.id) && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>加载更多...</Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>错误: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={refresh}>
          <Text style={styles.buttonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索照片..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 工具栏 */}
      <View style={styles.toolbar}>
        <Text style={styles.countText}>
          {totalCount} 张照片 {selectedCount > 0 && `(已选择 ${selectedCount} 张)`}
        </Text>
        
        <View style={styles.toolbarButtons}>
          {selectionMode ? (
            <>
              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => selectAll(photos.map(p => p.id))}
              >
                <Text style={styles.toolButtonText}>全选</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolButton}
                onPress={clearSelection}
              >
                <Text style={styles.toolButtonText}>清除</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolButton}
                onPress={toggleSelectionMode}
              >
                <Text style={styles.toolButtonText}>取消</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.toolButton}
              onPress={toggleSelectionMode}
            >
              <Text style={styles.toolButtonText}>选择</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 排序选项 */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>排序:</Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'creationTime' && styles.activeSortButton,
          ]}
          onPress={() => setSortBy('creationTime')}
        >
          <Text style={styles.sortButtonText}>创建时间</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'modificationTime' && styles.activeSortButton,
          ]}
          onPress={() => setSortBy('modificationTime')}
        >
          <Text style={styles.sortButtonText}>修改时间</Text>
        </TouchableOpacity>
      </View>

      {/* 照片网格 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={renderPhoto}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.photoGrid}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countText: {
    fontSize: 16,
    color: '#333',
  },
  toolbarButtons: {
    flexDirection: 'row',
  },
  toolButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  toolButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  activeSortButton: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
  },
  photoGrid: {
    padding: 2,
  },
  photoContainer: {
    flex: 1,
    margin: 2,
    aspectRatio: 1,
    position: 'relative',
  },
  selectedPhoto: {
    opacity: 0.7,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  error: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});