import { BlurView } from 'expo-blur'
import { StyleSheet, Platform, View } from 'react-native'

export default function TabBarBackground() {
  // Web 端使用普通 View
  if (Platform.OS === 'web') {
    return (
      <View 
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
        ]} 
      />
    )
  }

  // 移动端使用 BlurView
  return <BlurView tint="systemChromeMaterial" intensity={100} style={StyleSheet.absoluteFill} />
}