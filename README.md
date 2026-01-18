# Fast AI Food

基于 AI 和现有食材的菜谱推荐 H5 网站。

## 功能

- **食材输入**：输入你现有的食材。
- **混合推荐**：
  - **本地搜索**：基于 Supabase 数据库匹配现有菜谱。
  - **AI 创意**：基于 DeepSeek 大模型生成创意食谱。
- **中文优化**：全站中文界面，符合中国饮食习惯的推荐。

## 技术栈

- **Frontend**: React, TailwindCSS, Vite
- **Backend**: Express, Vercel AI SDK
- **Database**: Supabase
- **AI**: DeepSeek (deepseek-chat)

## 环境配置

请复制 `.env.example` 为 `.env` 并填入以下配置：

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DEEPSEEK_API_KEY=sk-xxxxxxxx  # DeepSeek API Key
```

## 运行

```bash
# 安装依赖
npm install

# 启动开发服务器 (前端 + 后端)
npm run dev
```
