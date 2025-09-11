import os
from http import HTTPStatus
from dashscope import ImageSynthesis
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()


class QwenImageGenerator:
    """
    使用阿里云通义千问官方SDK (dashscope) 生成菜品图片的工具。
    集成了高级的动态Prompt构建逻辑，并采用简洁的同步调用方式。
    """

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
            # 1. 使用高级逻辑构建一个高质量的Prompt
            prompt = self._compose_prompt_from_recipe(recipe_json)
            print("📸 正在使用动态生成的Prompt调用通义千问SDK...")
            # 打印部分Prompt用于调试，避免过长刷屏
            print(f"   - Prompt: {prompt[:120]}...")

            # 2. 使用简洁的SDK进行同步调用
            response = ImageSynthesis.call(
                model="wanx-v1",
                prompt=prompt,
                api_key=self.api_key,
                n=1,
                size="1024*1024",
                style="<photo-realistic>",  # 明确指定写实摄影风格
                # 添加negative_prompt以提升图片质量，避免出现不想要的元素
                negative_prompt="文字, 水印, logo, 筷子, 叉子, 勺子, 人脸, 手部, 夸张变形",
            )

            # 3. 处理返回结果
            if response.status_code == HTTPStatus.OK:
                image_url = response.output.results[0].url
                print(f"🎉 图片生成成功! URL: {image_url}")
                return image_url
            else:
                # 打印详细的官方错误信息，方便排查问题
                print(f"❌ 图片生成任务失败, 状态码: {response.status_code}")
                print(f"   错误码: {response.code}")
                print(f"   错误信息: {response.message}")
                return None

        except Exception as e:
            print(f"❌ 图片生成过程中发生SDK调用错误: {e}")
            return None

    def _compose_prompt_from_recipe(self, recipe: Dict[str, Any]) -> str:
        """
        将结构化菜谱转换为高质量的中文图像生成提示词。
        """
        name = recipe.get("dish_name", "")
        desc = recipe.get("description", "")
        cuisine = recipe.get("cuisine_type", "")

        style_bias = []
        # 根据菜系动态添加风格描述
        if "中" in cuisine:
            style_bias.append(
                "中式家常菜风格, 温暖的灯光, 菜品盛放在一个精美的青花瓷盘中, 放在深色木质桌面上"
            )
        elif "西" in cuisine:
            style_bias.append(
                "现代简约西式摆盘, 浅景深摄影, 干净的白色大瓷盘, 侧面有柔和的自然光"
            )
        else:
            style_bias.append("专业美食摄影, 浅景深, 极简背景, 突出食物本身")

        # 组合成最终的Prompt
        final_prompt = (
            f"特写镜头, '{name}', {desc}。 "
            f"{' '.join(style_bias)}. "
            "突出菜肴的质感与光泽, 背景干净明亮, 画面充满食欲, 照片级真实感, 电影级光效, 细节丰富, 高清画质, 8K"
        )
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
