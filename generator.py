from openai import OpenAI
from typing import List, Dict, Any, Optional
import json
import os


class RecipeGenerator:
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化RecipeGenerator

        Args:
            api_key: OpenAI API密钥，如果不提供则从环境变量OPENAI_API_KEY获取
        """
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))

    def generate_recipe(
        self,
        ingredients: List[str],
        cuisine_type: str = "中式",
        difficulty: str = "中等",
        max_cook_time: Optional[int] = None,
        dietary_requirements: Optional[List[str]] = None,
        calorie_preference: Optional[str] = None,
        serving_size: int = 2,
    ) -> Dict[str, Any]:
        """
        根据食材列表和约束条件生成结构化菜谱
        """

        if not ingredients:
            raise ValueError("食材列表不能为空")

        # System Prompt: 定义所有不变的规则（角色+通用指令）
        system_prompt = """
你是一位富有创意且乐于助人的专业厨师和营养师，专注于简单易学的家常菜。
你的核心任务是根据用户提供的食材和约束条件，创作一份美味、步骤清晰的菜谱。
你必须严格按照要求的JSON格式返回结果，除了JSON本身，不要包含任何额外的解释、注释或标题。
重要规则：JSON的“键”(key)必须是全英文小写蛇形命名法(snake_case)，但JSON的“值”(value)（例如菜品名称、描述、步骤等）必须使用简体中文。
"""

        # 构建本次任务的具体提示词
        # User Prompt: 只包含本次任务的动态信息（食材、约束条件等）
        user_prompt = self._build_prompt(
            ingredients,
            cuisine_type,
            difficulty,
            max_cook_time,
            dietary_requirements,
            calorie_preference,
            serving_size,
        )

        try:
            # 调用OpenAI API，强制返回JSON格式
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    # <<< 将定义好的系统指令放在这里 >>>
                    {"role": "system", "content": system_prompt},
                    # <<< user_prompt现在只包含本次任务的动态信息 >>>
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_completion_tokens=1500,
                response_format={"type": "json_object"},
            )

            # 解析响应 - 由于使用了response_format，保证返回有效JSON
            recipe_text = response.choices[0].message.content.strip()
            return json.loads(recipe_text)

        except Exception as e:
            raise Exception(f"调用OpenAI API时发生错误: {str(e)}")

    def _build_prompt(
        self,
        ingredients: List[str],
        cuisine_type: str,
        difficulty: str,
        max_cook_time: Optional[int] = None,
        dietary_requirements: Optional[List[str]] = None,
        calorie_preference: Optional[str] = None,
        serving_size: int = 2,
    ) -> str:
        """构建发送给OpenAI的提示词"""
        ingredients_str = "、".join(ingredients)

        # 构建约束条件描述
        constraints = []
        if max_cook_time:
            constraints.append(f"总烹饪时间不超过{max_cook_time}分钟")
        if dietary_requirements:
            constraints.append(f"饮食要求：{', '.join(dietary_requirements)}")
        if calorie_preference:
            constraints.append(f"热量偏好：{calorie_preference}")

        constraints_str = (
            "\n".join([f"- {c}" for c in constraints]) if constraints else "无特殊要求"
        )

        # 构建本次任务的具体提示词
        # _build_prompt 现在只负责构建“任务本身”，不再包含角色设定
        prompt = f"""
请根据以下具体信息创作一份菜谱：

食材：{ingredients_str}
菜系：{cuisine_type}
难度：{difficulty}
份数：{serving_size}人份

约束条件：
{constraints_str}

---
**重要规则：JSON的“键”(key)必须是全英文小写蛇形命名法(snake_case)，但JSON的“值”(value)（例如菜品名称、描述、步骤等）必须使用简体中文。**

请使用以下全英文小写蛇形命名法(snake_case)的key来构建JSON：
{{
    "dish_name": "菜品名称",
    "description": "对这道菜的简短描述，2-3句话",
    "cuisine_type": "{cuisine_type}",
    "difficulty": "{difficulty}",
    "prep_time_mins": 15,          // 准备时间(分钟)，必须是整数
    "cook_time_mins": 20,          // 烹饪时间(分钟)，必须是整数
    "servings": 2,                 // 份数，必须是整数
    "ingredients": [
        {{
            "name": "食材名称",
            "amount": 2,           // 用量，必须是数字(整数或浮点数)
            "unit": "个"           // 单位，例如 "g", "ml", "个", "汤匙"
        }}
    ],
    "instructions": [
        {{
            "step": 1,
            "description": "详细的步骤描述"
        }}
    ],
    "tips": ["一个实用的烹饪小贴士"],
    "nutritional_info": {{
        "calories_kcal": 350,      // 预估卡路里(大卡)，必须是整数
        "protein_g": 30,           // 蛋白质(克)，必须是整数
        "carbs_g": 25,             // 碳水化合物(克)，必须是整数
        "fat_g": 15                // 脂肪(克)，必须是整数
    }}
}}
"""
        return prompt
