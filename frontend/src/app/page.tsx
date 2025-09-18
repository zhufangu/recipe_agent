'use client'; // 声明为客户端组件
import { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import ImageUpload from '../components/ImageUpload';
import { Recipe, IngredientAnalysisResult } from '../types';

export default function Home() {
  // 所有状态都在这里统一管理
  // 文字输入相关状态
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 通用菜谱相关状态
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 图片生成相关状态
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // 图片识别相关状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>(
    []
  );
  const [isGeneratingFromIngredients, setIsGeneratingFromIngredients] =
    useState(false);

  // 统一的菜谱生成函数
  const generateRecipe = async (description: string) => {
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
      setRecipe(data);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(
        '生成菜谱失败，请检查后端服务是否开启，或查看浏览器控制台获取更多信息。'
      );
    }
  };

  // 文字输入生成菜谱
  const handleTextSubmit = async () => {
    setIsSubmitting(true);
    setRecipe(null);
    setError(null);
    setImageError(null);
    clearImageAnalysis();

    await generateRecipe(userInput);
    setIsSubmitting(false);
  };

  // 图片识别食材功能
  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setIdentifiedIngredients([]);
    setRecipe(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/ingredients/analyze',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('图片分析失败');
      }

      const result: IngredientAnalysisResult = await response.json();

      if (result.success && result.ingredients.length > 0) {
        setIdentifiedIngredients(result.ingredients);
      } else {
        setAnalysisError(
          result.error || '未识别到食材，请尝试上传更清晰的食材图片'
        );
      }
    } catch (error) {
      console.error('图片分析错误:', error);
      setAnalysisError('图片分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 根据识别的食材生成菜谱（复用统一的生成函数）
  const handleGenerateFromIngredients = async (ingredients: string[]) => {
    if (ingredients.length === 0) return;

    setIsGeneratingFromIngredients(true);
    setError(null);

    // 构造描述文本，让现有的解析器处理
    const description = `食材：${ingredients.join(
      '、'
    )}。请用这些食材做一道简单美味的菜。`;

    await generateRecipe(description);
    setIsGeneratingFromIngredients(false);
  };

  // 图片生成功能
  const handleGenerateImage = async () => {
    if (!recipe) return;

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
          body: JSON.stringify({ recipe_json: recipe }),
        }
      );

      if (!response.ok) {
        throw new Error('生成图片失败');
      }

      const data = await response.json();

      setRecipe({
        ...recipe,
        image_url: data.image_url,
      });
    } catch (error) {
      console.error('生成图片时出错:', error);
      setImageError('生成图片失败，请稍后重试');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 辅助函数：清除图片识别相关状态
  const clearImageAnalysis = () => {
    setAnalysisError(null);
    setIdentifiedIngredients([]);
    setIsAnalyzing(false);
    setIsGeneratingFromIngredients(false);
  };

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🍳 AI 智能菜谱生成器</h1>

      {/* 图片上传功能 */}
      <ImageUpload
        onImageUpload={handleImageUpload}
        isAnalyzing={isAnalyzing}
        analysisError={analysisError}
        identifiedIngredients={identifiedIngredients}
        onGenerateRecipe={handleGenerateFromIngredients}
        isGeneratingRecipe={isGeneratingFromIngredients}
      />

      {/* 分隔线 */}
      <div
        style={{
          borderTop: '1px solid #ddd',
          margin: '30px 0',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '0 10px',
            color: '#666',
          }}
        >
          或者
        </span>
      </div>

      {/* 文字输入功能 */}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <h3>📝 描述你的需求</h3>

        <label htmlFor="requirements">告诉 AI 你的需求：</label>
        <br />
        <textarea
          id="requirements"
          rows={6}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginTop: '8px',
          }}
          placeholder="例如：我想用土豆和牛肉做一道简单的菜，半小时内完成..."
        />

        <br />
        <button
          onClick={handleTextSubmit}
          disabled={isSubmitting || !userInput.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor:
              isSubmitting || !userInput.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor:
              isSubmitting || !userInput.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            marginTop: '10px',
          }}
        >
          {isSubmitting ? '生成中...' : '生成菜谱'}
        </button>
      </div>

      {/* 结果显示区域 */}
      <div style={{ marginTop: '30px' }}>
        <h2>结果</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {recipe && (
          <RecipeCard
            recipe={recipe}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            imageError={imageError}
          />
        )}
        {!recipe && !error && <p>尚无结果</p>}
      </div>
    </main>
  );
}
