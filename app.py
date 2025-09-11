# 导入 load_dotenv
from dotenv import load_dotenv

# 在所有代码之前执行它，这样.env文件里的变量就会被加载到环境中
load_dotenv()

import streamlit as st
from agent import RecipeAgent

st.set_page_config(
    page_title="智能菜谱生成器",
    page_icon="🍳",
    layout="wide",
)

st.title("🍳 AI 智能菜谱生成器")
st.caption("输入你拥有的食材和你的需求，AI将为你量身定做一份菜谱！")

user_input = st.text_input(
    "告诉AI你的需求", placeholder="例如：我有一些鸡胸肉和西兰花，想做个低卡的健身餐..."
)

if st.button("生成菜谱"):
    if user_input:
        with st.spinner("魔法正在发生中，AI厨师正在为你准备菜谱..."):
            try:
                # 初始化并调用Agent生成菜谱
                agent = RecipeAgent()
                recipe = agent.generate_recipe_from_natural_language(user_input)

                # 显示成功信息
                st.badge("菜谱生成成功了哦！", icon="🎉")
                st.success("菜谱生成成功！")

                # 展示菜谱
                st.subheader(f"为你推荐：{recipe.get('dish_name', '未知菜品')}")
                st.markdown(f"**菜品描述**: {recipe.get('description', '暂无')}")

                col1, col2, col3, col4 = st.columns(4)
                col1.metric("准备时间", f"{recipe.get('prep_time_mins', 0)} 分钟")
                col2.metric("烹饪时间", f"{recipe.get('cook_time_mins', 0)} 分钟")
                col3.metric("份量", f"{recipe.get('servings', 0)} 人份")
                col4.metric(
                    "卡路里",
                    f"{recipe.get('nutritional_info', {}).get('calories_kcal', 0)} 大卡",
                )

                st.markdown("---")

                # 食材和步骤
                st.subheader("所需食材")
                for item in recipe.get("ingredients", []):
                    st.markdown(
                        f"- {item.get('name', '')}: {item.get('amount', '')} {item.get('unit', '')}"
                    )

                st.subheader("烹饪步骤")
                for step in recipe.get("instructions", []):
                    st.markdown(
                        f"**第 {step.get('step')} 步**: {step.get('description', '')}"
                    )

                # 小贴士和完整JSON
                st.subheader("小贴士")
                for tip in recipe.get("tips", []):
                    st.info(tip)

                with st.expander("查看完整的JSON原始数据"):
                    st.json(recipe)

            except Exception as e:
                st.error(f"生成菜谱时发生错误: {e}")
    else:
        st.warning("请输入你的需求")
