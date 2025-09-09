import json
import os
import re
from typing import List, Dict, Any, Optional, Union
from openai import OpenAI
# 导入 load_dotenv
from dotenv import load_dotenv

# 在所有代码之前执行它，这样.env文件里的变量就会被加载到环境中
load_dotenv()


class RecipeRequirementsParser:
    """自然语言需求解析器，将用户的自然语言描述转换为结构化需求"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化解析器
        
        Args:
            api_key: OpenAI API密钥，如果不提供则从环境变量OPENAI_API_KEY获取
        """
        self.client = OpenAI(
            api_key=api_key or os.getenv('OPENAI_API_KEY')
        )
    
    def parse_requirements(self, user_input: str) -> Dict[str, Any]:
        """
        解析用户的自然语言需求
        
        Args:
            user_input: 用户的自然语言描述，如"我冰箱里有牛肉和洋葱，想做个半小时内搞定的快手菜，别太辣"
            
        Returns:
            结构化的需求字典，包含：
            {
                "ingredients": ["食材1", "食材2"],
                "max_cook_time_mins": 30,
                "dietary_requirements": ["不辣", "快手菜"],
                "cuisine_preference": "中式",
                "difficulty_preference": "简单",
                "calorie_preference": "低热量",
                "serving_size": 2
            }
        """
        
        if not user_input.strip():
            raise ValueError("用户输入不能为空")
        
        # 构建解析提示词
        prompt = self._build_parse_prompt(user_input)
        
        try:
            # 调用OpenAI API进行解析
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个专业的菜谱需求分析助手，擅长从用户的自然语言描述中提取结构化的菜谱需求信息。请严格按照要求的JSON格式返回结果。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # 降低温度以获得更一致的结果
                max_completion_tokens=800,
                response_format={"type": "json_object"}
            )
            
            # 解析响应
            requirements_text = response.choices[0].message.content.strip()
            requirements = json.loads(requirements_text)
            
            # 验证和补充默认值
            return self._validate_and_complete_requirements(requirements)
            
        except Exception as e:
            raise Exception(f"解析用户需求时发生错误: {str(e)}")
    
    def _build_parse_prompt(self, user_input: str) -> str:
        """构建解析提示词"""
        prompt = f"""
请分析以下用户的菜谱需求描述，并提取出结构化的信息：

用户描述："{user_input}"

请从描述中提取以下信息，并以JSON格式返回：

{{
    "ingredients": ["从描述中提取的所有食材名称"],
    "max_cook_time_mins": 30,  // 最大烹饪时间（分钟），如果没有明确提到则设为null
    "dietary_requirements": ["饮食要求，如'不辣'、'素食'、'低盐'等"],
    "cuisine_preference": "中式",  // 菜系偏好，如果没有提到则设为null
    "difficulty_preference": "简单",  // 难度偏好，如果没有提到则设为null
    "calorie_preference": "低热量",  // 热量偏好，如'低热量'、'高蛋白'等，如果没有提到则设为null
    "serving_size": 2  // 份数，如果没有提到则设为2
}}

提取规则：
1. 仔细识别所有食材名称，包括蔬菜、肉类、调料等
2. 识别时间相关词汇：半小时=30分钟，一小时=60分钟，快手菜=15-30分钟等
3. 识别饮食限制：不辣、素食、低盐、无糖等
4. 识别菜系偏好：中式、西式、日式、韩式等
5. 识别难度偏好：简单、快手、复杂等
6. 识别热量偏好：低热量、高蛋白、减肥餐等
7. 如果某个信息在描述中没有明确提到，则设为null

请只返回JSON格式，不要包含其他文字。
"""
        return prompt
    
    def _validate_and_complete_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """验证和补充需求信息"""
        # 确保必需字段存在
        validated = {
            "ingredients": requirements.get("ingredients", []),
            "max_cook_time_mins": requirements.get("max_cook_time_mins"),
            "dietary_requirements": requirements.get("dietary_requirements", []),
            "cuisine_preference": requirements.get("cuisine_preference"),
            "difficulty_preference": requirements.get("difficulty_preference"),
            "calorie_preference": requirements.get("calorie_preference"),
            "serving_size": requirements.get("serving_size", 2)
        }
        
        # 验证食材列表
        if not validated["ingredients"]:
            raise ValueError("未能从描述中识别出任何食材")
        
        # 设置默认值
        if validated["cuisine_preference"] is None:
            validated["cuisine_preference"] = "中式"
        
        if validated["difficulty_preference"] is None:
            validated["difficulty_preference"] = "中等"
        
        return validated


class RecipeGenerator:
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化RecipeGenerator
        
        Args:
            api_key: OpenAI API密钥，如果不提供则从环境变量OPENAI_API_KEY获取
        """
        self.client = OpenAI(
            api_key=api_key or os.getenv('OPENAI_API_KEY')
        )
    
    def generate_recipe(self, ingredients: List[str], cuisine_type: str = "中式", 
                       difficulty: str = "中等", max_cook_time: Optional[int] = None,
                       dietary_requirements: Optional[List[str]] = None,
                       calorie_preference: Optional[str] = None,
                       serving_size: int = 2) -> Dict[str, Any]:
        """
        根据食材列表和约束条件生成结构化菜谱
        
        Args:
            ingredients: 食材列表
            cuisine_type: 菜系类型，默认为"中式"
            difficulty: 难度等级，可选："简单"、"中等"、"困难"
            max_cook_time: 最大烹饪时间（分钟），如果指定则必须在此时间内完成
            dietary_requirements: 饮食要求列表，如["不辣", "素食", "低盐"]
            calorie_preference: 热量偏好，如"低热量"、"高蛋白"
            serving_size: 份数，默认为2
            
        Returns:
            包含菜谱信息的字典，格式如下：
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
        """
        
        if not ingredients:
            raise ValueError("食材列表不能为空")
        
        # 构建提示词
        prompt = self._build_prompt(ingredients, cuisine_type, difficulty, 
                                  max_cook_time, dietary_requirements, 
                                  calorie_preference, serving_size)
        
        try:
            # 调用OpenAI API，强制返回JSON格式
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个专业的厨师和营养师，擅长根据提供的食材创建美味且营养均衡的菜谱。请严格按照要求的JSON格式返回结果。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_completion_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            # 解析响应 - 由于使用了response_format，保证返回有效JSON
            recipe_text = response.choices[0].message.content.strip()
            return json.loads(recipe_text)
                
        except Exception as e:
            raise Exception(f"调用OpenAI API时发生错误: {str(e)}")
    
    def _build_prompt(self, ingredients: List[str], cuisine_type: str, difficulty: str,
                     max_cook_time: Optional[int] = None,
                     dietary_requirements: Optional[List[str]] = None,
                     calorie_preference: Optional[str] = None,
                     serving_size: int = 2) -> str:
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
        
        constraints_str = "\n".join([f"- {c}" for c in constraints]) if constraints else "无特殊要求"
        
        prompt = f"""
你是一位富有创意且乐于助人的专业厨师和营养师，专注于简单易学的家常菜。
你的任务是根据用户提供的食材和约束条件，创作一份美味、步骤清晰的菜谱。

请严格按照以下要求，返回一个结构化的JSON对象。除了JSON本身，不要包含任何额外的解释、注释或标题。

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
    


def generate_recipe_from_ingredients(ingredients: List[str], 
                                   cuisine_type: str = "中式",
                                   difficulty: str = "中等",
                                   api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    便捷函数：根据食材列表生成菜谱
    
    Args:
        ingredients: 食材列表
        cuisine_type: 菜系类型，默认为"中式"
        difficulty: 难度等级，默认为"中等"
        api_key: OpenAI API密钥
        
    Returns:
        结构化的菜谱JSON
    """
    generator = RecipeGenerator(api_key)
    return generator.generate_recipe(ingredients, cuisine_type, difficulty)


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
            print(f"   🕐 最大烹饪时间: {requirements['max_cook_time_mins']}分钟" if requirements['max_cook_time_mins'] else "   🕐 烹饪时间: 无限制")
            print(f"   🍽️ 菜系: {requirements['cuisine_preference']}")
            print(f"   ⚡ 难度: {requirements['difficulty_preference']}")
            if requirements['dietary_requirements']:
                print(f"   🥗 饮食要求: {', '.join(requirements['dietary_requirements'])}")
            if requirements['calorie_preference']:
                print(f"   🔥 热量偏好: {requirements['calorie_preference']}")
            print(f"   👥 份数: {requirements['serving_size']}人份")
            
            # 第二步：生成菜谱
            print("\n👨‍🍳 正在生成菜谱...")
            recipe = self.generator.generate_recipe(
                ingredients=requirements['ingredients'],
                cuisine_type=requirements['cuisine_preference'],
                difficulty=requirements['difficulty_preference'],
                max_cook_time=requirements['max_cook_time_mins'],
                dietary_requirements=requirements['dietary_requirements'],
                calorie_preference=requirements['calorie_preference'],
                serving_size=requirements['serving_size']
            )
            
            print("✅ 菜谱生成完成！")
            return recipe
            
        except Exception as e:
            raise Exception(f"生成菜谱时发生错误: {str(e)}")
    
    def generate_recipe_from_ingredients(self, ingredients: List[str], 
                                       cuisine_type: str = "中式",
                                       difficulty: str = "中等",
                                       **kwargs) -> Dict[str, Any]:
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
            **kwargs
        )


def generate_recipe_from_natural_language(user_input: str, 
                                        api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    便捷函数：从自然语言描述生成菜谱
    
    Args:
        user_input: 用户的自然语言描述
        api_key: OpenAI API密钥
        
    Returns:
        结构化的菜谱JSON
    """
    agent = RecipeAgent(api_key)
    return agent.generate_recipe_from_natural_language(user_input)


# 示例使用
if __name__ == "__main__":
    # 创建一个Agent实例
    agent = RecipeAgent()
    
    # 你的自然语言需求
    user_prompt = "我冰箱里只有几个土豆和一块上好的牛肉，还有洋葱。我想做一道适合两个人的西餐，别太复杂，半小时左右能搞定的那种。"
    
    try:
        # 调用Agent的核心方法
        recipe = agent.generate_recipe_from_natural_language(user_prompt)
        
        # 漂亮地打印最终结果
        print("\n" + "="*50)
        print("🎉 您的专属菜谱已生成！")
        print("="*50)
        print(json.dumps(recipe, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(f"\n❌ 在处理过程中发生严重错误: {e}")
