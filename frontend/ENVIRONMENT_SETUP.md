# 环境变量配置说明

## 概述

项目使用环境变量来管理 API 端点，支持不同环境的灵活配置。

## 配置步骤

### 1. 创建环境变量文件

在 `frontend` 目录下创建 `.env.local` 文件：

```bash
# 本地开发环境
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 2. 生产环境配置

在 Vercel 部署时，需要在项目设置中添加环境变量：

```
NEXT_PUBLIC_API_URL=https://recipe-agent-ilea.onrender.com
```

## 环境变量说明

| 变量名                | 说明         | 本地开发                | 生产环境                                 |
| --------------------- | ------------ | ----------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_API_URL` | API 基础 URL | `http://127.0.0.1:8000` | `https://recipe-agent-ilea.onrender.com` |

## 优势

✅ **灵活性**: 不同环境使用不同配置  
✅ **安全性**: 敏感信息不硬编码  
✅ **维护性**: 统一管理所有 API 端点  
✅ **可扩展性**: 易于添加新的环境配置

## 文件结构

```
frontend/
├── src/
│   └── config/
│       └── api.ts          # API配置管理
├── .env.local              # 本地环境变量（需要创建）
└── .env.example            # 环境变量示例
```

## 使用方式

所有 API 调用都通过 `src/config/api.ts` 中的配置：

```typescript
import { RECIPE_GENERATE_URL } from '../config/api';

// 自动根据环境变量选择正确的API地址
const response = await fetch(RECIPE_GENERATE_URL, { ... });
```
