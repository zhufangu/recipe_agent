from openai import OpenAI
from typing import Dict, Any, Optional
import json
import os


class RecipeOptimizer:
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化RecipeOptimizer

        Args:
            api_key: OpenAI API密钥，如果不提供则从环境变量OPENAI_API_KEY获取
        """
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))

    def optimize_recipe(
        self,
        current_recipe: Dict[str, Any],
        user_request: str,
        conversation_history: list = None,
    ) -> Dict[str, Any]:
        """
        基于用户的具体需求优化现有菜谱

        Args:
            current_recipe: 当前的菜谱JSON
            user_request: 用户的优化需求
            conversation_history: 对话历史（可选）

        Returns:
            优化后的菜谱JSON
        """

        # System Prompt: 定义菜谱优化专家的角色
        system_prompt = """
你是一位经验丰富的菜谱优化专家和烹饪顾问。你的任务是根据用户的具体需求，对现有菜谱进行精准的优化和改进。

核心能力：
1. 深度理解用户的优化意图（技法改进、口味调整、营养优化、时间缩短等）
2. 保持菜谱的基本特色，同时融入用户要求的改进
3. 提供专业的烹饪技巧建议
4. 确保改进后的菜谱仍然实用可行
5. 识别并礼貌地引导用户回到菜谱相关话题

话题范围限制：
- 只处理与菜谱优化相关的请求（食材处理、烹饪技法、口味调整、营养改进、时间优化、难度调整等）
- 如果用户询问与菜谱无关的话题，应该礼貌地提醒用户专注于菜谱优化

重要规则：
- 如果用户的请求与菜谱优化无关，返回一个特殊的JSON格式表示需要提醒用户
- 对于菜谱相关请求，必须严格按照完整菜谱JSON格式返回结果
- JSON的"键"必须是全英文小写蛇形命名法(snake_case)
- JSON的"值"（菜品名称、描述、步骤等）必须使用简体中文
- 优化要有针对性，确实体现用户的具体需求
"""

        # 构建优化任务的具体提示词
        user_prompt = self._build_optimize_prompt(
            current_recipe, user_request, conversation_history
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.8,  # 稍微提高创造性
                max_completion_tokens=1500,
                response_format={"type": "json_object"},
            )

            recipe_text = response.choices[0].message.content.strip()
            return json.loads(recipe_text)

        except Exception as e:
            raise Exception(f"优化菜谱时发生错误: {str(e)}")

    def _build_optimize_prompt(
        self,
        current_recipe: Dict[str, Any],
        user_request: str,
        conversation_history: list = None,
    ) -> str:
        """构建菜谱优化的提示词"""

        # 提取当前菜谱的关键信息
        dish_name = current_recipe.get("dish_name", "未知菜品")
        ingredients = current_recipe.get("ingredients", [])
        instructions = current_recipe.get("instructions", [])

        ingredients_str = "、".join(
            [f"{ing['name']}({ing['amount']}{ing['unit']})" for ing in ingredients]
        )
        steps_str = "\n".join(
            [f"{step['step']}. {step['description']}" for step in instructions]
        )

        # 构建对话上下文（如果有）
        context_str = ""
        if conversation_history:
            recent_messages = conversation_history[-4:]  # 只取最近4条消息
            context_str = (
                "\n对话上下文：\n"
                + "\n".join(
                    [
                        f"{'用户' if msg.get('role') == 'user' else 'AI'}: {msg.get('content', '')}"
                        for msg in recent_messages
                    ]
                )
                + "\n"
            )

        prompt = f"""
我需要你优化以下菜谱，请特别关注用户的具体需求：

**当前菜谱信息：**
菜品名称：{dish_name}
主要食材：{ingredients_str}
制作步骤：
{steps_str}

{context_str}
**用户的优化需求：**
"{user_request}"

**首先判断用户需求是否与菜谱优化相关：**

**菜谱相关话题包括：**
- 食材处理方式（切法、腌制、预处理等）
- 烹饪技法（炒、煮、蒸、烤、炸等）
- 口味调整（更咸、更甜、更辣、更清淡等）
- 营养优化（更健康、低脂、高蛋白、素食等）
- 时间优化（更快、更慢炖、提前准备等）
- 难度调整（简化步骤、增加技巧等）
- 份量调整（增加份数、减少份数）
- 食材替换（换成其他食材、增减食材）
- 菜品外观（摆盘、颜色、形状等）

**非菜谱相关话题包括：**
- 天气、新闻、政治、娱乐等与烹饪无关的话题
- 个人生活、工作、学习等非烹饪内容
- 技术问题、软件使用等
- 其他与当前菜谱优化无关的任何话题

**处理逻辑：**

如果用户的需求与菜谱优化无关，请返回以下格式的JSON：
{{
    "type": "off_topic_reminder",
    "message": "我是专门的菜谱优化助手，只能帮您优化当前的菜谱。请告诉我您希望如何改进这道"{dish_name}"，比如：调整口味、改变烹饪方法、增减食材、简化步骤等。"
}}

如果用户的需求与菜谱优化相关，请按照以下要求优化菜谱：

**优化要求：**
1. 仔细分析用户需求的具体含义（例如："牛肉可以由切片改为切丁腌制吗" = 用户希望将牛肉处理方式由切片改为切丁并腌制）
2. 在新菜谱中明确体现这种改进（如：在食材处理或制作步骤中体现牛肉切丁腌制的做法）
3. 如果需求涉及技法改进，要在步骤中详细说明新的处理方法
4. 保持菜谱的整体风格和可操作性
5. 适当调整烹饪时间、调料用量等相关参数

**菜谱优化示例分析：**
- "牛肉可以由切片改为切丁腌制吗" → 将牛肉切成1cm小丁，用生抽、料酒、淀粉腌制15分钟，步骤中体现这个处理过程
- "想要更健康" → 减少油脂使用，增加蔬菜比例，采用蒸煮等健康烹饪方式
- "简化步骤" → 合并相似操作，减少不必要的中间步骤
- "增加蔬菜" → 在原有基础上添加适合的蔬菜，调整比例和步骤
- "改成素食版本" → 用素食食材替换肉类，调整调料和烹饪方法

请使用以下JSON格式返回优化后的菜谱：
{{
    "dish_name": "优化后的菜品名称（如果有显著改变）",
    "description": "简短描述，突出优化的特点",
    "cuisine_type": "{current_recipe.get("cuisine_type", "中式")}",
    "difficulty": "{current_recipe.get("difficulty", "中等")}",
    "prep_time_mins": 15,
    "cook_time_mins": 20,
    "servings": {current_recipe.get("servings", 2)},
    "ingredients": [
        {{
            "name": "食材名称",
            "amount": 2,
            "unit": "单位"
        }}
    ],
    "instructions": [
        {{
            "step": 1,
            "description": "详细的步骤描述，确保体现用户要求的改进"
        }}
    ],
    "tips": ["针对优化内容的实用小贴士"],
    "nutritional_info": {{
        "calories_kcal": 350,
        "protein_g": 30,
        "carbs_g": 25,
        "fat_g": 15
    }}
}}
"""
        return prompt
