# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Fast AI Food 是一个基于 AI 和现有食材的菜谱推荐 H5 应用。它结合本地数据库搜索和 DeepSeek AI 生成，为用户提供个性化的中式家常菜菜谱推荐。

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器 (前端 + 后端同时启动)
npm run dev

# 仅启动前端开发服务器
npm run client:dev

# 仅启动后端开发服务器
npm run server:dev

# 构建生产版本
npm run build

# 类型检查
npm run check

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

## 项目架构

### 整体结构
这是一个前后端分离的项目，使用 TypeScript 全栈开发：

- **前端**：React 18 + Vite + TailwindCSS + React Router
- **后端**：Express + Vercel AI SDK
- **数据库**：Supabase PostgreSQL
- **AI 模型**：DeepSeek (deepseek-chat)
- **状态管理**：Zustand

### 目录结构
```
fast-ai-food/
├── api/                    # Express 后端服务
│   ├── app.ts             # Express 应用配置，路由注册
│   ├── server.ts          # 服务器入口文件
│   ├── lib/
│   │   └── supabase.ts    # Supabase 客户端初始化
│   └── routes/
│       ├── auth.ts        # 认证相关路由
│       └── recipes.ts     # 菜谱推荐核心逻辑
├── src/                   # React 前端应用
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx      # 首页，食材输入
│   │   ├── Recipes.tsx   # 菜谱列表展示
│   │   └── RecipeDetail.tsx  # 菜谱详情
│   ├── store/
│   │   └── useRecipeStore.ts  # Zustand 状态管理 (食材列表)
│   ├── components/       # 可复用组件
│   ├── hooks/            # 自定义 React Hooks
│   └── lib/              # 工具函数
├── vite.config.ts        # Vite 配置，包含前端代理到后端的设置
└── tsconfig.json         # TypeScript 配置，包含路径别名 @/*
```

### 核心功能流程

**菜谱推荐流程** ([api/routes/recipes.ts](api/routes/recipes.ts)):
1. 用户输入食材列表（可选菜系、难度）
2. 后端 `/api/recipes/recommend` 接口处理请求
3. 本地搜索：在 Supabase `recipes` 表中匹配包含任一食材的菜谱
4. AI 生成：使用 DeepSeek 模型生成创意菜谱（结构化输出）
5. 返回混合推荐结果

### 关键设计点

**AI 集成方式**：
- 使用 `@ai-sdk/deepseek` 创建 DeepSeek 客户端
- 通过 `generateObject` 实现结构化输出，使用 Zod schema 定义菜谱格式
- 支持 `ai_creative` 参数控制是否启用 AI 生成

**前端代理配置** ([vite.config.ts](vite.config.ts:27-46)):
- 开发环境下，`/api/*` 请求会被代理到 `http://localhost:3001`
- 后端服务运行在 3001 端口

**状态管理** ([src/store/useRecipeStore.ts](src/store/useRecipeStore.ts)):
- 使用 Zustand 管理全局食材列表
- 提供添加、删除、清空等方法

## 环境变量

开发环境需配置 `.env` 文件：

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEEPSEEK_API_KEY=sk-xxxxxxxx
```

## 数据库表结构

**recipes** 表 (Supabase):
- `id`: UUID (主键)
- `name`: 菜谱名称
- `ingredients`: 食材列表 (存储为文本，如 "鸡蛋,西红柿")
- `cuisine_type`: 菜系类型
- `difficulty`: 难度等级 ('简单', '中等', '困难')
- `cooking_time`: 烹饪时间 (分钟)
- `description`: 描述
- `steps`: 制作步骤
