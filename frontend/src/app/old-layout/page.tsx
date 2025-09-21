'use client';
import ImageRecognitionTab from '../../components/old/ImageRecognitionTab';
import TextInputTab from '../../components/old/TextInputTab';
import ProgressBar from '../../components/ProgressBar';
import { useAppState, useAppDispatch } from '../../contexts/AppContext';
import { useRecipe } from '../../hooks/useRecipe';
import { useImageRecognition } from '../../hooks/useImageRecognition';
import { useChat } from '../../hooks/useChat';
import { TabType } from '../../types/appState';

export default function Home() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  // 使用自定义 Hooks
  const { generateRecipe, optimizeRecipe } = useRecipe();
  const { analyzeImage, addIngredient, removeIngredient } =
    useImageRecognition();
  const { addUserMessage, addDelayedAIMessage } = useChat();

  // Tab 切换
  const handleTabChange = (tab: TabType) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  // 文字输入处理
  const handleTextInputChange = (input: string) => {
    dispatch({ type: 'UPDATE_TEXT_INPUT', payload: { input } });
  };

  // 文字 Tab 生成菜谱
  const handleTextSubmit = async () => {
    const userInput = state.tabs.text.userInput.trim();
    if (!userInput) return;

    try {
      await generateRecipe(userInput, 'text');
    } catch {
      // 错误已在 useRecipe 中处理
    }
  };

  // 图片上传处理
  const handleImageUpload = async (file: File) => {
    try {
      await analyzeImage(file);
    } catch {
      // 错误已在 useImageRecognition 中处理
    }
  };

  // 从识别的食材生成菜谱
  const handleGenerateFromIngredients = async () => {
    const ingredients = state.tabs.image.identifiedIngredients;
    if (ingredients.length === 0) {
      dispatch({
        type: 'RECIPE_GENERATION_ERROR',
        payload: { tab: 'image', error: '请先识别或添加一些食材' },
      });
      return;
    }

    const description = `我有这些食材：${ingredients.join(
      '、'
    )}，请帮我生成一道菜谱。`;

    try {
      await generateRecipe(description, 'image');
    } catch {
      // 错误已在 useRecipe 中处理
    }
  };

  // 智能判断是否为菜谱需求
  const isRecipeRequest = async (message: string): Promise<boolean> => {
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/intent/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
          }),
        }
      );

      if (!response.ok) {
        // API 调用失败时使用关键词兜底
        return isRecipeRequestFallback(message);
      }

      const result = await response.json();
      return result.is_recipe_request || false;
    } catch (error) {
      console.error('意图识别失败，使用关键词兜底:', error);
      return isRecipeRequestFallback(message);
    }
  };

  // 关键词兜底方案
  const isRecipeRequestFallback = (message: string): boolean => {
    const recipePatterns = [
      // 直接表达做菜意图
      /我想(做|煮|炒|蒸|烤|炸)/,
      /想要(做|煮|炒|蒸|烤|炸)/,
      /帮我(做|煮|炒|蒸|烤|炸)/,

      // 食材 + 动作
      /(用|有).*(做|煮|炒|蒸|烤|炸|料理)/,
      /(做|煮|炒|蒸|烤|炸|料理).*(菜|dish)/,

      // 时间限制的菜谱需求
      /\d+分钟.*(菜|dish|完成)/,
      /半小时.*(菜|dish|完成)/,
      /一小时.*(菜|dish|完成)/,

      // 冰箱/食材描述
      /冰箱里有/,
      /家里有.*(想做|做)/,
      /这些食材/,

      // 菜系/口味需求
      /(中式|西式|日式|韩式|川菜|粤菜).*(菜|dish)/,
      /(简单|快手|营养|健康|低脂).*(菜|dish)/,
    ];

    return recipePatterns.some((pattern) => pattern.test(message));
  };

  // 对话处理 - 文字 Tab
  const handleTextTabSendMessage = async (message: string) => {
    addUserMessage('text', message);

    if (state.tabs.text.recipe) {
      // 如果已有菜谱，则进行优化
      try {
        const result = await optimizeRecipe(
          state.tabs.text.recipe,
          message,
          state.tabs.text.conversation,
          'text'
        );

        if (result.type === 'off_topic_reminder') {
          addDelayedAIMessage('text', result.message);
        } else if (result.type === 'success') {
          addDelayedAIMessage(
            'text',
            `我已经根据您的需求"${message}"优化了菜谱。新的菜谱已经体现了您要求的改进。`
          );
        }
      } catch {
        addDelayedAIMessage('text', '抱歉，优化菜谱时遇到了问题，请稍后重试。');
      }
    } else {
      // 如果没有菜谱，智能判断用户意图
      const seemsLikeRecipeRequest = await isRecipeRequest(message);

      if (seemsLikeRecipeRequest) {
        // 看起来像菜谱需求，自动生成菜谱
        addDelayedAIMessage('text', '我来为您生成菜谱...');
        try {
          await generateRecipe(message, 'text');
        } catch (error) {
          console.error('自动生成菜谱失败:', error);
          addDelayedAIMessage(
            'text',
            '抱歉，生成菜谱时遇到了问题。您也可以点击下方的"生成菜谱"按钮重试。'
          );
        }
      } else {
        // 普通对话
        addDelayedAIMessage(
          'text',
          '我已经收到您的消息。如果您想生成菜谱，请告诉我您的食材和需求，或点击"生成菜谱"按钮。'
        );
      }
    }
  };

  // 对话处理 - 图片 Tab
  const handleImageTabSendMessage = async (message: string) => {
    addUserMessage('image', message);

    if (state.tabs.image.recipe) {
      // 如果已有菜谱，则进行优化
      try {
        const result = await optimizeRecipe(
          state.tabs.image.recipe,
          message,
          state.tabs.image.conversation,
          'image'
        );

        if (result.type === 'off_topic_reminder') {
          addDelayedAIMessage('image', result.message);
        } else if (result.type === 'success') {
          addDelayedAIMessage(
            'image',
            `我已经根据您的需求"${message}"优化了菜谱。新的菜谱已经体现了您要求的改进。`
          );
        }
      } catch {
        addDelayedAIMessage(
          'image',
          '抱歉，优化菜谱时遇到了问题，请稍后重试。'
        );
      }
    } else {
      // 如果没有菜谱，智能判断用户意图
      const seemsLikeRecipeRequest = await isRecipeRequest(message);

      if (seemsLikeRecipeRequest) {
        // 看起来像菜谱需求，检查是否有识别的食材
        if (state.tabs.image.identifiedIngredients.length > 0) {
          // 有识别的食材，自动生成菜谱
          addDelayedAIMessage('image', '我来为您生成菜谱...');
          try {
            await handleGenerateFromIngredients();
          } catch (error) {
            console.error('自动生成菜谱失败:', error);
            addDelayedAIMessage(
              'image',
              '抱歉，生成菜谱时遇到了问题。您也可以点击下方的"生成菜谱"按钮重试。'
            );
          }
        } else {
          // 没有识别的食材，提醒用户先上传图片
          addDelayedAIMessage(
            'image',
            '请先上传一张包含食材的图片，我来帮您识别食材并生成菜谱。'
          );
        }
      } else {
        // 普通对话
        addDelayedAIMessage(
          'image',
          '我已经收到您的消息。如果您想生成菜谱，请告诉我您的需求，或点击"生成菜谱"按钮。'
        );
      }
    }
  };

  return (
    <main
      style={{
        padding: '20px',
        maxWidth: '1000px',
        margin: '0 auto',
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1
          style={{
            marginBottom: '16px',
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        >
          🍳 AI 智能菜谱生成器
        </h1>
        <div style={{ marginBottom: '20px' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
          >
            🎨 体验现代化布局
          </a>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="tab-navigation">
        <button
          onClick={() => handleTabChange('text')}
          className={state.activeTab === 'text' ? 'tab-active' : 'tab-inactive'}
          style={{
            padding: '12px 24px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s ease',
          }}
        >
          📝 文字描述
        </button>
        <button
          onClick={() => handleTabChange('image')}
          className={
            state.activeTab === 'image' ? 'tab-active' : 'tab-inactive'
          }
          style={{
            padding: '12px 24px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s ease',
          }}
        >
          📷 图片识别
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">
        {state.activeTab === 'text' && (
          <TextInputTab
            state={state.tabs.text}
            onInputChange={handleTextInputChange}
            onSendMessage={handleTextTabSendMessage}
            onGenerateRecipe={handleTextSubmit}
          />
        )}
        {state.activeTab === 'image' && (
          <ImageRecognitionTab
            state={state.tabs.image}
            onImageUpload={handleImageUpload}
            onSendMessage={handleImageTabSendMessage}
            onRemoveIngredient={removeIngredient}
            onAddIngredient={addIngredient}
            onGenerateRecipe={handleGenerateFromIngredients}
          />
        )}
      </div>

      {/* 全局进度条 */}
      <ProgressBar
        progress={state.ui.progressBar.progress}
        message={state.ui.progressBar.message}
        isVisible={state.ui.progressBar.isVisible}
        variant={state.ui.progressBar.variant}
      />
    </main>
  );
}
