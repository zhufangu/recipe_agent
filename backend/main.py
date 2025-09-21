import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Dict, Any
import io

# 导入所有需要的类
from parser import RecipeRequirementsParser
from generator import RecipeGenerator
from image_generator import QwenImageGenerator
from ingredient_analyzer import IngredientAnalyzer
from recipe_optimizer import RecipeOptimizer

load_dotenv()


app = FastAPI()


# 从环境变量获取CORS配置
def get_cors_origins():
    """从环境变量获取CORS允许的源"""
    origins = []

    # 本地开发环境
    if os.getenv("ENVIRONMENT", "development") == "development":
        origins.extend(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
        )

    # 生产环境 - 从环境变量读取
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        origins.append(frontend_url)

    # 额外的CORS源（用逗号分隔）
    extra_origins = os.getenv("CORS_ORIGINS", "")
    if extra_origins:
        origins.extend(
            [origin.strip() for origin in extra_origins.split(",") if origin.strip()]
        )

    # 如果没有配置任何源，使用默认值
    if not origins:
        origins = ["http://localhost:3000"]

    return origins


# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecipeImageRequest(BaseModel):
    recipe_json: Dict[str, Any]


class RecipeRequest(BaseModel):
    description: str


class RecipeOptimizeRequest(BaseModel):
    current_recipe: Dict[str, Any]
    user_request: str
    conversation_history: list = []


class IntentAnalysisRequest(BaseModel):
    message: str


# 在API函数外创建解析器的实例,初始化所有AI组件
# 这样应用启动时就创建好了，不用每次请求都重新创建一个，效率更高
parser = RecipeRequirementsParser()
generator = RecipeGenerator()
image_generator = QwenImageGenerator()
ingredient_analyzer = IngredientAnalyzer()
recipe_optimizer = RecipeOptimizer()


@app.post("/api/v1/recipes/generate")
async def generate_recipe(request: RecipeRequest):  # 👈 把模型作为类型提示
    # FastAPI 会自动解析请求体中的 JSON 数据，并验证它是否符合 RecipeRequest 的结构
    # 如果不符合，它会自动返回一个清晰的错误信息给前端

    """
    生成菜谱的API端点

    职责：
    1. 接收前端请求
    2. 验证请求格式
    3. 调用业务逻辑模块
    4. 返回结果
    """

    user_description = request.description
    print(f"收到了前端发来的请求: {user_description}")

    try:
        # 调用解析器，解析用户需求
        print("🔍 正在解析您的需求...")
        requirements = parser.parse_requirements(user_description)
        print("✅ 解析完成！识别到：")
        print(f"   🥘 食材: {', '.join(requirements['ingredients'])}")
        print(f"   🕐 最大烹饪时间: {requirements['max_cook_time_mins']}分钟")
        print(f"   🍽️ 菜系: {requirements['cuisine_preference']}")
        print(f"   ⚡ 难度: {requirements['difficulty_preference']}")
        print(f"   🥗 饮食要求: {', '.join(requirements['dietary_requirements'])}")
        print(f"   🔥 热量偏好: {requirements['calorie_preference']}")
        print(f"   👥 份数: {requirements['serving_size']}人份")

        # 调用生成器，生成菜谱
        print("👨‍🍳 正在生成菜谱...")
        recipe_json = generator.generate_recipe(
            ingredients=requirements["ingredients"],
            cuisine_type=requirements["cuisine_preference"],
            difficulty=requirements["difficulty_preference"],
            max_cook_time=requirements["max_cook_time_mins"],
            dietary_requirements=requirements["dietary_requirements"],
            calorie_preference=requirements["calorie_preference"],
            serving_size=requirements["serving_size"],
        )
        print("🎉 菜谱生成完成！")
        return recipe_json

    except ValueError as ve:
        print(f"❌ 解析用户需求时发生错误: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"❌ 生成菜谱时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/recipes/generate-image")
async def generate_recipe_image(request: RecipeImageRequest):
    """
    为已有菜谱生成菜品图片的API端点
    """
    recipe_json = request.recipe_json
    print(f"收到了图片生成请求，菜谱: {recipe_json.get('dish_name', '未知')}")

    try:
        # 调用图片生成器，生成菜品图片
        image_url = image_generator.generate_recipe_image(recipe_json)
        print(f"🎉 菜品图片生成完成！URL: {image_url}")

        # 返回包含 image_url 的对象
        return {"image_url": image_url}
    except Exception as e:
        print(f"❌ 生成菜品图片时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ingredients/analyze")
async def analyze_ingredients_from_image(file: UploadFile = File(...)):
    """
    从上传的图片中识别食材
    """
    print(f"收到图片分析请求，文件名: {file.filename}")
    print(f"文件类型: {file.content_type}")
    print(f"文件大小: {file.size if hasattr(file, 'size') else '未知'} bytes")

    try:
        # 读取上传的图片文件
        image_data = await file.read()
        image_file = io.BytesIO(image_data)
        image_file.name = file.filename  # 设置文件名，供分析器使用

        print("🔍 正在分析图片中的食材...")
        result = ingredient_analyzer.analyze_image_for_ingredients(image_file)

        if result["success"]:
            ingredients = result["ingredients"]
            print(f"✅ 图片分析成功！识别到 {len(ingredients)} 种食材: {ingredients}")
            return {
                "success": True,
                "ingredients": ingredients,
                "confidence": result.get("confidence", "unknown"),
            }
        else:
            print(f"❌ 图片分析失败: {result.get('error', '未知错误')}")
            return {
                "success": False,
                "error": result.get("error", "图片分析失败"),
                "ingredients": [],
            }

    except Exception as e:
        print(f"❌ 处理图片时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/recipes/optimize")
async def optimize_recipe(request: RecipeOptimizeRequest):
    """
    优化现有菜谱的API端点
    """
    current_recipe = request.current_recipe
    user_request = request.user_request
    conversation_history = request.conversation_history

    print("收到菜谱优化请求:")
    print(f"  当前菜谱: {current_recipe.get('dish_name', '未知')}")
    print(f"  用户需求: {user_request}")
    print(f"  对话历史: {len(conversation_history)} 条消息")

    try:
        print("🔧 正在优化菜谱...")
        result = recipe_optimizer.optimize_recipe(
            current_recipe=current_recipe,
            user_request=user_request,
            conversation_history=conversation_history,
        )

        # 检查是否是非菜谱话题的提醒
        if result.get("type") == "off_topic_reminder":
            print(f"⚠️ 检测到非菜谱话题，返回提醒: {result.get('message', '')}")
            return {
                "type": "off_topic_reminder",
                "message": result.get("message", "请专注于菜谱优化相关的话题。"),
            }

        print(f"✅ 菜谱优化完成！新菜品: {result.get('dish_name', '未知')}")
        return result

    except ValueError as ve:
        print(f"❌ 优化菜谱时发生参数错误: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"❌ 优化菜谱时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/intent/analyze")
async def analyze_intent(request: IntentAnalysisRequest):
    """
    分析用户消息的意图，判断是否为菜谱生成需求
    """
    message = request.message
    print(f"收到意图分析请求: {message}")

    try:
        print("🔍 正在分析用户意图...")
        is_recipe_request = await _analyze_recipe_intent(message)

        print(f"✅ 意图分析完成！是否为菜谱需求: {is_recipe_request}")
        return {"is_recipe_request": is_recipe_request, "message": message}

    except Exception as e:
        print(f"❌ 意图分析时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def _analyze_recipe_intent(message: str) -> bool:
    """
    使用 LLM 分析用户意图是否为菜谱生成需求
    """
    from openai import OpenAI
    import os

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    system_prompt = """
你是一个专门的意图识别助手。你的任务是判断用户的消息是否表达了"想要生成菜谱"的意图。

菜谱生成意图包括：
1. 明确表达想要做菜、烹饪的需求（如"我想做菜"、"帮我做个菜"）
2. 提到食材并想要制作食物（如"我有土豆和牛肉，想做点什么"）
3. 描述菜系、口味、时间等烹饪需求（如"想要一道简单的中式菜"、"半小时内完成的菜"）
4. 询问特定食材的做法（如"土豆怎么做好吃"）
5. 表达对特定菜品的制作需求（如"我想学做宫保鸡丁"）

非菜谱生成意图包括：
1. 一般性问候（如"你好"、"天气怎么样"）
2. 询问其他信息（如"你是谁"、"你能做什么"）
3. 与烹饪无关的话题（如"今天股市如何"、"推荐个电影"）

请只回答 "是" 或 "否"，不要有其他内容。
"""

    user_prompt = f'用户消息："{message}"\n\n这个消息是否表达了菜谱生成的意图？'

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            max_completion_tokens=10,
        )

        result = response.choices[0].message.content.strip()
        return result == "是"

    except Exception as e:
        print(f"LLM 意图分析失败: {str(e)}")
        # 如果 LLM 调用失败，返回 False，让前端使用关键词兜底
        return False
