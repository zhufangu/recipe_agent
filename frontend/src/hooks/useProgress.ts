import { useAppDispatch } from '../contexts/AppContext';

export const useProgress = () => {
  const dispatch = useAppDispatch();

  const showProgress = (
    message: string,
    variant:
      | 'default'
      | 'recipe'
      | 'image'
      | 'analysis'
      | 'optimize' = 'default'
  ) => {
    dispatch({
      type: 'SHOW_PROGRESS',
      payload: { message, variant },
    });
  };

  const updateProgress = (progress: number) => {
    // 修复浮点数精度问题，保留整数
    const roundedProgress = Math.round(Math.min(100, Math.max(0, progress)));
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { progress: roundedProgress },
    });
  };

  const hideProgress = () => {
    dispatch({ type: 'HIDE_PROGRESS' });
  };

  // 模拟进度条动画
  const simulateProgress = async (
    message: string,
    variant: 'default' | 'recipe' | 'image' | 'analysis' | 'optimize',
    duration: number = 3000
  ) => {
    showProgress(message, variant);

    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = Math.min(95, Math.round((i / steps) * 100)); // 最多到95%，留5%给完成，并四舍五入
      updateProgress(progress);

      if (i < steps) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
      }
    }
  };

  const completeProgress = () => {
    updateProgress(100);
    setTimeout(() => {
      hideProgress();
    }, 500); // 显示100%半秒后隐藏
  };

  return {
    showProgress,
    updateProgress,
    hideProgress,
    simulateProgress,
    completeProgress,
  };
};
