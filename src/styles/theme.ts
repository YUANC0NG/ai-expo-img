import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const theme = {
  // 颜色系统
  colors: {
    // 主色调
    primary: '#007AFF',
    primaryLight: '#4DA6FF',
    primaryDark: '#0056CC',
    
    // 辅助色
    secondary: '#FF3B30',
    secondaryLight: '#FF6B60',
    secondaryDark: '#CC2E24',
    
    // 中性色
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F7',
    backgroundTertiary: '#FFFFFF',
    
    // 文本色
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',
    textPlaceholder: '#C7C7CC',
    
    // 边框色
    border: '#C6C6C8',
    borderLight: '#E5E5EA',
    
    // 状态色
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    
    // 特殊色
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // 透明度变体
    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#000000',
  },

  // 字体系统
  typography: {
    // 字体大小
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      lg: 16,
      xl: 18,
      '2xl': 20,
      '3xl': 24,
      '4xl': 28,
      '5xl': 32,
    },
    
    // 字重
    fontWeight: {
      light: '300' as const,
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // 行高
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },

  // 间距系统
  spacing: {
    xs: 4,
    sm: 8,
    base: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  // 圆角系统
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  // 阴影系统
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // 屏幕尺寸
  screen: {
    width: screenWidth,
    height: screenHeight,
    isSmall: screenWidth < 375,
    isMedium: screenWidth >= 375 && screenWidth < 414,
    isLarge: screenWidth >= 414,
  },

  // 布局常量
  layout: {
    headerHeight: 60,
    tabBarHeight: 80,
    safeAreaPadding: 20,
    gridSpacing: 2,
    thumbnailSize: {
      small: 80,
      medium: 120,
      large: 160,
    },
  },

  // 动画时长
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

export type Theme = typeof theme;