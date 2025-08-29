# Supabase Expo 通用模板

一个精简优雅的 React Native Expo 应用模板，集成了 Supabase、Tailwind CSS 和 Zustand。

## ✨ 技术栈

- **React Native + Expo** - 跨平台移动应用开发
- **Supabase** - 后端即服务，提供数据库、认证等功能
- **Tailwind CSS (NativeWind)** - 原子化 CSS 框架
- **Zustand** - 轻量级状态管理
- **TypeScript** - 类型安全
- **Yarn** - 包管理器

## 🚀 功能特性

- ✅ 双 Tab 导航（主页 + 我的）
- ✅ 用户认证系统
- ✅ 订阅付费管理
- ✅ 主题切换（浅色/深色/跟随系统）
- ✅ 意见反馈
- ✅ 响应式设计
- ✅ 代码精简优雅

## 📦 快速开始

1. **安装依赖**
   ```bash
   yarn install
   ```

2. **配置 Supabase**
   - 在 `app.json` 中更新 Supabase URL 和 API Key
   ```json
   "extra": {
     "supabaseUrl": "YOUR_SUPABASE_URL",
     "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
   }
   ```

3. **启动开发服务器**
   ```bash
   yarn start
   ```

## 📁 项目结构

```
├── app/                    # 路由页面
│   ├── (tabs)/            # Tab 导航页面
│   │   ├── index.tsx      # 主页
│   │   └── profile.tsx    # 我的页面
│   └── _layout.tsx        # 根布局
├── components/            # 可复用组件
│   ├── ui/               # UI 组件
│   └── HapticTab.tsx     # 触觉反馈 Tab
├── lib/                   # 工具库
│   ├── store.ts          # Zustand 状态管理
│   └── supabase.ts       # Supabase 配置
├── constants/             # 常量定义
├── hooks/                # 自定义 Hooks
└── assets/               # 静态资源
```

## 🔧 状态管理

使用 Zustand 管理全局状态：

```typescript
const { user, theme, isSubscribed, setUser, setTheme } = useAppStore()
```

## 🎨 样式系统

使用 Tailwind CSS 类名：

```jsx
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-xl font-bold text-gray-900 dark:text-white">
    标题
  </Text>
</View>
```

## 🔐 Supabase 集成

```typescript
// 用户认证
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()

// 数据操作
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

## 📱 主要页面

### 主页 (`app/(tabs)/index.tsx`)
- 展示应用功能特性
- 用户登录状态显示
- 订阅状态提示

### 我的页面 (`app/(tabs)/profile.tsx`)
- 用户信息管理
- 订阅管理
- 主题切换
- 意见反馈
- 退出登录

## 🛠 开发指南

### 添加新页面
1. 在 `app/` 目录下创建新的 `.tsx` 文件
2. 使用 Expo Router 的文件系统路由

### 添加新组件
1. 在 `components/` 目录下创建组件
2. 使用 TypeScript 和 Tailwind CSS

### 状态管理
1. 在 `lib/store.ts` 中添加新的状态
2. 使用 `useAppStore` Hook 访问状态

## 📋 待办事项

- [ ] 实现用户注册/登录功能
- [ ] 集成支付系统（Apple Pay / Google Pay）
- [ ] 添加推送通知
- [ ] 实现意见反馈功能
- [ ] 添加多语言支持

## 🚀 部署

1. **构建应用**
   ```bash
   expo build:android
   expo build:ios
   ```

2. **发布到应用商店**
   - 按照 Expo 文档进行应用商店发布

## 📄 许可证

MIT License