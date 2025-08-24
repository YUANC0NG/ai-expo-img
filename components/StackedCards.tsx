import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Alert
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate
} from 'react-native-reanimated';
import { OptimizedImage } from './OptimizedImage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.6;

export interface PhotoItem {
  id: string;
  uri?: string; // 真实照片的 URI
  url?: string; // 网络图片的 URL，保持向后兼容
  filename?: string;
  time: string;
  title: string;
  creationTime?: number;
  modificationTime?: number;
  mediaType?: string;
  width?: number;
  height?: number;
}

interface CardProps {
  photo: PhotoItem;
  index: number;
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  isTop: boolean;
  currentIndex: number;
}

const Card: React.FC<CardProps> = ({
  photo,
  index,
  totalCards,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTop,
  currentIndex,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1 - index * 0.05);
  const offsetY = useSharedValue(index * 10);

  React.useEffect(() => {
    // 重置动画状态
    if (!isTop) {
      translateX.value = 0;
      translateY.value = 0;
    }
    scale.value = withTiming(1 - index * 0.05, { duration: 150 });
    offsetY.value = withTiming(index * 10, { duration: 150 });
  }, [isTop, index]);

  // 当照片变化时重置动画状态
  React.useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [photo.id]);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      } else {
        translateX.value = 0;
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;

      // 上滑删除
      if (translationY < -80 || velocityY < -400) {
        translateY.value = withTiming(-screenHeight, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(onSwipeUp)();
          }
        });
        return;
      }

      // 左滑下一张
      if (translationX < -100 || velocityX < -500) {
        translateX.value = withTiming(-screenWidth, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(onSwipeLeft)();
          }
        });
        return;
      }

      // 右滑上一张
      if (translationX > 100 || velocityX > 500) {
        if (currentIndex > 0) {
          translateX.value = withTiming(0, { duration: 200 });
          translateY.value = withTiming(0, { duration: 200 });
          runOnJS(onSwipeRight)();
        } else {
          translateX.value = withTiming(0, { duration: 200 });
          translateY.value = withTiming(0, { duration: 200 });
        }
        return;
      }

      // 回弹
      translateX.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = translateX.value < 0
      ? interpolate(translateX.value, [-200, 0], [-15, 0])
      : 0;

    const swipeUpScale = translateY.value < 0
      ? interpolate(translateY.value, [-100, 0], [0.95, 1], 'clamp')
      : 1;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + offsetY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value * swipeUpScale },
      ],
      zIndex: totalCards - index,
    };
  });

  // 获取图片 URI，优先使用 uri，然后是 url
  const imageUri = photo.uri || photo.url || '';

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <OptimizedImage uri={imageUri} style={styles.cardImage} contentFit="cover" />
      </Animated.View>
    </GestureDetector>
  );
};

const SlideInCard: React.FC<{ photo: PhotoItem; onComplete: () => void }> = ({ photo, onComplete }) => {
  const translateX = useSharedValue(-screenWidth);

  React.useEffect(() => {
    translateX.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onComplete)();
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    zIndex: 100,
  }));

  const imageUri = photo.uri || photo.url || '';

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <OptimizedImage uri={imageUri} style={styles.cardImage} contentFit="cover" />
    </Animated.View>
  );
};

const EmptyCard: React.FC<{ onSwipeRight: () => void }> = ({ onSwipeRight }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate(() => {
      translateX.value = 0;
      translateY.value = 0;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      if (translationX > 100 || velocityX > 500) {
        translateX.value = 0;
        translateY.value = 0;
        runOnJS(onSwipeRight)();
        return;
      }

      translateX.value = 0;
      translateY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    zIndex: 100,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, styles.emptyCard, animatedStyle]}>
        <View style={styles.emptyCardContent}>
          <Text style={styles.emptyCardTitle}>🎉 已经滑完了！</Text>
          <Text style={styles.emptyCardSubtitle}>向右滑动返回上一张</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

interface StackedCardsProps {
  data: PhotoItem[];
  initialIndex?: number;
  onReset?: () => void;
  onIndexChange?: (index: number) => void;
  showTopBar?: boolean;
  style?: any;
}

export const StackedCards: React.FC<StackedCardsProps> = ({
  data,
  initialIndex = 0,
  onReset,
  onIndexChange,
  showTopBar = true,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [cards, setCards] = useState(data);
  const [slideInCard, setSlideInCard] = useState<PhotoItem | null>(null);
  const [showEmptyCard, setShowEmptyCard] = useState(false);
  const [deletedPhotos, setDeletedPhotos] = useState<PhotoItem[]>([]);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [showGridModal, setShowGridModal] = useState(false);

  // 当外部数据或初始索引变化时重置组件状态
  useEffect(() => {
    setCards(data);
    setCurrentIndex(initialIndex);
    setSlideInCard(null);
    setShowEmptyCard(false);
    setDeletedPhotos([]);
    setSelectedPhotos(new Set());
    setShowGridModal(false);
  }, [data, initialIndex]);

  // 当索引变化时通知外部
  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  const resetCards = () => {
    setCards(data);
    setCurrentIndex(initialIndex);
    setSlideInCard(null);
    setShowEmptyCard(false);
    setDeletedPhotos([]);
    setSelectedPhotos(new Set());
    setShowGridModal(false);
    onReset?.();
  };

  const handleSwipeLeft = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentIndex === cards.length - 1) {
      setShowEmptyCard(true);
    }
  };

  const handleSwipeRight = () => {
    if (showEmptyCard) {
      setSlideInCard(cards[cards.length - 1]);
    } else if (currentIndex > 0) {
      setSlideInCard(cards[currentIndex - 1]);
    }
  };

  const handleSlideInComplete = () => {
    if (showEmptyCard) {
      setShowEmptyCard(false);
      setCurrentIndex(cards.length - 1);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
    setSlideInCard(null);
  };

  const handleSwipeUp = () => {
    const newCards = [...cards];
    const deletedPhoto = newCards[currentIndex];
    const isLastCard = currentIndex === cards.length - 1;

    // 添加到待删除列表
    setDeletedPhotos(prev => [...prev, deletedPhoto]);

    newCards.splice(currentIndex, 1);
    setCards(newCards);

    // 重置滑入卡片状态
    setSlideInCard(null);

    if (newCards.length === 0) {
      // 所有卡片都被删除
      setShowEmptyCard(false);
      return;
    }

    if (isLastCard) {
      // 如果删除的是最后一张卡片，显示空卡片
      setShowEmptyCard(true);
    } else if (currentIndex >= newCards.length) {
      // 如果当前索引超出范围，调整到最后一张
      setCurrentIndex(newCards.length - 1);
    }
    // 如果删除的不是最后一张，保持当前索引不变，会自动显示下一张
  };

  // 垃圾桶相关功能
  const handleTrashPress = () => {
    setShowTrashModal(true);
  };

  // 宫格相关功能
  const handleGridPress = () => {
    setShowGridModal(true);
  };

  const handlePhotoNavigation = (index: number) => {
    setCurrentIndex(index);
    setShowEmptyCard(false);
    setShowGridModal(false);
  };

  const handlePhotoSelect = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === deletedPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      const allIds = new Set(deletedPhotos.map((photo, index) => photo.id || `${index}-${photo.uri || photo.url}`));
      setSelectedPhotos(allIds);
    }
  };

  const handleConfirmDelete = () => {
    Alert.alert(
      '确认删除',
      `确定要永久删除选中的 ${selectedPhotos.size} 张图片吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const newDeletedPhotos = deletedPhotos.filter((photo, index) => {
              const photoId = photo.id || `${index}-${photo.uri || photo.url}`;
              return !selectedPhotos.has(photoId);
            });
            setDeletedPhotos(newDeletedPhotos);
            setSelectedPhotos(new Set());

            // 如果删除后垃圾桶为空，关闭弹窗
            if (newDeletedPhotos.length === 0) {
              setShowTrashModal(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      '确认删除全部',
      `确定要永久删除全部 ${deletedPhotos.length} 张图片吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除全部',
          style: 'destructive',
          onPress: () => {
            setDeletedPhotos([]);
            setSelectedPhotos(new Set());
            // 关闭垃圾桶弹窗
            setShowTrashModal(false);
          }
        }
      ]
    );
  };

  const handleRestore = () => {
    const photosToRestore = deletedPhotos.filter((photo, index) => {
      const photoId = photo.id || `${index}-${photo.uri || photo.url}`;
      return selectedPhotos.has(photoId);
    });

    const remainingDeleted = deletedPhotos.filter((photo, index) => {
      const photoId = photo.id || `${index}-${photo.uri || photo.url}`;
      return !selectedPhotos.has(photoId);
    });

    // 恢复到卡片列表
    const newCards = [...cards, ...photosToRestore];
    setCards(newCards);
    setDeletedPhotos(remainingDeleted);
    setSelectedPhotos(new Set());

    // 如果当前显示空白卡片且恢复了照片，跳转到最后一张有效卡片
    if (showEmptyCard && photosToRestore.length > 0) {
      setShowEmptyCard(false);
      setCurrentIndex(newCards.length - 1);
    }

    // 关闭垃圾桶弹窗
    setShowTrashModal(false);
  };

  const visibleCards = cards.slice(currentIndex, currentIndex + 3);
  const currentPhoto = showEmptyCard ? null : cards[currentIndex];

  return (
    <View style={[styles.container, style]}>
      {/* 标题栏 */}
      {showTopBar && (
        <View style={styles.topBar}>
          {/* 宫格按钮 */}
          <TouchableOpacity style={styles.gridButton} onPress={handleGridPress}>
            <Text style={styles.gridIcon}>⊞</Text>
          </TouchableOpacity>

          <View style={styles.photoInfo}>
            <Text>
              ({showEmptyCard ? `${cards.length}/${cards.length}` : `${currentIndex + 1}/${cards.length}`})
              <Text>{currentPhoto?.time}</Text>
            </Text>
          </View>

          {/* 垃圾桶按钮 */}
          <TouchableOpacity style={styles.trashButton} onPress={handleTrashPress}>
            <Text style={styles.trashIcon}>🗑️</Text>
            {deletedPhotos.length > 0 && (
              <View style={styles.trashBadge}>
                <Text style={styles.trashBadgeText}>{deletedPhotos.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.cardContainer}>
        {!showEmptyCard && visibleCards.map((photo, index) => (
          <Card
            key={`${currentIndex + index}-${photo.id}`}
            photo={photo}
            index={index}
            totalCards={visibleCards.length}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            isTop={index === 0 && !slideInCard}
            currentIndex={currentIndex}
          />
        ))}

        {showEmptyCard && (
          <EmptyCard onSwipeRight={handleSwipeRight} />
        )}

        {slideInCard && (
          <SlideInCard
            photo={slideInCard}
            onComplete={handleSlideInComplete}
          />
        )}
      </View>

      {cards.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>所有卡片已删除</Text>
          <Text style={styles.resetButton} onPress={resetCards}>
            点击重置
          </Text>
        </View>
      )}

      {/* 垃圾桶模态框 */}
      <Modal
        visible={showTrashModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTrashModal(false)}>
              <Text style={styles.modalCloseButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>待删除图片 ({deletedPhotos.length})</Text>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={styles.modalSelectAllButton}>
                {selectedPhotos.size === deletedPhotos.length ? '取消全选' : '全选'}
              </Text>
            </TouchableOpacity>
          </View>

          {deletedPhotos.length === 0 ? (
            <View style={styles.emptyTrashContainer}>
              <Text style={styles.emptyTrashText}>垃圾桶为空</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={deletedPhotos}
                numColumns={3}
                keyExtractor={(item, index) => item.id || `${index}-${item.uri || item.url}`}
                renderItem={({ item, index }) => {
                  const photoId = item.id || `${index}-${item.uri || item.url}`;
                  const isSelected = selectedPhotos.has(photoId);

                  return (
                    <TouchableOpacity
                      style={styles.gridItem}
                      onPress={() => handlePhotoSelect(photoId)}
                    >
                      <OptimizedImage uri={item.uri || item.url || ''} style={styles.gridImage} contentFit="cover" />
                      <View style={[styles.selectOverlay, isSelected && styles.selectedOverlay]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.gridItemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.gridContainer}
              />

              {/* 底部操作按钮 */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.footerButton, styles.restoreButton]}
                  onPress={handleRestore}
                  disabled={selectedPhotos.size === 0}
                >
                  <Text style={[styles.footerButtonText, selectedPhotos.size === 0 && styles.disabledText]}>
                    恢复 ({selectedPhotos.size})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.footerButton, styles.deleteButton]}
                  onPress={handleConfirmDelete}
                  disabled={selectedPhotos.size === 0}
                >
                  <Text style={[styles.footerButtonText, styles.deleteButtonText, selectedPhotos.size === 0 && styles.disabledText]}>
                    确认删除 ({selectedPhotos.size})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.footerButton, styles.deleteAllButton]}
                  onPress={handleDeleteAll}
                  disabled={deletedPhotos.length === 0}
                >
                  <Text style={[styles.footerButtonText, styles.deleteButtonText]}>
                    删除全部
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* 宫格模态框 */}
      <Modal
        visible={showGridModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGridModal(false)}>
              <Text style={styles.modalCloseButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>所有照片 ({cards.length})</Text>
            <View style={styles.placeholder} />
          </View>

          {cards.length === 0 ? (
            <View style={styles.emptyTrashContainer}>
              <Text style={styles.emptyTrashText}>暂无照片</Text>
            </View>
          ) : (
            <FlatList
              data={cards}
              numColumns={3}
              keyExtractor={(item, index) => item.id || `${index}-${item.uri || item.url}`}
              renderItem={({ item, index }) => {
                const isCurrentPhoto = index === currentIndex;

                return (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => handlePhotoNavigation(index)}
                  >
                    <OptimizedImage uri={item.uri || item.url || ''} style={styles.gridImage} contentFit="cover" />
                    {isCurrentPhoto && (
                      <View style={styles.currentPhotoOverlay}>
                        <Text style={styles.currentPhotoIndicator}>●</Text>
                      </View>
                    )}
                    <Text style={styles.gridItemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.gridItemIndex}>{index + 1}</Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.gridContainer}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 5,
  },
  photoInfo: {
    flex: 1,
    alignItems: 'center',
  },
  gridButton: {
    padding: 8,
  },
  gridIcon: {
    fontSize: 24,
    color: '#007AFF',
  },
  trashButton: {
    position: 'relative',
    padding: 8,
  },
  trashIcon: {
    fontSize: 24,
  },
  trashBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  resetButton: {
    fontSize: 16,
    color: '#007AFF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyCardSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  // 模态框样式
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSelectAllButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  emptyTrashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTrashText: {
    fontSize: 18,
    color: '#999',
  },
  gridContainer: {
    padding: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    maxWidth: (screenWidth - 40) / 3,
    minWidth: (screenWidth - 40) / 3 - 10,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  selectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOverlay: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
  checkmark: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  gridItemTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  restoreButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteAllButton: {
    backgroundColor: '#FF9500',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  deleteButtonText: {
    color: 'white',
  },
  disabledText: {
    color: '#999',
  },
  placeholder: {
    width: 40,
  },
  currentPhotoOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPhotoIndicator: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridItemIndex: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 16,
    textAlign: 'center',
  },
});