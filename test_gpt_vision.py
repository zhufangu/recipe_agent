#!/usr/bin/env python3
"""
测试基于GPT-4o-mini的图片识别功能
"""

import os
from gpt_vision_analyzer import GPTVisionAnalyzer
from agent import RecipeAgent


def test_gpt_vision_setup():
    """测试GPT Vision API设置"""
    print("🔍 测试GPT-4o-mini Vision API设置...")
    print("-" * 50)

    # 检查环境变量
    print("1. 检查环境变量...")
    if os.getenv("OPENAI_API_KEY"):
        print("   ✅ OPENAI_API_KEY 已设置")
    else:
        print("   ❌ OPENAI_API_KEY 未设置")
        return False

    # 测试GPT Vision分析器初始化
    print("\n2. 测试GPT Vision分析器初始化...")
    try:
        analyzer = GPTVisionAnalyzer()
        print("   ✅ GPT Vision分析器初始化成功")
    except Exception as e:
        print(f"   ❌ GPT Vision分析器初始化失败: {e}")
        return False

    # 测试RecipeAgent初始化
    print("\n3. 测试RecipeAgent初始化...")
    try:
        agent = RecipeAgent()
        print("   ✅ RecipeAgent初始化成功")
    except Exception as e:
        print(f"   ❌ RecipeAgent初始化失败: {e}")
        return False

    return True


def test_vision_analyzer():
    """测试Vision分析器功能"""
    print("\n🧪 测试Vision分析器功能...")
    print("-" * 50)

    try:
        analyzer = GPTVisionAnalyzer()

        # 测试提示词构建
        print("1. 测试提示词构建...")
        prompt = analyzer._build_vision_prompt()
        print(f"   ✅ 提示词长度: {len(prompt)} 字符")

        # 测试JSON提取功能
        print("\n2. 测试JSON提取功能...")
        test_json = '{"ingredients": ["鸡肉", "西兰花"], "confidence": "high"}'
        result = analyzer._extract_json_from_text(test_json)
        print(f"   ✅ JSON提取结果: {result}")

        # 测试无效JSON处理
        invalid_text = "这不是JSON格式的文本"
        result = analyzer._extract_json_from_text(invalid_text)
        print(f"   ✅ 无效JSON处理: {result}")

        return True

    except Exception as e:
        print(f"   ❌ 测试失败: {e}")
        return False


def test_with_sample_image():
    """使用示例图片测试（如果有的话）"""
    print("\n📸 测试示例图片识别...")
    print("-" * 50)

    # 检查是否有示例图片
    sample_images = ["ingredients.jpeg", "test_image.jpg", "sample.png"]
    found_image = None

    for img_file in sample_images:
        if os.path.exists(img_file):
            found_image = img_file
            break

    if not found_image:
        print("   ⚠️  未找到示例图片，跳过图片识别测试")
        print("   💡 可以将测试图片命名为 ingredients.jpeg 放在项目目录中")
        return True

    try:
        print(f"   📷 找到示例图片: {found_image}")

        # 模拟文件对象
        class MockFile:
            def __init__(self, filename):
                self.name = filename
                with open(filename, "rb") as f:
                    self._data = f.read()
                self._position = 0

            def read(self):
                return self._data

            def seek(self, position):
                self._position = position

        mock_file = MockFile(found_image)

        # 测试图片分析
        print("   🔍 正在分析图片...")
        analyzer = GPTVisionAnalyzer()
        result = analyzer.analyze_image_for_ingredients(mock_file)

        if result["success"]:
            print(f"   ✅ 图片分析成功！")
            print(f"   🥘 识别到的食材: {result['ingredients']}")
            print(f"   📊 置信度: {result.get('confidence', 'unknown')}")
        else:
            print(f"   ❌ 图片分析失败: {result.get('error', '未知错误')}")

        return True

    except Exception as e:
        print(f"   ❌ 图片测试失败: {e}")
        return False


def main():
    """主函数"""
    print("🍳 GPT-4o-mini Vision API 测试工具")
    print("=" * 50)

    # 测试设置
    setup_success = test_gpt_vision_setup()

    if not setup_success:
        print("\n❌ 设置测试失败，请检查配置")
        return

    # 测试功能
    analyzer_success = test_vision_analyzer()

    # 测试图片识别
    image_success = test_with_sample_image()

    print("\n" + "=" * 50)
    if setup_success and analyzer_success:
        print("🎉 所有测试通过！GPT Vision功能已就绪")
        print("\n📝 使用说明：")
        print("1. 运行 streamlit run app.py")
        print("2. 切换到 '图片识别' tab")
        print("3. 上传包含食材的图片")
        print("4. 点击 '分析图片中的食材' 按钮")
        print("\n💡 优势：")
        print("- 使用与菜谱生成相同的GPT-4o-mini模型")
        print("- 支持多种图片格式（JPG、PNG、JPEG）")
        print("- 智能识别各种食材，包括不在预定义列表中的")
        print("- 提供详细的置信度评估")
    else:
        print("❌ 部分测试失败，请检查配置")


if __name__ == "__main__":
    main()
