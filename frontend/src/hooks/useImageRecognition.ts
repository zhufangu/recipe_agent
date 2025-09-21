// 图片识别相关业务逻辑 Hook
import { useAppDispatch } from '../contexts/AppContext';
import { IngredientAnalysisResult } from '../types';
import { useProgress } from './useProgress';
import { INGREDIENT_ANALYZE_URL } from '../config/api';

export function useImageRecognition() {
  const dispatch = useAppDispatch();
  const { simulateProgress, completeProgress, hideProgress } = useProgress();

  // 分析图片中的食材
  const analyzeImage = async (file: File) => {
    dispatch({ type: 'START_IMAGE_ANALYSIS' });

    // 开始进度条动画
    const progressPromise = simulateProgress(
      '正在识别图片中的食材...',
      'analysis',
      3000
    );

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(INGREDIENT_ANALYZE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: IngredientAnalysisResult = await response.json();

      // 确保进度条完成
      completeProgress();

      if (result.success) {
        dispatch({
          type: 'IMAGE_ANALYSIS_SUCCESS',
          payload: { ingredients: result.ingredients },
        });
        return result.ingredients;
      } else {
        throw new Error('分析失败');
      }
    } catch (error) {
      console.error('图片识别错误:', error);
      hideProgress(); // 出错时隐藏进度条
      const errorMessage =
        '图片识别失败，请检查后端服务是否开启，或查看浏览器控制台获取更多信息。';

      dispatch({
        type: 'IMAGE_ANALYSIS_ERROR',
        payload: { error: errorMessage },
      });

      throw error;
    }
  };

  // 添加食材
  const addIngredient = (ingredient: string) => {
    dispatch({
      type: 'ADD_INGREDIENT',
      payload: { ingredient },
    });
  };

  // 删除食材
  const removeIngredient = (ingredient: string) => {
    dispatch({
      type: 'REMOVE_INGREDIENT',
      payload: { ingredient },
    });
  };

  return {
    analyzeImage,
    addIngredient,
    removeIngredient,
  };
}
