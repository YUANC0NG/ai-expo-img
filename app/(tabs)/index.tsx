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
}

const Card: React.FC<CardProps> = ({
  imageUrl,
  index,
  totalCards,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTop
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
  }, [isTop]);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;

      // 上滑删除
      if (translationY < -100 || velocityY < -500) {
        translateY.value = withTiming(-screenHeight, { duration: 300 }, () => {
          runOnJS(onSwipeUp)();
        });
        return;
      }

      // 左滑下一张
      if (translationX < -100 || velocityX < -500) {
        translateX.value = withTiming(-screenWidth, { duration: 300 }, () => {
          runOnJS(onSwipeLeft)();
        });
        return;
      }

      // 右滑上一张
      if (translationX > 100 || velocityX > 500) {
        translateX.value = withTiming(screenWidth, { duration: 300 }, () => {
          runOnJS(onSwipeRight)();
        });
        return;
      }

      // 回弹
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + offsetY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
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

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState(list);

  const resetCards = () => {
    setCards(list);
    setCurrentIndex(0);
  };

  const handleSwipeLeft = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSwipeUp = () => {
    const newCards = [...cards];
    newCards.splice(currentIndex, 1);
    setCards(newCards);

    if (currentIndex >= newCards.length && newCards.length > 0) {
      setCurrentIndex(newCards.length - 1);
    }
  };

  const visibleCards = cards.slice(currentIndex, currentIndex + 3);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>堆叠卡片 ({cards.length}张)</Text>
      <Text style={styles.instruction}>
        ← 左滑下一张 | 右滑上一张 → | ↑ 上滑删除
      </Text>

      <View style={styles.cardContainer}>
        {visibleCards.map((imageUrl, index) => (
          <Card
            key={`${currentIndex + index}-${imageUrl}`}
            imageUrl={imageUrl}
            index={index}
            totalCards={visibleCards.length}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            isTop={index === 0}
          />
        ))}
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
});
