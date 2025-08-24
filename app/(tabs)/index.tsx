import React, { useState } from 'react';
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
  withSpring,
  withTiming,
  runOnJS,
  interpolate
} from 'react-native-reanimated';

const list = [
  'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
  'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
  'https://storage.360buyimg.com/jdc-article/welcomenutui.jpg',
  'https://storage.360buyimg.com/jdc-article/fristfabu.jpg',
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.6;

interface CardProps {
  imageUrl: string;
  index: number;
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  isTop: boolean;
  currentIndex: number;
}

const Card: React.FC<CardProps> = ({
  imageUrl,
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

  // 重置动画值当卡片不是顶部时
  React.useEffect(() => {
    if (!isTop) {
      translateX.value = 0;
      translateY.value = 0;
    }
    // 使用更快的动画来减少卡顿
    scale.value = withTiming(1 - index * 0.05, { duration: 150 });
    offsetY.value = withTiming(index * 10, { duration: 150 });
  }, [isTop, index]);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      // 右滑时完全不移动卡片，只有左滑和上滑时才更新位置
      if (event.translationX < 0) {
        // 左滑：正常跟随手势
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      } else {
        // 右滑：卡片完全不动，只更新Y轴（用于上滑删除）
        translateX.value = 0;
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;

      // 上滑删除 - 优化动画时长和响应性
      if (translationY < -80 || velocityY < -400) {
        // 缩短动画时长，提高响应速度
        translateY.value = withTiming(-screenHeight, { duration: 200 }, () => {
          runOnJS(onSwipeUp)();
        });
        return;
      }

      // 左滑下一张
      if (translationX < -100 || velocityX < -500) {
        translateX.value = withTiming(-screenWidth, { duration: 250 }, () => {
          runOnJS(onSwipeLeft)();
        });
        return;
      }

      // 右滑上一张 - 检测右滑手势但不移动当前卡片
      if (translationX > 100 || velocityX > 500) {
        if (currentIndex > 0) {
          // 确保当前卡片保持在原位
          translateX.value = 0;
          translateY.value = 0;
          // 触发上一张卡片从左边滑入
          runOnJS(onSwipeRight)();
        } else {
          // 没有上一张，保持原位
          translateX.value = 0;
          translateY.value = 0;
        }
        return;
      }

      // 回弹 - 使用更快的动画
      translateX.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    // 只有左滑时才有旋转效果，右滑时完全不旋转
    const rotate = translateX.value < 0
      ? interpolate(translateX.value, [-200, 0], [-15, 0])
      : 0; // 右滑时不旋转

    // 上滑时添加轻微的缩放效果，但不要过度
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
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      </Animated.View>
    </GestureDetector>
  );
};

// 从左边滑入的卡片组件
const SlideInCard: React.FC<{ imageUrl: string; onComplete: () => void }> = ({ imageUrl, onComplete }) => {
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
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
    </Animated.View>
  );
};

// 空卡片组件
const EmptyCard: React.FC<{ onSwipeRight: () => void }> = ({ onSwipeRight }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 右滑时卡片保持不动，只检测手势
      translateX.value = 0;
      translateY.value = 0;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      // 右滑返回上一张 - 卡片保持不动，触发上一张卡片从左边滑入
      if (translationX > 100 || velocityX > 500) {
        // 空卡片保持在原位
        translateX.value = 0;
        translateY.value = 0;
        // 触发上一张卡片从左边滑入
        runOnJS(onSwipeRight)();
        return;
      }

      // 保持原位
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

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState(list);
  const [slideInCard, setSlideInCard] = useState<string | null>(null);
  const [showEmptyCard, setShowEmptyCard] = useState(false);

  const resetCards = () => {
    setCards(list);
    setCurrentIndex(0);
    setSlideInCard(null);
    setShowEmptyCard(false);
  };

  const handleSwipeLeft = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentIndex === cards.length - 1) {
      // 滑到最后一张时显示空卡片
      setShowEmptyCard(true);
    }
  };

  const handleSwipeRight = () => {
    if (showEmptyCard) {
      // 从空卡片返回到最后一张 - 显示从左边滑入的卡片
      setSlideInCard(cards[cards.length - 1]);
    } else if (currentIndex > 0) {
      // 显示从左边滑入的卡片
      setSlideInCard(cards[currentIndex - 1]);
    }
  };

  const handleSlideInComplete = () => {
    // 滑入动画完成后，更新索引并隐藏滑入卡片
    if (showEmptyCard) {
      // 从空卡片返回到最后一张
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
      // 所有卡片都被删除了，保持原有逻辑
      return;
    }

    if (isLastCard) {
      // 删除的是最后一张卡片，显示空白提示卡片
      setShowEmptyCard(true);
    } else if (currentIndex >= newCards.length) {
      // 删除后当前索引超出范围，跳到新的最后一张
      setCurrentIndex(newCards.length - 1);
    }
    // 如果删除的不是最后一张，currentIndex 保持不变，自动显示下一张
  };

  const visibleCards = cards.slice(currentIndex, currentIndex + 3);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        堆叠卡片 ({cards.length}张) {showEmptyCard ? '- 已滑完' : ''}
      </Text>
      <Text style={styles.instruction}>
        ← 左滑下一张 | 右滑上一张 → | ↑ 上滑删除
      </Text>

      <View style={styles.cardContainer}>
        {!showEmptyCard && visibleCards.map((imageUrl, index) => (
          <Card
            key={`${currentIndex + index}-${imageUrl}`}
            imageUrl={imageUrl}
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
            imageUrl={slideInCard}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
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
