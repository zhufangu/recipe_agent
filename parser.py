from openai import OpenAI
from typing import Dict, Any, Optional
import json
import os


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