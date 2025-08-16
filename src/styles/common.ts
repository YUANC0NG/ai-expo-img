import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const commonStyles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  // 布局样式
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  column: {
    flexDirection: 'column',
  },

  // 文本样式
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
  },

  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
  },

  body: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },

  caption: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  },

  // 按钮样式
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
  },

  secondaryButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },

  primaryButtonText: {
    color: theme.colors.white,
  },

  secondaryButtonText: {
    color: theme.colors.text,
  },

  // 卡片样式
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    ...theme.shadows.base,
  },

  cardHeader: {
    marginBottom: theme.spacing.sm,
  },

  cardContent: {
    flex: 1,
  },

  cardFooter: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },

  // 分隔线
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.sm,
  },

  verticalSeparator: {
    width: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.sm,
  },

  // 输入框样式
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },

  inputFocused: {
    borderColor: theme.colors.primary,
  },

  // 加载状态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },

  // 错误状态
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },

  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.base,
  },

  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },

  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // 覆盖层
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
  },

  // 网格布局
  gridContainer: {
    padding: theme.spacing.xs,
  },

  gridItem: {
    flex: 1,
    margin: theme.spacing.xs,
  },

  // 头部样式
  header: {
    height: theme.layout.headerHeight,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },

  // 底部安全区域
  bottomSafeArea: {
    backgroundColor: theme.colors.background,
  },
});