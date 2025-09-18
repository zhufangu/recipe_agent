'use client'; // 声明为客户端组件
import { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types';

export default function Home() {
  // 所有状态都在这里统一管理
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 图片生成相关状态也由父组件管理
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // 菜谱生成逻辑
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setRecipe(null);
    setError(null);
    setImageError(null);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/recipes/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: userInput }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Recipe = await response.json();
      setRecipe(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(
        '提交失败，请检查后端服务是否开启，或查看浏览器控制台获取更多信息。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 图片生成逻辑 ---
  const handleGenerateImage = async () => {
    if (!recipe) return;

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/recipes/generate-image',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // 注意：这里传递完整的 recipe 对象，而不是 { recipe }
          body: JSON.stringify({ recipe_json: recipe }),
        }
      );
      if (!response.ok) {
        throw new Error('生成图片失败');
      }
      const data = await response.json();

      // 更新菜谱数据，添加图片URL
      setRecipe({
        ...recipe,
        image_url: data.image_url,
      });
    } catch (error) {
      console.error('生成图片时出错:', error);
      setImageError('生成图片失败，请稍后重试。');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">AI 菜谱生成器</h1>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={6}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="例如：我想用土豆和牛肉做一道简单的菜，30分钟内完成"
      />
      <button
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={isSubmitting || !userInput.trim()}
      >
        {isSubmitting ? '生成菜谱中...' : '生成菜谱'}
      </button>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">结果</h2>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {recipe && (
          <RecipeCard
            recipe={recipe}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            imageError={imageError}
          />
        )}
        {!recipe && !error && <p className="mt-2">尚无结果</p>}
      </div>
    </main>
  );
}
