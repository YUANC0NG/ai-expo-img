import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.6;

export interface PhotoItem {
  url: string;
  time: string;
  title: string;
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
    if (!isTop) {
      translateX.value = 0;
      translateY.value = 0;
    }
    scale.value = withTiming(1 - index * 0.05, { duration: 150 });
    offsetY.value = withTiming(index * 10, { duration: 150 });
  }, [isTop, index]);

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

      if (translationY < -80 || velocityY < -400) {
        translateY.value = withTiming(-screenHeight, { duration: 200 }, () => {
          runOnJS(onSwipeUp)();
        });
        return;
      }

      if (translationX < -100 || velocityX < -500) {
        translateX.value = withTiming(-screenWidth, { duration: 250 }, () => {
          runOnJS(onSwipeLeft)();
        });
        return;
      }

      if (translationX > 100 || velocityX > 500) {
        if (currentIndex > 0) {
          translateX.value = 0;
          translateY.value = 0;
          runOnJS(onSwipeRight)();
        } else {
          translateX.value = 0;
          translateY.value = 0;
        }
        return;
      }

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

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: photo.url }} style={styles.cardImage} />
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

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Image source={{ uri: photo.url }} style={styles.cardImage} />
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

  // 当外部数据或初始索引变化时重置组件状态
  useEffect(() => {
    setCards(data);
    setCurrentIndex(initialIndex);
    setSlideInCard(null);
    setShowEmptyCard(false);
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
    const isLastCard = currentIndex === cards.length - 1;

    newCards.splice(currentIndex, 1);
    setCards(newCards);

    if (newCards.length === 0) {
      return;
    }

    if (isLastCard) {
      setShowEmptyCard(true);
    } else if (currentIndex >= newCards.length) {
      setCurrentIndex(newCards.length - 1);
    }
  };

  const visibleCards = cards.slice(currentIndex, currentIndex + 3);
  const currentPhoto = showEmptyCard ? null : cards[currentIndex];

  return (
    <View style={[styles.container, style]}>
      {showTopBar && (
        <View style={styles.topBar}>
          <View style={styles.photoInfo}>
            <Text>
              ({showEmptyCard ? `${cards.length}/${cards.length}` : `${currentIndex + 1}/${cards.length}`})
              <Text>{currentPhoto?.time}</Text>
            </Text>
          </View>
        </View>
      )}

      <View style={styles.cardContainer}>
        {!showEmptyCard && visibleCards.map((photo, index) => (
          <Card
            key={`${currentIndex + index}-${photo.url}`}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  photoInfo: {
    alignItems: 'center',
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
});