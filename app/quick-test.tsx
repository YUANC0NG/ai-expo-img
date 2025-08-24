import React from 'react';
import { StyleSheet, View } from 'react-native';
import { QuickTest } from '../components/QuickTest';

export default function QuickTestScreen() {
  return (
    <View style={styles.container}>
      <QuickTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});