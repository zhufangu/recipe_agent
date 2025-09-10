from dotenv import load_dotenv

load_dotenv()

import json
import os
from unittest.mock import Mock, patch

from generator import RecipeGenerator
from agent import RecipeAgent


def test_mock_recipe_generation():
    """模拟测试 - 不需要真实API密钥"""
    print("=" * 50)
    print("🧪 模拟测试开始")
    print("=" * 50)

    # 模拟的API响应
    mock_response = {
        "dish_name": "番茄鸡蛋面",
        "description": "经典的家常面条，酸甜的番茄配上嫩滑的鸡蛋，营养丰富且制作简单。",
        "cuisine_type": "中式",
        "difficulty": "简单",
        "prep_time_mins": 10,
        "cook_time_mins": 15,
        "servings": 2,
        "ingredients": [
            {"name": "鸡蛋", "amount": 2, "unit": "个"},
            {"name": "番茄", "amount": 2, "unit": "个"},
            {"name": "面条", "amount": 200, "unit": "g"},
            {"name": "葱", "amount": 1, "unit": "根"},
            {"name": "蒜", "amount": 2, "unit": "瓣"},
            {"name": "生抽", "amount": 1, "unit": "汤匙"},
            {"name": "盐", "amount": 1, "unit": "茶匙"},
        ],
        "instructions": [
            {"step": 1, "description": "将番茄洗净切块，葱切段，蒜切末"},
            {"step": 2, "description": "鸡蛋打散，加少许盐调味"},
            {"step": 3, "description": "热锅下油，倒入蛋液炒熟盛起"},
            {"step": 4, "description": "锅内留油，下蒜爆香，加入番茄块炒出汁水"},
            {"step": 5, "description": "加入生抽调味，倒入炒蛋翻炒均匀"},
            {"step": 6, "description": "另起锅煮面条至8分熟，捞起沥干"},
            {"step": 7, "description": "将面条加入番茄鸡蛋中翻炒，撒上葱段即可"},
        ],
        "tips": ["番茄要充分炒出汁水，这样面条会更有味道"],
        "nutritional_info": {
            "calories_kcal": 420,
            "protein_g": 18,
            "carbs_g": 65,
            "fat_g": 12,
        },
    }

    # 创建模拟的OpenAI客户端
    mock_client = Mock()
    mock_choice = Mock()
    mock_choice.message.content = json.dumps(mock_response, ensure_ascii=False)
    mock_client.chat.completions.create.return_value.choices = [mock_choice]

    # 测试食材
    test_ingredients = ["鸡蛋", "番茄", "面条", "葱", "蒜", "生抽", "盐"]

    # 使用patch来替换真实的OpenAI客户端
    with patch("generator.OpenAI", return_value=mock_client):
        try:
            generator = RecipeGenerator(api_key="mock_key")
            recipe = generator.generate_recipe(test_ingredients, "中式", "简单")

            print("✅ 模拟测试成功！")
            print("\n📋 生成的菜谱：")
            print(json.dumps(recipe, ensure_ascii=False, indent=2))

            # 验证关键字段
            required_fields = [
                "dish_name",
                "ingredients",
                "instructions",
                "nutritional_info",
            ]
            for field in required_fields:
                if field not in recipe:
                    print(f"❌ 缺少必需字段: {field}")
                    return False

            print(f"\n🍽️  菜品名称: {recipe['dish_name']}")
            print(
                f"⏱️  总时间: {recipe['prep_time_mins'] + recipe['cook_time_mins']}分钟"
            )
            print(f"👥 份数: {recipe['servings']}人份")
            print(f"🔥 卡路里: {recipe['nutritional_info']['calories_kcal']}大卡")

            return True

        except Exception as e:
            print(f"❌ 模拟测试失败: {e}")
            return False


def test_real_api_agent():
    """真实API测试 - 需要有效的OpenAI API密钥"""
    print("\n" + "=" * 50)
    print("🚀 真实API测试开始")
    print("=" * 50)

    # 检查API密钥
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠️  未找到OPENAI_API_KEY环境变量")
        print("请设置API密钥后再进行真实测试:")
        print("export OPENAI_API_KEY='your-api-key-here'")
        return False

    user_input = (
        "我有一些鸡胸肉、西兰花和胡萝卜，想做一道适合健身的菜，不要太油腻，简单一点的。"
    )

    try:
        print(f"📝 测试输入: {user_input}")
        print("⏳ 正在调用OpenAI API生成菜谱...")

        agent = RecipeAgent(api_key=api_key)
        recipe = agent.generate_recipe_from_natural_language(user_input)

        # recipe = generate_recipe_from_ingredients(
        #     ingredients=test_ingredients, cuisine_type="中式", difficulty="中等"
        # )

        print("✅ 真实API Agent测试成功！")
        print("\n📋 AI生成的菜谱：")
        print(json.dumps(recipe, ensure_ascii=False, indent=2))

        print(f"\n🍽️  菜品名称: {recipe['dish_name']}")
        print(f"📝 菜品描述: {recipe.get('description', '无描述')}")
        print(f"⏱️  准备时间: {recipe['prep_time_mins']}分钟")
        print(f"🔥 烹饪时间: {recipe['cook_time_mins']}分钟")
        print(f"👥 份数: {recipe['servings']}人份")
        print(f"💪 营养信息: {recipe['nutritional_info']['calories_kcal']}大卡")

        return True

    except Exception as e:
        print(f"❌ 真实API Agent测试失败: {e}")
        return False


def test_natural_language_parsing():
    """测试自然语言解析功能"""
    print("\n" + "=" * 50)
    print("🗣️  自然语言解析测试")
    print("=" * 50)

    # 模拟解析器响应
    mock_parser_response = {
        "ingredients": ["牛肉", "洋葱", "土豆"],
        "max_cook_time_mins": 30,
        "dietary_requirements": ["不辣"],
        "cuisine_preference": "中式",
        "difficulty_preference": "简单",
        "calorie_preference": "低热量",
        "serving_size": 2,
    }

    # 模拟菜谱生成器响应
    mock_recipe_response = {
        "dish_name": "牛肉土豆丝",
        "description": "简单易做的家常菜，牛肉嫩滑，土豆爽脆，营养丰富。",
        "cuisine_type": "中式",
        "difficulty": "简单",
        "prep_time_mins": 10,
        "cook_time_mins": 15,
        "servings": 2,
        "ingredients": [
            {"name": "牛肉", "amount": 200, "unit": "g"},
            {"name": "土豆", "amount": 2, "unit": "个"},
            {"name": "洋葱", "amount": 1, "unit": "个"},
        ],
        "instructions": [
            {"step": 1, "description": "牛肉切丝，用生抽腌制10分钟"},
            {"step": 2, "description": "土豆去皮切丝，洋葱切丝"},
            {"step": 3, "description": "热锅下油，先炒牛肉丝至变色盛起"},
            {"step": 4, "description": "下土豆丝和洋葱丝炒至断生"},
            {"step": 5, "description": "加入牛肉丝翻炒，调味即可"},
        ],
        "tips": ["牛肉要腌制入味，土豆丝要过水去淀粉"],
        "nutritional_info": {
            "calories_kcal": 280,
            "protein_g": 25,
            "carbs_g": 20,
            "fat_g": 8,
        },
    }

    # 创建模拟的解析器和生成器
    mock_parser = Mock()
    mock_parser.parse_requirements.return_value = mock_parser_response

    mock_generator = Mock()
    mock_generator.generate_recipe.return_value = mock_recipe_response

    # Agent在agent.py中使用了这两个类
    with (
        patch("agent.RecipeRequirementsParser", return_value=mock_parser),
        patch("agent.RecipeGenerator", return_value=mock_generator),
    ):
        try:
            agent = RecipeAgent(api_key="mock_key")
            user_input = "我冰箱里有牛肉和洋葱，想做个半小时内搞定的快手菜，别太辣"

            print(f"📝 测试输入: {user_input}")
            recipe = agent.generate_recipe_from_natural_language(user_input)

            print("✅ 自然语言解析测试成功！")
            print(f"🍽️  生成的菜品: {recipe['dish_name']}")
            print(
                f"⏱️  总时间: {recipe['prep_time_mins'] + recipe['cook_time_mins']}分钟"
            )
            print(f"🔥 卡路里: {recipe['nutritional_info']['calories_kcal']}大卡")

            return True

        except Exception as e:
            print(f"❌ 自然语言解析测试失败: {e}")
            return False


def test_error_handling():
    """测试错误处理"""
    print("\n" + "=" * 50)
    print("🛡️  错误处理测试")
    print("=" * 50)

    try:
        # 测试空食材列表
        generator = RecipeGenerator(api_key="mock_key")
        generator.generate_recipe([])
        print("❌ 应该抛出空食材列表错误")
        return False
    except ValueError as e:
        print(f"✅ 正确处理空食材列表: {e}")

    try:
        # 测试无效API密钥
        generator = RecipeGenerator(api_key="invalid_key")
        generator.generate_recipe(["测试食材"])
        print("❌ 应该抛出API错误")
        return False
    except Exception as e:
        print(f"✅ 正确处理API错误: {type(e).__name__}")

    return True


def main():
    """主测试函数"""
    print("🧑‍🍳 菜谱生成器测试工具")
    print("=" * 50)

    # 运行所有测试
    tests_passed = 0
    total_tests = 4

    if test_mock_recipe_generation():
        tests_passed += 1

    if test_natural_language_parsing():
        tests_passed += 1

    if test_error_handling():
        tests_passed += 1

    # 真实API测试（可选）
    print("\n" + "=" * 50)
    user_input = input("是否要进行真实API测试？(y/n): ").lower().strip()
    if user_input in ["y", "yes", "是"]:
        if test_real_api_agent():
            tests_passed += 1
    else:
        print("⏭️  跳过真实API测试")
        total_tests = 3

    # 测试结果汇总
    print("\n" + "=" * 50)
    print("📊 测试结果汇总")
    print("=" * 50)
    print(f"✅ 通过测试: {tests_passed}/{total_tests}")

    if tests_passed == total_tests:
        print("🎉 所有测试通过！代码工作正常。")
    else:
        print("⚠️  部分测试失败，请检查代码或配置。")


if __name__ == "__main__":
    main()
