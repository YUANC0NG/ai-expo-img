import React, { useState } from 'react';
import { StyleSheet, Dimensions, PanResponder, Animated, Image } from 'react-native';
import { ThemedView } from './ThemedView';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250;

interface CardProps {
  imageUrl: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  zIndex: number;
  scale: Animated.Value;
  opacity: Animated.Value;
}

const Card: React.FC<CardProps> = ({ 
  imageUrl, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  zIndex, 
  scale, 
  opacity 
}) => {
  const pan = useState(new Animated.ValueXY())[0];
  const screenHeight = Dimensions.get('window').height;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -SWIPE_THRESHOLD) {
        // 上滑删除
        onSwipeUp?.();
        Animated.timing(pan, {
          toValue: { x: 0, y: -screenHeight },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: false
        }).start();
      } else if (gesture.dx > SWIPE_THRESHOLD) {
        // 右滑
        onSwipeRight?.();
        Animated.timing(pan, {
          toValue: { x: width, y: 0 },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: false
        }).start();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // 左滑
        onSwipeLeft?.();
        Animated.timing(pan, {
          toValue: { x: -width, y: 0 },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: false
        }).start();
      } else {
        // 回到原位
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
      }
    }
  });

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate },
      { scale: scale }
    ],
    opacity
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        animatedStyle,
        { zIndex }
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
};

interface SwipeableCardStackProps {
  data: string[];
  onCardRemoved?: (index: number) => void;
}


const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({ 
  data, 
  onCardRemoved 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (direction === 'up') {
      onCardRemoved?.(currentIndex);
    }
    setCurrentIndex(prev => Math.min(prev + 1, data.length - 1));
  };

  const getCardProps = (index: number) => {
    const position = index - currentIndex;
    if (position < 0) return null;

    const scale = new Animated.Value(1 - position * 0.05);
    const opacity = new Animated.Value(1 - position * 0.2);

    return {
      zIndex: data.length - position,
      scale,
      opacity
    };
  };

  return (
    <ThemedView style={styles.container}>
      {data.map((imageUrl, index) => {
        const props = getCardProps(index);
        if (!props || index < currentIndex) return null;

        return (
          <Card
            key={index}
            imageUrl={imageUrl}
            onSwipeLeft={() => handleSwipe('left')}
            onSwipeRight={() => handleSwipe('right')}
            onSwipeUp={() => handleSwipe('up')}
            {...props}
          />
        );
      })}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default SwipeableCardStack;