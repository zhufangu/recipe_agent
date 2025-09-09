#!/usr/bin/env python3
"""
菜谱生成器演示脚本
展示自然语言输入生成菜谱的功能
"""

import json
from main import generate_recipe_from_natural_language, RecipeAgent


def demo_natural_language():
    """演示自然语言菜谱生成功能"""
    print("🍳 菜谱生成器 - 自然语言演示")
    print("=" * 60)
    
    # 示例用户输入
    examples = [
        "我冰箱里有牛肉和洋葱，想做个半小时内搞定的快手菜，别太辣",
        "家里有鸡蛋、番茄、面条，想做一道简单的中式菜，热量不要太高",
        "冰箱里有土豆、胡萝卜、鸡肉，想做一道营养丰富的菜，适合减肥",
        "有虾仁、西兰花、蒜，想做一道清淡的菜，15分钟内完成"
    ]
    
    print("📝 示例输入：")
    for i, example in enumerate(examples, 1):
        print(f"{i}. {example}")
    
    print("\n" + "=" * 60)
    choice = input("请选择要测试的示例 (1-4) 或输入自定义描述: ").strip()
    
    if choice.isdigit() and 1 <= int(choice) <= 4:
        user_input = examples[int(choice) - 1]
    else:
        user_input = choice if choice else examples[0]
    
    print(f"\n🎯 选择的输入: {user_input}")
    print("\n" + "=" * 60)
    
    try:
        # 生成菜谱
        recipe = generate_recipe_from_natural_language(user_input)
        
        print("\n📋 生成的菜谱：")
        print("=" * 60)
        print(json.dumps(recipe, ensure_ascii=False, indent=2))
        
        # 提取关键信息
        print(f"\n🍽️  菜品名称: {recipe['dish_name']}")
        print(f"📝 菜品描述: {recipe.get('description', '无描述')}")
        print(f"⏱️  准备时间: {recipe['prep_time_mins']}分钟")
        print(f"🔥 烹饪时间: {recipe['cook_time_mins']}分钟")
        print(f"👥 份数: {recipe['servings']}人份")
        print(f"💪 营养信息: {recipe['nutritional_info']['calories_kcal']}大卡")
        
        print(f"\n🥘 食材清单:")
        for ingredient in recipe['ingredients']:
            print(f"   - {ingredient['name']}: {ingredient['amount']}{ingredient['unit']}")
        
        print(f"\n👨‍🍳 烹饪步骤:")
        for step in recipe['instructions']:
            print(f"   {step['step']}. {step['description']}")
        
        if recipe.get('tips'):
            print(f"\n💡 烹饪小贴士:")
            for tip in recipe['tips']:
                print(f"   - {tip}")
        
    except Exception as e:
        print(f"❌ 生成菜谱时发生错误: {e}")
        print("请确保设置了OPENAI_API_KEY环境变量")


def demo_agent_class():
    """演示使用Agent类的高级功能"""
    print("\n" + "=" * 60)
    print("🤖 使用RecipeAgent类的高级功能")
    print("=" * 60)
    
    try:
        agent = RecipeAgent()
        
        # 自然语言输入
        user_input = "冰箱里有三文鱼、芦笋、柠檬，想做一道西式菜，健康低脂"
        print(f"📝 输入: {user_input}")
        
        recipe = agent.generate_recipe_from_natural_language(user_input)
        
        print(f"\n🍽️  生成的菜品: {recipe['dish_name']}")
        print(f"📝 描述: {recipe.get('description', '无描述')}")
        
        # 传统方式输入
        print(f"\n" + "=" * 40)
        print("🔄 传统方式（直接指定食材）:")
        traditional_recipe = agent.generate_recipe_from_ingredients(
            ingredients=["鸡蛋", "番茄", "洋葱"],
            cuisine_type="中式",
            difficulty="简单",
            max_cook_time=20,
            dietary_requirements=["不辣"],
            calorie_preference="低热量"
        )
        
        print(f"🍽️  传统方式生成的菜品: {traditional_recipe['dish_name']}")
        
    except Exception as e:
        print(f"❌ 演示过程中发生错误: {e}")


if __name__ == "__main__":
    print("🚀 启动菜谱生成器演示")
    
    # 检查API密钥
    import os
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️  未检测到OPENAI_API_KEY环境变量")
        print("请设置API密钥后再运行演示:")
        print("export OPENAI_API_KEY='your-api-key-here'")
        print("\n或者运行模拟测试:")
        print("python test_recipe.py")
        exit(1)
    
    # 运行演示
    demo_natural_language()
    demo_agent_class()
    
    print("\n🎉 演示完成！")
    print("💡 提示: 您可以尝试输入自己的食材和需求来生成个性化菜谱")
