import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StackedCards, PhotoItem } from '../../components/StackedCards';

const list: PhotoItem[] = [
  {
    id: '1',
    url: 'https://storage.360buyimg.com/jdc-article/NutUItaro34.jpg',
    time: '2024-01-15 14:30',
    title: '美丽风景'
  },
  {
    id: '2',
    url: 'https://storage.360buyimg.com/jdc-article/NutUItaro2.jpg',
    time: '2024-01-16 09:15',
    title: '城市夜景'
  },
  {
    id: '3',
    url: 'https://storage.360buyimg.com/jdc-article/welcomenutui.jpg',
    time: '2024-01-17 16:45',
    title: '欢迎界面'
  },
  {
    id: '4',
    url: 'https://storage.360buyimg.com/jdc-article/fristfabu.jpg',
    time: '2024-01-18 11:20',
    title: '首次发布'
  },
];

export default function HomeScreen() {
  const handleIndexChange = (index: number) => {
    console.log('当前索引:', index);
  };

  const handleReset = () => {
    console.log('卡片已重置');
  };

  return (
    <View style={styles.container}>
      <StackedCards 
        data={list}
        initialIndex={0}
        onIndexChange={handleIndexChange}
        onReset={handleReset}
        showTopBar={true}
        style={styles.stackedCards}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  stackedCards: {
    flex: 1,
  },
});
