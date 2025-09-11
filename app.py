import streamlit as st
from agent import RecipeAgent
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(
    page_title="智能菜谱生成器",
    page_icon="🍳",
    layout="wide",
)

# --- 初始化 Session State ---
# 这是让Streamlit在多次交互之间“记住”信息的关键
# 如果 session_state 中还没有 recipe，就给它设一个初始值 None
if "recipe" not in st.session_state:
    st.session_state.recipe = None
# 同理，初始化 image_url
if "image_url" not in st.session_state:
    st.session_state.image_url = None
# 初始化 Agent 实例，避免每次刷新都重新创建
if "agent" not in st.session_state:
    st.session_state.agent = RecipeAgent()


st.title("🍳 AI 智能菜谱生成器")
st.caption("输入你拥有的食材和你的需求，AI将为你量身定做一份菜谱！")

user_input = st.text_input(
    "告诉AI你的需求", placeholder="例如：我有一些鸡胸肉和西兰花，想做个低卡的健身餐..."
)

if st.button("✨ 生成菜谱"):
    if user_input:
        with st.spinner("魔法正在发生中，AI厨师正在为你准备菜谱..."):
            try:
                recipe = st.session_state.agent.generate_recipe_text_only(user_input)
                # 将结果存入session state，并重置图片URL（因为是新菜谱）
                st.session_state.recipe = recipe
                st.session_state.image_url = None
                # 显示成功信息
                st.success("菜谱生成成功！")
            except Exception as e:
                st.error(f"生成菜谱时发生错误: {e}")
    else:
        st.warning("请输入你的需求")

# 如果已经生成了菜谱，就显示菜谱
if st.session_state.recipe:
    recipe = st.session_state.recipe

    # --- 图片展示区：当图片URL存在时，显示图片 ---
    if st.session_state.image_url:
        st.image(
            st.session_state.image_url,
            caption=recipe.get("dish_name", "菜品图片"),
            use_container_width=True,
        )

    st.header(f"为你推荐：{recipe.get('dish_name', '未知菜品')}")

    # --- 按钮2：生成图片 (只有在没有图片时才显示) ---
    if not st.session_state.image_url:
        if st.button("🎨 为这道菜生成图片", type="primary"):
            with st.spinner("正在生成菜品图片..."):
                try:
                    # 调用只生成图片的方法，使用已存的菜谱
                    image_url = st.session_state.agent.generate_image_from_recipe(
                        st.session_state.recipe
                    )
                    st.session_state.image_url = image_url
                    # 重新运行，显示图片
                    st.rerun()
                except Exception as e:
                    st.error(f"生成图片时发生错误: {e}")

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

    # 菜谱详细信息
    col_ing, col_steps = st.columns(2)
    with col_ing:
        st.subheader("所需食材")
        for item in recipe.get("ingredients", []):
            st.markdown(
                f"- {item.get('name', '')}: {item.get('amount', '')} {item.get('unit', '')}"
            )

    with col_steps:
        st.subheader("烹饪步骤")
        for step in recipe.get("instructions", []):
            st.markdown(f"**第 {step.get('step')} 步**: {step.get('description', '')}")

    if recipe.get("tips"):
        st.subheader("小贴士")
        for tip in recipe.get("tips", []):
            st.info(f"💡 {tip}")
