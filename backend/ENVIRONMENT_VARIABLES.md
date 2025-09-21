# 后端环境变量配置说明

## 概述

后端使用环境变量来管理 CORS 配置和其他设置，支持不同环境的灵活配置。

## 必需的环境变量

### API Keys

- `OPENAI_API_KEY` - OpenAI API 密钥
- `DASHSCOPE_API_KEY` - 阿里云 DashScope API 密钥

## CORS 配置环境变量

### 1. 环境类型

- `ENVIRONMENT` - 环境类型
  - `development` (默认) - 开发环境，自动包含本地地址
  - `production` - 生产环境

### 2. 前端 URL 配置

- `FRONTEND_URL` - 前端应用的主 URL
  - 开发环境: `http://localhost:3000`
  - 生产环境: `https://kaifan.vercel.app`

### 3. 额外 CORS 源

- `CORS_ORIGINS` - 额外的 CORS 源（用逗号分隔）
  - 示例: `https://example.com,https://another-domain.com`

## 配置示例

### 开发环境 (.env)

```bash
ENVIRONMENT=development
OPENAI_API_KEY=your_openai_key
DASHSCOPE_API_KEY=your_dashscope_key
FRONTEND_URL=http://localhost:3000
```

### 生产环境 (Render)

```bash
ENVIRONMENT=production
OPENAI_API_KEY=your_openai_key
DASHSCOPE_API_KEY=your_dashscope_key
FRONTEND_URL=https://kaifan.vercel.app
CORS_ORIGINS=https://backup-domain.vercel.app,https://staging.vercel.app
```

## 自动 CORS 源

### 开发环境自动包含：

- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

### 生产环境：

- 只包含 `FRONTEND_URL` 中指定的地址
- 加上 `CORS_ORIGINS` 中的额外地址

## 优势

✅ **灵活性**: 不同环境使用不同配置  
✅ **安全性**: 只允许指定的域名访问  
✅ **可维护性**: 无需修改代码即可更新 CORS 设置  
✅ **可扩展性**: 易于添加新的前端域名

## 部署配置

### Render 部署时设置：

1. 进入项目设置
2. 找到 "Environment Variables"
3. 添加上述环境变量
4. 确保 `FRONTEND_URL` 指向你的 Vercel 域名 (https://kaifan.vercel.app)
