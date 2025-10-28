# AWS Lambda 部署指南

本指南将帮助你将 Pantry AI 后端部署到 AWS Lambda。

## 前提条件

1. **AWS 账户** - 已注册并可以登录 AWS 管理控制台
2. **Docker Desktop** - 已安装并在 Mac 上运行
3. **Python 环境** - 已安装 Python 3.12 (用于本地开发)

## 部署步骤

### Step 1: 构建部署包

1. **打开终端 (Terminal)**

2. **导航到 backend 目录**

   ```bash
   cd /Users/zhufangu/Documents/projects/recipe_agent/backend
   ```

3. **确保 Docker Desktop 正在运行**

4. **运行部署脚本**

   ```bash
   ./deploy_lambda.sh
   ```

   脚本会：

   - 使用 Docker 在 Linux x86_64 环境中安装所有依赖
   - 复制 Python 代码文件
   - 清理不必要的文件
   - 创建 `lambda-deployment.zip` 文件

   执行完成后，你会看到包的大小和位置。

### Step 2: 创建 Lambda 函数

1. 登录 [AWS 管理控制台](https://console.aws.amazon.com/)

2. 导航到 **Lambda** 服务

3. 点击 **Create function**

4. 配置基本信息：

   - **Function name**: `recipe-agent-backend`
   - **Runtime**: `Python 3.12`
   - **Architecture**: `x86_64` (保持默认)

5. 点击 **Create function**

### Step 3: 上传代码

1. 在 Lambda 函数页面，找到 **Code** 标签页

2. 点击 **Upload from** → 选择 **.zip file**

3. 选择 `lambda-deployment.zip` 文件并点击 **Upload**

4. 上传完成后，滚动到 **Runtime settings**

5. 点击 **Edit**

6. 修改 **Handler** 为：`lambda_handler.handler`

7. 点击 **Save**

### Step 4: 配置环境变量

1. 切换到 **Configuration** 标签页

2. 在左侧选择 **Environment variables**

3. 点击 **Edit** → **Add environment variable**

4. 添加以下环境变量：

   | Key                 | Value                           |
   | ------------------- | ------------------------------- |
   | `OPENAI_API_KEY`    | 你的 OpenAI API 密钥            |
   | `DASHSCOPE_API_KEY` | 你的 DashScope API 密钥         |
   | `ENVIRONMENT`       | `production`                    |
   | `FRONTEND_URL`      | `https://pantryai.zhufangu.com` |

5. 点击 **Save**

### Step 5: 调整资源配置

1. 在 **Configuration** 标签页，选择 **General configuration**

2. 点击 **Edit**

3. 设置：

   - **Memory**: `512` MB
   - **Timeout**: `30` sec

4. 点击 **Save**

### Step 6: 创建 Function URL

1. 在 **Configuration** 标签页，选择 **Function URL**

2. 点击 **Create function URL**

3. 配置：

   - **Auth type**: `NONE`
   - ✅ **Configure cross-origin resource sharing (CORS)**
   - **Allow origin**: `https://pantryai.zhufangu.com`
   - **Allow methods**: `*`
   - **Allow headers**: `Content-Type`

4. 点击 **Save**

5. **复制并保存 Function URL**（格式：`https://<id>.lambda-url.<region>.on.aws/`）

### Step 7: 测试 Lambda 函数

使用 `curl` 命令测试：

```bash
curl -X POST "<你的 Function URL>/api/v1/intent/analyze" \
  -H "Content-Type: application/json" \
  -d '{"message":"我想做个番茄炒蛋"}'
```

预期响应：

```json
{ "is_recipe_request": true, "message": "我想做个番茄炒蛋" }
```

如果失败，查看 **Monitor** → **Logs** → **CloudWatch Logs** 中的错误信息。

### Step 8: 更新前端配置

1. 登录 AWS 管理控制台

2. 导航到 **Amplify** 服务

3. 选择你的前端应用

4. 进入 **App settings** → **Environment variables**

5. 点击 **Manage variables**

6. 添加：

   - **Variable**: `NEXT_PUBLIC_API_URL`
   - **Value**: `<你的 Lambda Function URL>`（不带末尾的 `/`）

7. 点击 **Save**

8. **重新部署前端**：
   - 回到 Amplify 应用主页
   - 找到 `main` 分支
   - 点击 **Redeploy this version**

### Step 9: 测试完整应用

1. 等待 Amplify 重新部署完成

2. 访问 `https://pantryai.zhufangu.com`

3. 测试功能：

   - 文字描述生成菜谱
   - 图片识别食材

4. 检查浏览器开发者工具 (F12) → Network 标签，确保 API 请求成功

## 故障排除

### 问题：Docker 未运行

**错误信息**：`Error: Docker is not running or not installed`

**解决方法**：

1. 打开 Docker Desktop
2. 等待完全启动
3. 重新运行 `./deploy_lambda.sh`

### 问题：上传的包过大

**错误信息**：`Unzipped size must be smaller than 262144000 bytes`

**解决方法**：

1. 检查 `requirements.txt` 中的依赖
2. 移除不必要的依赖
3. 考虑使用 Lambda Layers 存储大型依赖

### 问题：Handler 找不到

**错误信息**：`Unable to import module 'lambda_handler'`

**解决方法**：

1. 确保 `lambda_handler.py` 已包含在部署包中
2. 确认 Handler 配置为 `lambda_handler.handler`
3. 重新构建并上传部署包

### 问题：环境变量未设置

**错误信息**：`API key not found`

**解决方法**：

1. 在 Lambda 控制台检查环境变量配置
2. 确保所有必需的环境变量都已添加
3. 确认环境变量名称拼写正确

## 文件说明

- `deploy_lambda.sh` - 使用 Docker 构建 Lambda 部署包的脚本
- `lambda_handler.py` - Lambda 入口文件，使用 Mangum 适配 FastAPI
- `requirements.txt` - Python 依赖列表
- `main.py` - FastAPI 应用主文件
- `lambda-deployment.zip` - 构建的部署包（运行脚本后生成）

## 成本估算

Lambda 定价：

- **免费套餐**：每月前 100 万次请求免费
- **超出后**：$0.20 per 1M 请求
- **计算时间**：$0.0000166667 per GB-秒

对于中等使用量的应用，每月成本通常很低（<$10）。

## 下一步

- 设置 CloudWatch 监控和告警
- 配置自定义域名（如果需要）
- 优化冷启动性能
- 实现 Lambda Layers 以提高部署速度

## 参考资料

- [AWS Lambda Python 运行时](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html)
- [Mangum 文档](https://mangum.io/)
- [FastAPI 部署](https://fastapi.tiangolo.com/deployment/)
