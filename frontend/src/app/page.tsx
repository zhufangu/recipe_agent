'use client';
import { useState } from 'react';
import ImageRecognitionTab from '../components/ImageRecognitionTab';
import TextInputTab from '../components/TextInputTab';
import {
  Recipe,
  IngredientAnalysisResult,
  ChatMessage,
  ImageTabState,
  TextTabState,
} from '../types';

type TabType = 'image' | 'text';

export default function Home() {
  // 使用单一通用主题，不再需要主题状态

  // Tab 状态
  const [activeTab, setActiveTab] = useState<TabType>('text');

  // 图片识别 Tab 状态
  const [imageTabState, setImageTabState] = useState<ImageTabState>({
    conversation: [],
    recipe: null,
    isGenerating: false,
    error: null,
    identifiedIngredients: [],
    isAnalyzing: false,
    analysisError: null,
  });

  // 文字输入 Tab 状态
  const [textTabState, setTextTabState] = useState<TextTabState>({
    conversation: [],
    recipe: null,
    isGenerating: false,
    error: null,
    userInput: '',
  });

  // 图片生成相关状态
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // 添加消息到对话历史
  const addMessage = (
    tabType: TabType,
    role: 'user' | 'ai',
    content: string
  ) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };

    if (tabType === 'image') {
      setImageTabState((prev) => ({
        ...prev,
        conversation: [...prev.conversation, message],
      }));
    } else {
      setTextTabState((prev) => ({
        ...prev,
        conversation: [...prev.conversation, message],
      }));
    }
  };

  // 统一的菜谱生成函数
  const generateRecipe = async (description: string, tabType: TabType) => {
    if (tabType === 'image') {
      setImageTabState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));
    } else {
      setTextTabState((prev) => ({ ...prev, isGenerating: true, error: null }));
    }

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

      const data: Recipe = await response.json();

      if (tabType === 'image') {
        setImageTabState((prev) => ({
          ...prev,
          recipe: data,
          isGenerating: false,
          error: null,
        }));
      } else {
        setTextTabState((prev) => ({
          ...prev,
          recipe: data,
          isGenerating: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('生成菜谱错误:', error);
      if (tabType === 'image') {
        setImageTabState((prev) => ({
          ...prev,
          isGenerating: false,
          error:
            '生成菜谱失败，请检查后端服务是否开启，或查看浏览器控制台获取更多信息。',
        }));
      } else {
        setTextTabState((prev) => ({
          ...prev,
          isGenerating: false,
          error:
            '生成菜谱失败，请检查后端服务是否开启，或查看浏览器控制台获取更多信息。',
        }));
      }
    }
  };

  // 图片识别相关函数
  const handleImageUpload = async (file: File) => {
    setImageTabState((prev) => ({
      ...prev,
      isAnalyzing: true,
      analysisError: null,
      identifiedIngredients: [],
    }));

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/ingredients/analyze',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: IngredientAnalysisResult = await response.json();

      if (result.success) {
        setImageTabState((prev) => ({
          ...prev,
          identifiedIngredients: result.ingredients,
          isAnalyzing: false,
          analysisError: null,
        }));
      } else {
        throw new Error('分析失败');
      }
    } catch (error) {
      console.error('图片识别错误:', error);
      setImageTabState((prev) => ({
        ...prev,
        isAnalyzing: false,
        analysisError:
          '图片识别失败，请检查后端服务是否开启，或查看浏览器控制台获取更多信息。',
      }));
    }
  };

  // 管理识别的食材
  const handleRemoveIngredient = (ingredient: string) => {
    setImageTabState((prev) => ({
      ...prev,
      identifiedIngredients: prev.identifiedIngredients.filter(
        (item) => item !== ingredient
      ),
    }));
  };

  const handleAddIngredient = (ingredient: string) => {
    if (
      ingredient.trim() &&
      !imageTabState.identifiedIngredients.includes(ingredient.trim())
    ) {
      setImageTabState((prev) => ({
        ...prev,
        identifiedIngredients: [
          ...prev.identifiedIngredients,
          ingredient.trim(),
        ],
      }));
    }
  };

  // 从识别的食材生成菜谱
  const handleGenerateFromIngredients = () => {
    if (imageTabState.identifiedIngredients.length === 0) {
      setImageTabState((prev) => ({
        ...prev,
        error: '请先识别或添加一些食材',
      }));
      return;
    }

    const description = `我有这些食材：${imageTabState.identifiedIngredients.join(
      '、'
    )}，请帮我生成一道菜谱。`;
    generateRecipe(description, 'image');
  };

  // 文字输入相关函数
  const handleInputChange = (input: string) => {
    setTextTabState((prev) => ({ ...prev, userInput: input }));
  };

  const handleTextSubmit = () => {
    if (!textTabState.userInput.trim()) return;
    generateRecipe(textTabState.userInput.trim(), 'text');
  };

  // 对话相关函数
  const handleTextTabSendMessage = (message: string) => {
    addMessage('text', 'user', message);
    // 这里可以添加更多对话逻辑
    setTimeout(() => {
      addMessage('text', 'ai', '我已经收到您的消息，请稍等...');
    }, 500);
  };

  const handleImageTabSendMessage = (message: string) => {
    addMessage('image', 'user', message);
    // 这里可以添加更多对话逻辑
    setTimeout(() => {
      addMessage('image', 'ai', '我已经收到您的消息，请稍等...');
    }, 500);
  };

  // 图片生成功能
  const handleGenerateImage = async () => {
    const currentRecipe =
      activeTab === 'image' ? imageTabState.recipe : textTabState.recipe;
    if (!currentRecipe) return;

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/recipes/generate-image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipe_json: currentRecipe }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const imageUrl = result.image_url;

      // 更新当前活跃tab的recipe的image_url
      if (activeTab === 'image') {
        setImageTabState((prev) => ({
          ...prev,
          recipe: prev.recipe ? { ...prev.recipe, image_url: imageUrl } : null,
        }));
      } else {
        setTextTabState((prev) => ({
          ...prev,
          recipe: prev.recipe ? { ...prev.recipe, image_url: imageUrl } : null,
        }));
      }
    } catch (error) {
      console.error('生成图片错误:', error);
      setImageError('生成图片失败，请稍后重试。');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 菜谱优化功能
  const handleOptimizeRecipe = async (message: string, tabType: TabType) => {
    const currentState = tabType === 'image' ? imageTabState : textTabState;
    if (!currentState.recipe) return;

    addMessage(tabType, 'user', message);

    if (tabType === 'image') {
      setImageTabState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));
    } else {
      setTextTabState((prev) => ({ ...prev, isGenerating: true, error: null }));
    }

    try {
      // 准备对话历史数据
      const conversationHistory = currentState.conversation.map((msg) => ({
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
            current_recipe: currentState.recipe,
            user_request: message,
            conversation_history: conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // 检查是否是非菜谱话题的提醒
      if (result.type === 'off_topic_reminder') {
        if (tabType === 'image') {
          setImageTabState((prev) => ({
            ...prev,
            isGenerating: false,
            error: null,
          }));
        } else {
          setTextTabState((prev) => ({
            ...prev,
            isGenerating: false,
            error: null,
          }));
        }

        // 添加 AI 的提醒回复
        setTimeout(() => {
          addMessage(tabType, 'ai', result.message);
        }, 500);
        return;
      }

      // 正常的菜谱优化结果
      const optimizedRecipe: Recipe = result;

      if (tabType === 'image') {
        setImageTabState((prev) => ({
          ...prev,
          recipe: optimizedRecipe,
          isGenerating: false,
          error: null,
        }));
      } else {
        setTextTabState((prev) => ({
          ...prev,
          recipe: optimizedRecipe,
          isGenerating: false,
          error: null,
        }));
      }

      // 添加 AI 的成功回复
      setTimeout(() => {
        addMessage(
          tabType,
          'ai',
          `我已经根据您的需求"${message}"优化了菜谱。新的菜谱已经体现了您要求的改进。`
        );
      }, 500);
    } catch (error) {
      console.error('优化菜谱错误:', error);
      if (tabType === 'image') {
        setImageTabState((prev) => ({
          ...prev,
          isGenerating: false,
          error: '优化菜谱失败，请稍后重试。',
        }));
      } else {
        setTextTabState((prev) => ({
          ...prev,
          isGenerating: false,
          error: '优化菜谱失败，请稍后重试。',
        }));
      }

      // 添加错误回复
      setTimeout(() => {
        addMessage(tabType, 'ai', '抱歉，优化菜谱时遇到了问题，请稍后重试。');
      }, 500);
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
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2.5rem',
          fontWeight: 'bold',
        }}
      >
        🍳 AI 智能菜谱生成器
      </h1>

      {/* Tab 导航 */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('text')}
          className={activeTab === 'text' ? 'tab-active' : 'tab-inactive'}
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
          onClick={() => setActiveTab('image')}
          className={activeTab === 'image' ? 'tab-active' : 'tab-inactive'}
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
        {activeTab === 'text' && (
          <TextInputTab
            state={textTabState}
            onInputChange={handleInputChange}
            onSendMessage={(message) => {
              if (textTabState.recipe) {
                // 如果已有菜谱，则进行优化
                handleOptimizeRecipe(message, 'text');
              } else {
                // 如果没有菜谱，则正常对话
                handleTextTabSendMessage(message);
              }
            }}
            onGenerateRecipe={handleTextSubmit}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            imageError={imageError}
          />
        )}
        {activeTab === 'image' && (
          <ImageRecognitionTab
            state={imageTabState}
            onImageUpload={handleImageUpload}
            onSendMessage={(message) => {
              if (imageTabState.recipe) {
                // 如果已有菜谱，则进行优化
                handleOptimizeRecipe(message, 'image');
              } else {
                // 如果没有菜谱，则正常对话
                handleImageTabSendMessage(message);
              }
            }}
            onRemoveIngredient={handleRemoveIngredient}
            onAddIngredient={handleAddIngredient}
            onGenerateRecipe={handleGenerateFromIngredients}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            imageError={imageError}
          />
        )}
      </div>
    </main>
  );
}
