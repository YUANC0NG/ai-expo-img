# 照片整理大师 📸

一款基于 React Native 和 Expo 开发的照片整理应用，帮助用户快速分类和管理照片。

## 功能特性

### 核心功能
- **滑动整理照片**: 通过左右滑动手势快速分类照片
- **按月分类相册**: 自动按月份整理照片，方便浏览和管理
- **用户中心**: 包含订阅管理、意见反馈等功能

### 页面结构
1. **相册页面** (`app/(tabs)/index.tsx`)
   - 按月份显示照片分类
   - 点击任意月份进入整理页面
   - 显示每月照片数量

2. **整理照片页面** (`app/organize.tsx`)
   - 滑动卡片式照片整理界面
   - 支持左右滑动分类
   - 可重置和重新开始

3. **我的页面** (`app/(tabs)/explore.tsx`)
   - 用户信息展示
   - 订阅入口（升级专业版）
   - 意见反馈功能
   - 应用评分
   - 隐私政策和使用条款

## 技术栈

- **React Native**: 跨平台移动应用开发
- **Expo**: 开发工具链和平台
- **Expo Router**: 文件路由系统
- **TypeScript**: 类型安全
- **React Native Reanimated**: 动画库
- **React Native Gesture Handler**: 手势处理

## 开始使用

1. 安装依赖
   ```bash
   npm install
   ```

2. 启动应用
   ```bash
   npx expo start
   ```

3. 选择运行平台
   - 按 `i` 在 iOS 模拟器中运行
   - 按 `a` 在 Android 模拟器中运行
   - 按 `w` 在 Web 浏览器中运行

## 项目结构

```
app/
├── (tabs)/
│   ├── _layout.tsx      # Tab 导航布局
│   ├── index.tsx        # 相册列表页面
│   └── explore.tsx      # 我的页面
├── organize.tsx         # 整理照片页面
└── _layout.tsx          # 根布局

components/
├── StackedCards.tsx     # 滑动卡片组件
├── ThemedText.tsx       # 主题文本组件
├── ThemedView.tsx       # 主题视图组件
└── ui/
    └── IconSymbol.tsx   # 图标组件
```

## 核心组件

### StackedCards 组件
位于 `components/StackedCards.tsx`，实现了照片的滑动整理功能：
- 支持左右滑动手势
- 卡片堆叠效果
- 动画过渡
- 自定义回调函数

### 导航结构
- 使用 Expo Router 的文件路由
- Tab 导航包含两个主要页面
- 支持页面间参数传递

## 开发说明

### 添加新功能
1. 在对应的页面文件中添加功能
2. 如需新组件，在 `components/` 目录下创建
3. 遵循 TypeScript 类型定义

### 样式规范
- 使用 StyleSheet 创建样式
- 支持深色/浅色主题
- 响应式设计适配不同屏幕尺寸

### 数据管理
- 当前使用模拟数据
- 可扩展为真实的照片库集成
- 支持本地存储和云端同步

## 后续开发计划

- [ ] 集成设备相册 API
- [ ] 实现真实的订阅系统
- [ ] 添加照片编辑功能
- [ ] 云端同步支持
- [ ] 更多分类选项
- [ ] 批量操作功能

## 许可证

MIT License