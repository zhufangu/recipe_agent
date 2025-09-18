from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # 为了允许前端调用
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()
# 1. 从 parser.py 文件导入需要的类
from parser import RecipeRequirementsParser
from generator import RecipeGenerator
from image_generator import QwenImageGenerator
# from gpt_vision_analyzer import GPTVisionAnalyzer


app = FastAPI()

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许你的Next.js前端访问
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecipeImageRequest(BaseModel):
    recipe_json: Dict[str, Any]


class RecipeRequest(BaseModel):
    description: str


# 2. 在API函数外创建解析器的实例
# 这样应用启动时就创建好了，不用每次请求都重新创建一个，效率更高
parser = RecipeRequirementsParser()
generator = RecipeGenerator()
image_generator = QwenImageGenerator()
# gpt_vision_analyzer = GPTVisionAnalyzer()


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
        # 3. 调用解析器，解析用户需求
        print("🔍 正在解析您的需求...")
        requirements = parser.parse_requirements(user_description)
        print(f"✅ 解析完成！识别到：")
        print(f"   🥘 食材: {', '.join(requirements['ingredients'])}")
        print(f"   🕐 最大烹饪时间: {requirements['max_cook_time_mins']}分钟")
        print(f"   🍽️ 菜系: {requirements['cuisine_preference']}")
        print(f"   ⚡ 难度: {requirements['difficulty_preference']}")
        print(f"   🥗 饮食要求: {', '.join(requirements['dietary_requirements'])}")
        print(f"   🔥 热量偏好: {requirements['calorie_preference']}")
        print(f"   👥 份数: {requirements['serving_size']}人份")

        # 4. 调用生成器，生成菜谱
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
        # 3. 调用图片生成器，生成菜品图片
        image_url = image_generator.generate_recipe_image(recipe_json)
        print(f"🎉 菜品图片生成完成！URL: {image_url}")

        # 返回包含 image_url 的对象
        return {"image_url": image_url}
    except Exception as e:
        print(f"❌ 生成菜品图片时发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
