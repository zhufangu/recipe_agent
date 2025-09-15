import streamlit as st
import time
from agent import RecipeAgent
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(
    page_title="智能菜谱生成器",
    page_icon="🍳",
    layout="wide",
)

# 使用Streamlit原生列布局实现边距
col_left, col_main, col_right = st.columns([1, 8, 1])

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
# 初始化 identified_ingredients
if "identified_ingredients" not in st.session_state:
    st.session_state.identified_ingredients = None


with col_main:
    st.title("🍳 AI 智能菜谱生成器")
    st.caption("选择你的输入方式，AI将为你量身定做一份菜谱！")

    # 创建两个tab
    tab1, tab2 = st.tabs(["💬 文字描述", "📷 图片识别"])

    with tab1:
        user_input = st.text_input(
            "告诉AI你的需求",
            placeholder="例如：我有一些鸡胸肉和西兰花，想做个低卡的健身餐...",
            key="text_input",
        )

        # 按钮1: 生成菜谱
        if st.button("✨ 生成菜谱"):
            if user_input:
                with st.spinner("魔法正在发生中，AI厨师正在为你准备菜谱..."):
                    try:
                        recipe = st.session_state.agent.generate_recipe_text_only(
                            user_input
                        )
                        # 将结果存入session state，并重置图片URL（因为是新菜谱）
                        st.session_state.recipe = recipe
                        st.session_state.image_url = None
                        # 显示成功信息
                        st.success("菜谱生成成功！")
                    except Exception as e:
                        st.error(f"生成菜谱时发生错误: {e}")
            else:
                st.warning("请输入你的需求")

    with tab2:
        st.subheader("📷 上传图片识别食材")
        st.markdown("请上传一张包含食材的图片，AI将自动识别并生成菜谱")

        # 创建两列布局
        col_upload, col_display = st.columns([1, 1])

        with col_upload:
            uploaded_file = st.file_uploader(
                "选择图片文件",
                type=["jpg", "jpeg", "png"],
                help="支持jpg、jpeg、png格式",
                key="image_upload",
            )

            if uploaded_file is not None:
                # 分析图片按钮
                if st.button(
                    "🔍 分析图片中的食材", key="analyze_image", width="stretch"
                ):
                    with st.spinner("正在分析图片中的食材..."):
                        try:
                            # 重置文件指针到开头
                            uploaded_file.seek(0)

                            # 调用GPT Vision分析
                            result = st.session_state.agent.vision_analyzer.analyze_image_for_ingredients(
                                uploaded_file
                            )

                            if result["success"]:
                                ingredients = result["ingredients"]
                                st.session_state.identified_ingredients = ingredients

                                if ingredients:
                                    st.success(
                                        f"✅ 图片分析成功！识别到 {len(ingredients)} 种食材"
                                    )
                                else:
                                    st.warning(
                                        "⚠️ 未识别到明显的食材，请尝试上传更清晰的食材图片"
                                    )
                                    st.info(
                                        "💡 建议：确保图片中的食材清晰可见，光线充足"
                                    )
                            else:
                                st.error(
                                    f"❌ 图片分析失败: {result.get('error', '未知错误')}"
                                )

                        except Exception as e:
                            st.error(f"分析图片时发生错误: {e}")

        with col_display:
            if uploaded_file is not None:
                # 显示上传的图片
                st.image(uploaded_file, caption="上传的图片", width="stretch")

                # 如果已经分析了图片，显示识别结果
                if st.session_state.identified_ingredients:
                    st.markdown("---")
                    st.subheader("识别到的食材")
                    ingredients_text = "、".join(
                        st.session_state.identified_ingredients
                    )
                    st.markdown(f"**{ingredients_text}**")

                    if st.button(
                        "✨ 根据识别食材生成菜谱",
                        key="image_generate",
                        width="stretch",
                    ):
                        with st.spinner("正在根据识别食材生成菜谱..."):
                            try:
                                # 使用识别到的食材生成菜谱
                                recipe_input = f"我有{st.session_state.identified_ingredients}，请帮我生成一道菜谱"
                                recipe = (
                                    st.session_state.agent.generate_recipe_text_only(
                                        recipe_input
                                    )
                                )

                                # 将结果存入session state
                                st.session_state.recipe = recipe
                                st.session_state.image_url = None
                                st.success("菜谱生成成功！")
                            except Exception as e:
                                st.error(f"生成菜谱时发生错误: {e}")
            else:
                st.info("请先上传图片")

    # 菜谱显示区域 - 两个tab共享
    if st.session_state.recipe:
        recipe = st.session_state.recipe

        # 使用容器来组织菜谱内容，避免重复渲染
        with st.container():
            st.header(f"为你推荐：{recipe.get('dish_name', '未知菜品')}")

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
                    st.markdown(
                        f"**第 {step.get('step')} 步**: {step.get('description', '')}"
                    )

                # 在烹饪步骤列中添加图片生成功能
                st.markdown("---")

                # 生成图片按钮
                if not st.session_state.image_url:
                    if st.button("🎨 为这道菜生成图片", type="primary"):
                        # 创建进度条和状态文本的占位符
                        progress_text = st.empty()
                        progress_bar = st.progress(0)

                        try:
                            # 模拟图片生成的不同阶段
                            progress_text.text("🔄 正在分析菜谱内容...")
                            progress_bar.progress(10)
                            time.sleep(0.5)

                            progress_text.text("🎨 正在生成图片提示词...")
                            progress_bar.progress(30)
                            time.sleep(0.5)

                            progress_text.text("🚀 正在调用AI图片生成API...")
                            progress_bar.progress(50)
                            time.sleep(0.5)

                            progress_text.text("⏳ 正在等待图片生成完成...")
                            progress_bar.progress(70)
                            time.sleep(0.5)

                            # 实际调用图片生成方法
                            progress_text.text("🖼️ 正在处理图片结果...")
                            progress_bar.progress(90)

                            image_url = (
                                st.session_state.agent.generate_image_from_recipe(
                                    st.session_state.recipe
                                )
                            )

                            progress_text.text("✅ 图片生成完成！")
                            progress_bar.progress(100)
                            time.sleep(0.3)

                            # 保存结果并重新运行
                            st.session_state.image_url = image_url
                            st.rerun()

                        except Exception as e:
                            progress_text.text("❌ 图片生成失败")
                            progress_bar.progress(0)
                            st.error(f"生成图片时发生错误: {e}")

                # 图片展示区：当图片URL存在时，显示图片
                if st.session_state.image_url:
                    st.subheader("菜品图片")
                    st.image(
                        st.session_state.image_url,
                        caption=recipe.get("dish_name", "菜品图片"),
                        width="stretch",
                    )

            if recipe.get("tips"):
                st.subheader("小贴士")
                for tip in recipe.get("tips", []):
                    st.info(f"💡 {tip}")
