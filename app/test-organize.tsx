import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PhotoDataDebug } from '../components/PhotoDataDebug';

export default function TestOrganizeScreen() {
  return (
    <View style={styles.container}>
      <PhotoDataDebug />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});