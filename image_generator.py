import os
import dashscope
from dashscope import MultiModalConversation
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()


class QwenImageGenerator:
    """
    使用阿里云通义千问 MultiModalConversation API 生成菜品图片的工具。
    基于成功的测试代码进行优化。
    """

    MODEL = "qwen-image"

    def __init__(self):
        """
        初始化客户端。SDK会自动从环境变量加载API密钥。
        """
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise ValueError("请在.env文件中设置您的 DASHSCOPE_API_KEY")

    def generate_recipe_image(self, recipe_json: Dict[str, Any]) -> str | None:
        """
        根据完整的菜谱JSON生成图片的主方法。

        Args:
            recipe_json: 包含菜谱所有信息的JSON字典。

        Returns:
            成功则返回图片URL，失败则返回None。
        """
        try:
            # 1. 构建高质量的中文Prompt
            prompt = self._compose_prompt_from_recipe(recipe_json)
            print("📸 正在使用 MultiModalConversation API (qwen-image) 生成图片...")
            print(f"   - Prompt: {prompt[:200]}...")

            # 2. 使用正确的消息格式调用API
            messages = [
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ]

            # 3. 调用 MultiModalConversation API
            response = MultiModalConversation.call(
                model=self.MODEL,
                messages=messages,
                api_key=self.api_key,
            )

            # 4. 处理返回结果
            if response.status_code == 200:
                print("🎉 图片生成成功！")
                # 按照你的成功代码解析结果
                image_url = response.output.choices[0].message.content[0]["image"]
                print(f"   - 图片URL: {image_url}")
                return image_url
            else:
                print(f"❌ 图片生成失败，HTTP返回码：{response.status_code}")
                print(f"   - 错误码：{response.code}")
                print(f"   - 错误信息：{response.message}")
                return None

        except Exception as e:
            print(f"❌ 图片生成过程中发生错误: {e}")
            return None

    def _compose_prompt_from_recipe(self, recipe: Dict[str, Any]) -> str:
        """
        将结构化菜谱转换为高质量的中文图像生成提示词。
        基于你成功的测试代码进行优化。
        """
        name = recipe.get("dish_name", "一道美味的菜肴")

        # 提取核心食材
        ingredients = recipe.get("ingredients", [])
        key_ingredients = [
            ing.get("name") for ing in ingredients[:3] if ing.get("name")
        ]
        ingredients_str = ", ".join(key_ingredients)

        # 构建高质量的中文Prompt（基于你成功的测试代码）
        core_prompt = f"一道精美的 '{name}' 美食照片, 清晰地展示出 {ingredients_str}。"

        # 风格关键词（基于你成功的测试代码）
        keywords = "专业美食摄影, 温暖的灯光, 菜品盛放在一个精美的白色瓷盘中, 放在简约的木质桌面上, 浅景深, 突出菜肴的质感与光泽, 背景干净明亮, 画面充满食欲, 照片级真实感, 电影级光效, 细节丰富, 高清画质"

        final_prompt = f"{core_prompt} {keywords}"
        return final_prompt.strip()


# 用于独立测试本文件的模块
if __name__ == "__main__":
    print("--- 开始独立测试图片生成模块 ---")

    # 模拟一个菜谱JSON用于测试
    mock_recipe = {
        "dish_name": "家常红烧肉",
        "description": "色泽红亮诱人，肥而不腻，入口即化，酱汁浓郁",
        "cuisine_type": "中式家常",
        "difficulty": "中等",
        "ingredients": [
            {"name": "五花肉", "unit": "g"},
            {"name": "生姜", "unit": "g"},
            {"name": "大葱", "unit": "g"},
        ],
    }

    try:
        image_gen = QwenImageGenerator()
        url = image_gen.generate_recipe_image(mock_recipe)

        if url:
            print(f"\n✅ 测试成功，生成的图片URL是: {url}")
        else:
            print("\n❌ 测试失败，未能获取图片URL。请检查API Key和网络连接。")

    except ValueError as e:
        print(f"初始化失败: {e}")
    except Exception as e:
        print(f"测试过程中发生未知错误: {e}")
