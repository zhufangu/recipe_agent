# Render 性能测试指南

## 📊 阶段 1：基准数据收集（当前版本）

你现在运行的是 **baseline 版本**，包含了性能监控但未进行优化。

### 🎯 测试目标

收集以下关键指标：

1. **冷启动时间** - 应用从休眠状态唤醒需要多久
2. **组件初始化时间** - 各个 AI 组件初始化的耗时
3. **热启动响应时间** - 应用正常运行时的响应速度

### 🚀 部署到 Render

1. **推送当前分支到 GitHub**

```bash
git add backend/main.py
git add backend/RENDER_PERFORMANCE_TESTING.md
git commit -m "feat: add performance monitoring for Render baseline"
git push origin render-optimization
```

2. **在 Render 上部署**
   - 选择 `render-optimization` 分支
   - 或者暂时将此分支合并到 main

### 📈 测试步骤

#### 测试 1: 初次部署冷启动

部署完成后，立即访问以下端点并记录结果：

```bash
# 1. 健康检查 - 查看启动时间
curl https://your-app.onrender.com/health

# 2. 性能指标 - 详细的启动数据
curl https://your-app.onrender.com/metrics
```

**记录数据：**

- `uptime_seconds`: **\_\_\_\_**秒
- 各组件状态: **\_\_\_\_**

#### 测试 2: 冷启动测试（重点）

等待应用休眠后测试（Render 免费 tier 约 15 分钟无活动后休眠）：

1. **等待休眠**

   - 15-20 分钟不访问应用
   - 可以在 Render Dashboard 看到服务状态变为 "spinning down"

2. **唤醒并计时**

```bash
# 记录开始时间
date

# 访问健康检查端点（会触发唤醒）
time curl https://your-app.onrender.com/health

# 记录结束时间和响应内容
```

**记录数据：**

- 总唤醒时间（从请求到收到响应）: **\_\_\_\_**秒
- `uptime_seconds` (应该接近 0): **\_\_\_\_**秒
- 首次请求响应时间: **\_\_\_\_**秒

#### 测试 3: 热启动测试

应用唤醒并运行后：

```bash
# 连续测试几次，记录响应时间
for i in {1..5}; do
  echo "Test $i:"
  time curl -s https://your-app.onrender.com/health | jq '.uptime_seconds'
  sleep 2
done
```

**记录数据：**

- 第 1 次响应时间: **\_\_\_\_**秒
- 第 2 次响应时间: **\_\_\_\_**秒
- 第 3 次响应时间: **\_\_\_\_**秒
- 平均响应时间: **\_\_\_\_**秒

#### 测试 4: 实际 API 端点测试

测试真实的菜谱生成功能：

```bash
# 测试菜谱生成 API
time curl -X POST https://your-app.onrender.com/api/v1/recipes/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "我有土豆和牛肉，想做一道简单的菜"}' \
  | jq '.dish_name'
```

**记录数据：**

- 首次生成请求时间: **\_\_\_\_**秒
- 第二次生成请求时间: **\_\_\_\_**秒

### 📋 数据记录表格

#### 基准数据（Baseline）

| 指标                   | 测试 1 | 测试 2 | 测试 3 | 平均值 |
| ---------------------- | ------ | ------ | ------ | ------ |
| 冷启动总时间（秒）     |        |        |        |        |
| 组件初始化时间（秒）   |        |        |        |        |
| 热启动响应时间（秒）   |        |        |        |        |
| 菜谱生成响应时间（秒） |        |        |        |        |

### 🔍 查看服务器日志

在 Render Dashboard 中查看日志，寻找这些关键信息：

```
🚀 [RENDER BASELINE] Starting Recipe Agent API...
🏗️  [RENDER] Starting component initialization...
  ✓ Parser initialized in X.XXXs
  ✓ Generator initialized in X.XXXs
  ✓ Image Generator initialized in X.XXXs
  ✓ Ingredient Analyzer initialized in X.XXXs
  ✓ Recipe Optimizer initialized in X.XXXs
🎉 [RENDER] All components initialized in X.XXXs
✅ [RENDER] Total cold start time: X.XXXs
```

**从日志中记录：**

- Parser 初始化: **\_\_\_\_**秒
- Generator 初始化: **\_\_\_\_**秒
- Image Generator 初始化: **\_\_\_\_**秒
- Ingredient Analyzer 初始化: **\_\_\_\_**秒
- Recipe Optimizer 初始化: **\_\_\_\_**秒
- **总组件初始化时间**: **\_\_\_\_**秒
- **总冷启动时间**: **\_\_\_\_**秒

---

## 🎨 阶段 2：优化版本测试（下一步）

收集完基准数据后，我们将：

1. 应用延迟加载优化
2. 实现后台预加载策略
3. 再次测试并对比数据

### 预期改进

优化后预期能看到：

- ✅ 冷启动时间减少 30-50%
- ✅ 首次请求响应更快
- ✅ 内存使用更高效

---

## 💡 测试建议

1. **多次测试取平均值** - 每个场景至少测试 3 次
2. **记录时间段** - 不同时间段 Render 性能可能不同
3. **对比不同地区** - 如果可能，从不同地区测试
4. **监控内存使用** - 在 Render Dashboard 查看内存消耗

## 🔗 有用的工具

```bash
# 使用 httpie（更友好的 curl）
pip install httpie
http GET https://your-app.onrender.com/health

# 使用 hey 进行负载测试
# brew install hey
hey -n 10 -c 2 https://your-app.onrender.com/health
```

---

## 📝 测试检查清单

- [ ] 部署到 Render
- [ ] 测试初次冷启动
- [ ] 等待休眠（15 分钟）
- [ ] 测试休眠后唤醒
- [ ] 测试热启动响应
- [ ] 测试实际 API 功能
- [ ] 记录所有日志数据
- [ ] 整理数据到表格
- [ ] 准备进行阶段 2 优化

---

**准备好收集数据后，就可以开始阶段 2 的优化了！** 🚀
