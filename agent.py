import json
from typing import Dict, Any, Optional

from parser import RecipeRequirementsParser
from generator import RecipeGenerator
from image_generator import QwenImageGenerator
from gpt_vision_analyzer import GPTVisionAnalyzer

from dotenv import load_dotenv

load_dotenv()


class RecipeAgent:
    """统一的菜谱生成Agent，集成自然语言解析和菜谱生成功能，以及图片生成功能"""

    def __init__(self, api_key: Optional[str] = None):
        """
        初始化时，同时实例化所有需要的工具
        """
        # 初始化自然语言解析器实例
        self.parser = RecipeRequirementsParser(api_key)
        self.generator = RecipeGenerator(api_key)
        # 初始化图片生成器实例
        self.image_generator = QwenImageGenerator()
        # 初始化GPT Vision分析器实例
        self.vision_analyzer = GPTVisionAnalyzer(api_key)

    def generate_recipe_text_only(self, user_input: str) -> Dict[str, Any]:
        """
        从自然语言描述生成菜谱

        Args:
            user_input: 用户的自然语言描述，如"我冰箱里有牛肉和洋葱，想做个半小时内搞定的快手菜，别太辣"

        Returns:
            结构化的菜谱JSON
        """
        try:
            # 第一步：解析用户需求
            print("🔍 正在解析您的需求...")
            requirements = self.parser.parse_requirements(user_input)

            # --- 详细打印解析结果，方便调试 ---
            print(f"✅ 解析完成！识别到：")
            print(f"   🥘 食材: {', '.join(requirements['ingredients'])}")
            print(
                f"   🕐 最大烹饪时间: {requirements['max_cook_time_mins']}分钟"
                if requirements["max_cook_time_mins"]
                else "   🕐 烹饪时间: 无限制"
            )
            print(f"   🍽️ 菜系: {requirements['cuisine_preference']}")
            print(f"   ⚡ 难度: {requirements['difficulty_preference']}")
            if requirements["dietary_requirements"]:
                print(
                    f"   🥗 饮食要求: {', '.join(requirements['dietary_requirements'])}"
                )
            if requirements["calorie_preference"]:
                print(f"   🔥 热量偏好: {requirements['calorie_preference']}")
            print(f"   👥 份数: {requirements['serving_size']}人份")
            # --- 日志打印结束 ---

            # 第二步：生成菜谱
            print("\n👨‍🍳 正在生成菜谱...")
            recipe_json = self.generator.generate_recipe(
                ingredients=requirements["ingredients"],
                cuisine_type=requirements["cuisine_preference"],
                difficulty=requirements["difficulty_preference"],
                max_cook_time=requirements["max_cook_time_mins"],
                dietary_requirements=requirements["dietary_requirements"],
                calorie_preference=requirements["calorie_preference"],
                serving_size=requirements["serving_size"],
            )

            print("✅ 菜谱生成完成！")
            return recipe_json

        except Exception as e:
            # 重新抛出异常，让调用者（比如Streamlit App）来决定如何向用户展示错误
            raise Exception(f"生成菜谱时发生错误: {str(e)}")

    def generate_image_from_recipe(self, recipe_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        为已经生成的文本菜谱创建图片。
        """
        try:
            if recipe_json:
                print("\n📸 正在生成菜品图片...")
                image_url = self.image_generator.generate_recipe_image(recipe_json)
                return image_url
            return None
        except Exception as e:
            raise Exception(f"生成菜品图片时发生错误: {str(e)}")

    def identify_ingredients(self, image_file) -> list:
        """
        识别图片中的食材

        Args:
            image_file: 图片文件对象

        Returns:
            识别到的食材列表
        """
        try:
            print("🔍 正在分析图片中的食材...")
            result = self.vision_analyzer.analyze_image_for_ingredients(image_file)

            if result["success"]:
                ingredients = result["ingredients"]
                print(f"✅ 图片分析成功！识别到 {len(ingredients)} 种食材")
                return ingredients
            else:
                print(f"❌ 图片分析失败: {result.get('error', '未知错误')}")
                return []

        except Exception as e:
            print(f"❌ 图片分析时发生错误: {e}")
            return []


# 用于单独、快速测试Agent核心逻辑的模块
if __name__ == "__main__":
    # 你的自然语言需求
    user_prompt = "我冰箱里只有几个土豆和一块上好的牛肉，还有洋葱。我想做一道适合两个人的西餐，别太复杂，半小时左右能搞定的那种。"

    try:
        # 创建一个Agent实例
        agent = RecipeAgent()
        # 调用Agent的核心方法
        recipe_json = agent.generate_recipe_text_only(user_prompt)

        # 漂亮地打印最终结果
        print("\n" + "=" * 50)
        print("🎉 您的专属菜谱已生成！")
        print("=" * 50)
        print(recipe_json, json.dumps(recipe_json, ensure_ascii=False, indent=2))

    except Exception as e:
        print(f"\n❌ 在处理过程中发生严重错误: {e}")
