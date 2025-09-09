import json
from typing import List, Dict, Any, Optional

from parser import RecipeRequirementsParser
from generator import RecipeGenerator


class RecipeAgent:
    """统一的菜谱生成Agent，整合自然语言解析和菜谱生成功能"""

    def __init__(self, api_key: Optional[str] = None):
        """
        初始化RecipeAgent

        Args:
            api_key: OpenAI API密钥，如果不提供则从环境变量OPENAI_API_KEY获取
        """
        self.parser = RecipeRequirementsParser(api_key)
        self.generator = RecipeGenerator(api_key)

    def generate_recipe_from_natural_language(self, user_input: str) -> Dict[str, Any]:
        """
        从自然语言描述生成菜谱（两步走流程）

        Args:
            user_input: 用户的自然语言描述，如"我冰箱里有牛肉和洋葱，想做个半小时内搞定的快手菜，别太辣"

        Returns:
            结构化的菜谱JSON
        """
        try:
            # 第一步：解析用户需求
            print("🔍 正在解析您的需求...")
            requirements = self.parser.parse_requirements(user_input)

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

            # 第二步：生成菜谱
            print("\n👨‍🍳 正在生成菜谱...")
            recipe = self.generator.generate_recipe(
                ingredients=requirements["ingredients"],
                cuisine_type=requirements["cuisine_preference"],
                difficulty=requirements["difficulty_preference"],
                max_cook_time=requirements["max_cook_time_mins"],
                dietary_requirements=requirements["dietary_requirements"],
                calorie_preference=requirements["calorie_preference"],
                serving_size=requirements["serving_size"],
            )

            print("✅ 菜谱生成完成！")
            return recipe

        except Exception as e:
            # 重新抛出异常，让调用者（比如Streamlit App）来决定如何向用户展示错误
            raise Exception(f"生成菜谱时发生错误: {str(e)}")

    def generate_recipe_from_ingredients(
        self,
        ingredients: List[str],
        cuisine_type: str = "中式",
        difficulty: str = "中等",
        **kwargs,
    ) -> Dict[str, Any]:
        """
        直接从食材列表生成菜谱（传统方式）

        Args:
            ingredients: 食材列表
            cuisine_type: 菜系类型
            difficulty: 难度等级
            **kwargs: 其他约束条件参数

        Returns:
            结构化的菜谱JSON
        """
        return self.generator.generate_recipe(
            ingredients=ingredients,
            cuisine_type=cuisine_type,
            difficulty=difficulty,
            **kwargs,
        )


# 用于单独、快速测试Agent核心逻辑的模块
if __name__ == "__main__":
    # 你的自然语言需求
    user_prompt = "我冰箱里只有几个土豆和一块上好的牛肉，还有洋葱。我想做一道适合两个人的西餐，别太复杂，半小时左右能搞定的那种。"

    try:
        # 创建一个Agent实例
        agent = RecipeAgent()
        # 调用Agent的核心方法
        recipe = agent.generate_recipe_from_natural_language(user_prompt)

        # 漂亮地打印最终结果
        print("\n" + "=" * 50)
        print("🎉 您的专属菜谱已生成！")
        print("=" * 50)
        print(json.dumps(recipe, ensure_ascii=False, indent=2))

    except Exception as e:
        print(f"\n❌ 在处理过程中发生严重错误: {e}")
