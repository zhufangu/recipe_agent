import base64
import io
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class GPTVisionAnalyzer:
    """基于GPT-4o-mini的图片分析器"""

    def __init__(self, api_key: Optional[str] = None):
        """
        初始化GPT Vision分析器

        Args:
            api_key: OpenAI API密钥
        """
        self.api_key = api_key or self._get_api_key()
        self.client = OpenAI(api_key=self.api_key)

    def _get_api_key(self) -> str:
        """获取OpenAI API密钥"""
        import os

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("未找到OPENAI_API_KEY环境变量")
        return api_key

    def _encode_image(self, image_file) -> str:
        """
        将图片文件编码为base64字符串

        Args:
            image_file: 图片文件对象

        Returns:
            base64编码的图片字符串
        """
        # 重置文件指针到开头
        image_file.seek(0)

        # 读取图片数据
        image_data = image_file.read()

        # 编码为base64
        base64_image = base64.b64encode(image_data).decode("utf-8")

        # 根据文件类型确定MIME类型
        file_extension = image_file.name.split(".")[-1].lower()
        mime_type = f"image/{file_extension}"

        return f"data:{mime_type};base64,{base64_image}"

    def analyze_image_for_ingredients(self, image_file) -> Dict[str, Any]:
        """
        分析图片中的食材

        Args:
            image_file: 图片文件对象

        Returns:
            包含识别结果的字典
        """
        try:
            # 编码图片
            base64_image = self._encode_image(image_file)

            # 构建提示词
            prompt = self._build_vision_prompt()

            # 调用GPT-4o-mini Vision API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": base64_image}},
                        ],
                    }
                ],
                max_tokens=1000,
                temperature=0.3,
            )

            # 解析响应
            content = response.choices[0].message.content

            # 解析JSON响应
            import json

            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                # 如果解析失败，尝试提取JSON部分
                result = self._extract_json_from_text(content)

            return {
                "success": True,
                "ingredients": result.get("ingredients", []),
                "raw_response": content,
                "confidence": result.get("confidence", "unknown"),
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "ingredients": [],
                "raw_response": "",
                "confidence": "unknown",
            }

    def _build_vision_prompt(self) -> str:
        """构建图片分析的提示词"""
        return """请仔细分析这张图片中的食材，并返回一个JSON格式的结果。

要求：
1. 识别图片中所有可见的食材
2. 使用中文名称
3. 只识别食材，不要识别餐具、容器等
4. 如果图片中没有食材，返回空列表
5. 对识别结果给出置信度评估

请严格按照以下JSON格式返回结果：
{
    "ingredients": ["食材1", "食材2", "食材3"],
    "confidence": "high/medium/low",
    "description": "对图片中食材的简要描述"
}

示例：
{
    "ingredients": ["鸡肉", "西兰花", "胡萝卜", "洋葱"],
    "confidence": "high",
    "description": "图片显示了一盘包含鸡肉、西兰花、胡萝卜和洋葱的菜品"
}"""

    def _extract_json_from_text(self, text: str) -> Dict[str, Any]:
        """
        从文本中提取JSON内容

        Args:
            text: 包含JSON的文本

        Returns:
            解析后的字典
        """
        import json
        import re

        # 尝试找到JSON部分
        json_pattern = r"\{.*\}"
        match = re.search(json_pattern, text, re.DOTALL)

        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # 如果找不到JSON，返回默认结构
        return {"ingredients": [], "confidence": "unknown", "description": text}

    def get_ingredients_text(self, image_file) -> str:
        """
        获取图片中识别到的食材文本描述

        Args:
            image_file: 图片文件对象

        Returns:
            食材文本描述
        """
        result = self.analyze_image_for_ingredients(image_file)

        if not result["success"]:
            return "图片分析失败"

        ingredients = result["ingredients"]

        if not ingredients:
            return "未识别到明显的食材，请尝试上传更清晰的食材图片"

        return "、".join(ingredients)


def test_gpt_vision_analyzer():
    """测试GPT Vision分析器"""
    try:
        analyzer = GPTVisionAnalyzer()
        print("✅ GPT Vision分析器初始化成功")
        return True
    except Exception as e:
        print(f"❌ GPT Vision分析器初始化失败: {e}")
        return False


if __name__ == "__main__":
    test_gpt_vision_analyzer()
