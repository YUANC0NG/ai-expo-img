import { Platform, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// 统一使用 Ionicons，支持所有平台
const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'house.fill': 'home',
  'person.fill': 'person',
  'gear': 'settings-outline',
  'creditcard': 'card-outline',
  'envelope': 'mail-outline',
  'info.circle': 'information-circle-outline',
  'chevron.right': 'chevron-forward',
}

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string
  size?: number
  color: string
  style?: StyleProp<ViewStyle>
}) {
  const iconName = iconMap[name] || 'help-outline'
  
  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
      style={style as any}
    />
  )
}