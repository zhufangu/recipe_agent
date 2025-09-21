// 菜谱相关业务逻辑 Hook
import { useAppDispatch } from '../contexts/AppContext';
import { TabType } from '../types/appState';
import { Recipe, ChatMessage } from '../types';
import { useProgress } from './useProgress';

export function useRecipe() {
  const dispatch = useAppDispatch();
  const { simulateProgress, completeProgress, hideProgress } = useProgress();

  // 生成菜谱
  const generateRecipe = async (description: string, tab: TabType) => {
    dispatch({ type: 'START_RECIPE_GENERATION', payload: { tab } });

    // 开始进度条动画
    const progressPromise = simulateProgress('正在生成菜谱...', 'recipe', 4000);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/recipes/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const recipe: Recipe = await response.json();

      // 确保进度条完成
      completeProgress();

      dispatch({
        type: 'RECIPE_GENERATION_SUCCESS',
        payload: { tab, recipe },
      });

      return recipe;
    } catch (error) {
      console.error('生成菜谱错误:', error);
      hideProgress(); // 出错时隐藏进度条
      const errorMessage =
        '生成菜谱失败，请检查后端服务是否开启，或查看浏览器控制台获取更多信息。';

      dispatch({
        type: 'RECIPE_GENERATION_ERROR',
        payload: { tab, error: errorMessage },
      });

      throw error;
    }
  };

  // 优化菜谱
  const optimizeRecipe = async (
    currentRecipe: Recipe,
    userRequest: string,
    conversationHistory: ChatMessage[],
    tab: TabType
  ) => {
    dispatch({ type: 'START_RECIPE_OPTIMIZATION', payload: { tab } });

    // 开始进度条动画 - 菜谱优化通常比生成快一些
    const progressPromise = simulateProgress(
      '正在优化菜谱...',
      'optimize',
      2500
    );

    try {
      // 准备对话历史数据
      const historyData = conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/recipes/optimize',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_recipe: currentRecipe,
            user_request: userRequest,
            conversation_history: historyData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // 检查是否是非菜谱话题的提醒
      if (result.type === 'off_topic_reminder') {
        hideProgress(); // 隐藏进度条
        dispatch({
          type: 'RECIPE_OPTIMIZATION_ERROR',
          payload: { tab, error: '' }, // 不是真正的错误，只是停止加载状态
        });
        return { type: 'off_topic_reminder', message: result.message };
      }

      // 正常的菜谱优化结果
      const optimizedRecipe: Recipe = result;

      // 确保进度条完成
      completeProgress();

      dispatch({
        type: 'RECIPE_OPTIMIZATION_SUCCESS',
        payload: { tab, recipe: optimizedRecipe },
      });

      return { type: 'success', recipe: optimizedRecipe };
    } catch (error) {
      console.error('优化菜谱错误:', error);
      hideProgress(); // 出错时隐藏进度条
      const errorMessage = '优化菜谱失败，请稍后重试。';

      dispatch({
        type: 'RECIPE_OPTIMIZATION_ERROR',
        payload: { tab, error: errorMessage },
      });

      throw error;
    }
  };

  // 生成菜谱图片
  const generateRecipeImage = async (recipe: Recipe) => {
    dispatch({ type: 'START_IMAGE_GENERATION' });

    // 开始进度条动画
    const progressPromise = simulateProgress(
      '正在生成菜品图片...',
      'image',
      6000
    );

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/recipes/generate-image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipe_json: recipe }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const imageUrl = result.image_url;

      // 确保进度条完成
      completeProgress();

      dispatch({
        type: 'IMAGE_GENERATION_SUCCESS',
        payload: { imageUrl },
      });

      return imageUrl;
    } catch (error) {
      console.error('生成图片错误:', error);
      hideProgress(); // 出错时隐藏进度条
      const errorMessage = '生成图片失败，请稍后重试。';

      dispatch({
        type: 'IMAGE_GENERATION_ERROR',
        payload: { error: errorMessage },
      });

      throw error;
    }
  };

  return {
    generateRecipe,
    optimizeRecipe,
    generateRecipeImage,
  };
}
