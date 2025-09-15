# 🍳 智能菜谱生成器 / Smart Recipe Generator

<div style="text-align: center; margin: 20px 0;">
    <button onclick="toggleLanguage()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
        <span id="lang-toggle">切换到英文 / Switch to English</span>
    </button>
</div>

<div id="chinese-content">
## ✨ 功能特点

- ��️ **自然语言输入**：用日常语言描述需求，AI 自动解析
- �� **智能约束**：支持时间限制、饮食要求、热量偏好等
- 📋 **结构化输出**：生成详细的菜谱信息（食材、步骤、营养等）
- ��️ **菜品图片生成**：基于菜谱自动生成高质量菜品图片
- �� **Web 界面**：友好的 Streamlit 界面，支持多种输入方式
- �� **模块化设计**：清晰的代码结构，易于扩展和维护

## 🚀 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 设置 API 密钥

创建 `.env` 文件并添加必要的 API 密钥：

```bash
# OpenAI API（用于菜谱生成）
echo "OPENAI_API_KEY=your-openai-api-key" >> .env

# 阿里云通义千问 API（用于图片生成）
echo "DASHSCOPE_API_KEY=your-dashscope-api-key" >> .env
```

### 3. 运行应用

#### 方式一：Web 界面（推荐）

```bash
streamlit run app.py
```

#### 方式二：命令行测试

```bash
# 测试菜谱生成
python agent.py

# 测试图片生成
python image_generator.py
```

#### 方式三：Python 代码

```python
from agent import RecipeAgent
from image_generator import QwenImageGenerator

# 创建实例
agent = RecipeAgent()
image_gen = QwenImageGenerator()

# 生成菜谱
recipe = agent.generate_recipe_from_natural_language(
    "我冰箱里有牛肉和洋葱，想做个半小时内搞定的快手菜，别太辣"
)

# 生成菜品图片
image_url = image_gen.generate_recipe_image(recipe)
print(f"菜谱: {recipe['dish_name']}")
print(f"图片: {image_url}")
```

## 📁 项目结构

recipe_agent/
├── agent.py # 统一 Agent 接口 + 便捷函数
├── parser.py # 自然语言解析器
├── generator.py # 菜谱生成器
├── image_generator.py # 菜品图片生成器
├── app.py # Streamlit Web 应用
├── demo.py # 演示脚本
├── test_recipe.py # 测试脚本
├── requirements.txt # 依赖包
└── README.md # 项目说明

## 🎯 使用示例

### 自然语言输入

```python
from agent import RecipeAgent

agent = RecipeAgent()

# 示例1：时间限制
recipe = agent.generate_recipe_from_natural_language(
    "我冰箱里有牛肉和洋葱，想做个半小时内搞定的快手菜，别太辣"
)

# 示例2：热量控制
recipe = agent.generate_recipe_from_natural_language(
    "家里有鸡蛋、番茄、面条，想做一道简单的中式菜，热量不要太高"
)

# 示例3：营养需求
recipe = agent.generate_recipe_from_natural_language(
    "冰箱里有土豆、胡萝卜、鸡肉，想做一道营养丰富的菜，适合减肥"
)
```

### 食材列表输入

```python
from agent import RecipeAgent

agent = RecipeAgent()

recipe = agent.generate_recipe_from_ingredients(
    ingredients=["鸡蛋", "番茄", "洋葱", "蒜"],
    cuisine_type="中式",
    difficulty="简单"
)
```

### 菜品图片生成

```python
from image_generator import QwenImageGenerator

image_gen = QwenImageGenerator()

# 基于菜谱生成图片
image_url = image_gen.generate_recipe_image(recipe)
print(f"菜品图片: {image_url}")
```

## 🔧 高级用法

### 使用 Agent 类的高级功能

```python
from agent import RecipeAgent

agent = RecipeAgent()

# 自然语言输入 + 约束条件
recipe = agent.generate_recipe_from_natural_language(
    "冰箱里有三文鱼、芦笋、柠檬，想做一道西式菜，健康低脂"
)

# 传统食材输入 + 详细约束
recipe = agent.generate_recipe_from_ingredients(
    ingredients=["土豆", "牛肉", "洋葱"],
    cuisine_type="西式",
    difficulty="中等",
    max_cook_time=30,
    dietary_requirements=["不辣"],
    calorie_preference="低热量"
)
```

### 自定义图片生成

```python
from image_generator import QwenImageGenerator

image_gen = QwenImageGenerator()

# 自定义菜谱数据
custom_recipe = {
    "dish_name": "清蒸鲈鱼",
    "ingredients": [
        {"name": "鲈鱼", "amount": 1, "unit": "条"},
        {"name": "生姜", "amount": 20, "unit": "g"},
        {"name": "葱", "amount": 2, "unit": "根"}
    ],
    "cuisine_type": "中式"
}

# 生成图片
image_url = image_gen.generate_recipe_image(custom_recipe)
```

## 🧪 测试

运行测试套件：

```bash
# 完整测试（包括模拟测试和真实API测试）
python test_recipe.py

# 单独测试图片生成
python image_generator.py
```

## 📝 输出格式

### 菜谱 JSON 格式

```json
{
  "dish_name": "菜品名称",
  "description": "菜品描述",
  "cuisine_type": "菜系类型",
  "difficulty": "难度等级",
  "prep_time_mins": 15,
  "cook_time_mins": 20,
  "servings": 2,
  "ingredients": [
    {
      "name": "食材名称",
      "amount": 2,
      "unit": "个"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": "步骤描述"
    }
  ],
  "tips": ["烹饪小贴士"],
  "nutritional_info": {
    "calories_kcal": 350,
    "protein_g": 30,
    "carbs_g": 25,
    "fat_g": 15
  }
}
```

### 图片生成结果

- **返回格式**：图片 URL 字符串
- **有效期**：24 小时（建议及时下载保存）
- **格式**：PNG/WebP
- **尺寸**：1024x1024 像素

## �� Web 界面功能

访问 `http://localhost:8501` 体验完整功能：

1. **自然语言输入**：描述你的需求和食材
2. **食材列表输入**：直接输入食材和偏好
3. **菜谱生成**：AI 生成详细菜谱
4. **图片生成**：一键生成菜品图片
5. **结果展示**：美观的菜谱和图片展示
6. **下载功能**：支持下载菜谱 JSON 文件

## 🔑 API 密钥获取

### OpenAI API

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册账号并获取 API Key
3. 添加到 `.env` 文件

### 阿里云通义千问 API

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 开通服务并获取 API Key
3. 添加到 `.env` 文件

## ��️ 技术栈

- **后端**：Python 3.8+
- **AI 模型**：OpenAI GPT-4o-mini（菜谱生成）
- **图片生成**：阿里云通义千问 Qwen-Image
- **Web 框架**：Streamlit
- **依赖管理**：pip + requirements.txt

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- OpenAI API
- 阿里云通义千问
- Streamlit
- 所有开源贡献者
</div>

<div id="english-content" style="display: none;">
## ✨ Features

- ��️ **Natural Language Input**: Describe your needs in everyday language, AI automatically parses
- 🎯 **Smart Constraints**: Support time limits, dietary requirements, calorie preferences, etc.
- 📋 **Structured Output**: Generate detailed recipe information (ingredients, steps, nutrition, etc.)
- 🖼️ **Recipe Image Generation**: Automatically generate high-quality dish images based on recipes
- 🌐 **Web Interface**: Friendly Streamlit interface supporting multiple input methods
- �� **Modular Design**: Clear code structure, easy to extend and maintain

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set up API Keys

Create a `.env` file and add the necessary API keys:

```bash
# OpenAI API (for recipe generation)
echo "OPENAI_API_KEY=your-openai-api-key" >> .env

# Alibaba Cloud Qwen API (for image generation)
echo "DASHSCOPE_API_KEY=your-dashscope-api-key" >> .env
```

### 3. Run the Application

#### Method 1: Web Interface (Recommended)

```bash
streamlit run app.py
```

#### Method 2: Command Line Testing

```bash
# Test recipe generation
python agent.py

# Test image generation
python image_generator.py
```

#### Method 3: Python Code

```python
from agent import RecipeAgent
from image_generator import QwenImageGenerator

# Create instances
agent = RecipeAgent()
image_gen = QwenImageGenerator()

# Generate recipe
recipe = agent.generate_recipe_from_natural_language(
    "I have beef and onions in my fridge, want to make a quick dish within 30 minutes, not too spicy"
)

# Generate dish image
image_url = image_gen.generate_recipe_image(recipe)
print(f"Recipe: {recipe['dish_name']}")
print(f"Image: {image_url}")
```

## 📁 Project Structure

recipe_agent/
├── agent.py # Unified Agent interface + utility functions
├── parser.py # Natural language parser
├── generator.py # Recipe generator
├── image_generator.py # Dish image generator
├── app.py # Streamlit Web application
├── demo.py # Demo script
├── test_recipe.py # Test script
├── requirements.txt # Dependencies
└── README.md # Project documentation

## 🎯 Usage Examples

### Natural Language Input

```python
from agent import RecipeAgent

agent = RecipeAgent()

# Example 1: Time constraint
recipe = agent.generate_recipe_from_natural_language(
    "I have beef and onions in my fridge, want to make a quick dish within 30 minutes, not too spicy"
)

# Example 2: Calorie control
recipe = agent.generate_recipe_from_natural_language(
    "I have eggs, tomatoes, and noodles at home, want to make a simple Chinese dish, not too high in calories"
)

# Example 3: Nutritional needs
recipe = agent.generate_recipe_from_natural_language(
    "I have potatoes, carrots, and chicken in my fridge, want to make a nutritious dish, suitable for weight loss"
)
```

### Ingredient List Input

```python
from agent import RecipeAgent

agent = RecipeAgent()

recipe = agent.generate_recipe_from_ingredients(
    ingredients=["eggs", "tomatoes", "onions", "garlic"],
    cuisine_type="Chinese",
    difficulty="simple"
)
```

### Dish Image Generation

```python
from image_generator import QwenImageGenerator

image_gen = QwenImageGenerator()

# Generate image based on recipe
image_url = image_gen.generate_recipe_image(recipe)
print(f"Dish image: {image_url}")
```

## �� Advanced Usage

### Using Agent Class Advanced Features

```python
from agent import RecipeAgent

agent = RecipeAgent()

# Natural language input + constraints
recipe = agent.generate_recipe_from_natural_language(
    "I have salmon, asparagus, and lemon in my fridge, want to make a Western dish, healthy and low-fat"
)

# Traditional ingredient input + detailed constraints
recipe = agent.generate_recipe_from_ingredients(
    ingredients=["potatoes", "beef", "onions"],
    cuisine_type="Western",
    difficulty="medium",
    max_cook_time=30,
    dietary_requirements=["not spicy"],
    calorie_preference="low calorie"
)
```

### Custom Image Generation

```python
from image_generator import QwenImageGenerator

image_gen = QwenImageGenerator()

# Custom recipe data
custom_recipe = {
    "dish_name": "Steamed Sea Bass",
    "ingredients": [
        {"name": "sea bass", "amount": 1, "unit": "piece"},
        {"name": "ginger", "amount": 20, "unit": "g"},
        {"name": "scallions", "amount": 2, "unit": "stalks"}
    ],
    "cuisine_type": "Chinese"
}

# Generate image
image_url = image_gen.generate_recipe_image(custom_recipe)
```

## 🧪 Testing

Run the test suite:

```bash
# Complete test (including mock tests and real API tests)
python test_recipe.py

# Test image generation separately
python image_generator.py
```

## 📝 Output Format

### Recipe JSON Format

```json
{
  "dish_name": "Dish Name",
  "description": "Dish Description",
  "cuisine_type": "Cuisine Type",
  "difficulty": "Difficulty Level",
  "prep_time_mins": 15,
  "cook_time_mins": 20,
  "servings": 2,
  "ingredients": [
    {
      "name": "Ingredient Name",
      "amount": 2,
      "unit": "pieces"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": "Step Description"
    }
  ],
  "tips": ["Cooking Tips"],
  "nutritional_info": {
    "calories_kcal": 350,
    "protein_g": 30,
    "carbs_g": 25,
    "fat_g": 15
  }
}
```

### Image Generation Results

- **Return Format**: Image URL string
- **Validity Period**: 24 hours (recommend downloading and saving promptly)
- **Format**: PNG/WebP
- **Size**: 1024x1024 pixels

## 🌐 Web Interface Features

Visit `http://localhost:8501` to experience the full functionality:

1. **Natural Language Input**: Describe your needs and ingredients
2. **Ingredient List Input**: Directly input ingredients and preferences
3. **Recipe Generation**: AI generates detailed recipes
4. **Image Generation**: One-click dish image generation
5. **Result Display**: Beautiful recipe and image display
6. **Download Function**: Support downloading recipe JSON files

## 🔑 API Key Acquisition

### OpenAI API

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Register account and get API Key
3. Add to `.env` file

### Alibaba Cloud Qwen API

1. Visit [Alibaba Cloud Bailian Console](https://bailian.console.aliyun.com/)
2. Enable service and get API Key
3. Add to `.env` file

## 🛠️ Tech Stack

- **Backend**: Python 3.8+
- **AI Models**: OpenAI GPT-4o-mini (recipe generation)
- **Image Generation**: Alibaba Cloud Qwen-Image
- **Web Framework**: Streamlit
- **Dependency Management**: pip + requirements.txt

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

## 📄 License

MIT License

## 🙏 Acknowledgments

- OpenAI API
- Alibaba Cloud Qwen
- Streamlit
- All open source contributors
</div>

<script>
function toggleLanguage() {
    const chineseContent = document.getElementById('chinese-content');
    const englishContent = document.getElementById('english-content');
    const toggleButton = document.getElementById('lang-toggle');
    
    if (chineseContent.style.display === 'none') {
        chineseContent.style.display = 'block';
        englishContent.style.display = 'none';
        toggleButton.textContent = '切换到英文 / Switch to English';
    } else {
        chineseContent.style.display = 'none';
        englishContent.style.display = 'block';
        toggleButton.textContent = '切换到中文 / Switch to Chinese';
    }
}
</script>
