// 智能 RecipeCard 组件 - 使用 Context 直接访问状态和功能
'use client';
import { useAppState } from '../contexts/AppContext';
import { useRecipe } from '../hooks/useRecipe';
import { useChat } from '../hooks/useChat';
import { Recipe } from '../types';

interface SmartRecipeCardProps {
  recipe: Recipe;
}

export default function SmartRecipeCard({ recipe }: SmartRecipeCardProps) {
  const state = useAppState();
  const { generateRecipeImage, optimizeRecipe } = useRecipe();
  const { addUserMessage, addDelayedAIMessage } = useChat();

  const handleGenerateImage = async () => {
    try {
      await generateRecipeImage(recipe);
    } catch {
      // 错误已在 useRecipe 中处理
    }
  };

  const handleOptimizeRecipe = async (message: string) => {
    const currentTab = state.activeTab;
    addUserMessage(currentTab, message);

    try {
      const result = await optimizeRecipe(
        recipe,
        message,
        state.tabs[currentTab].conversation,
        currentTab
      );

      if (result.type === 'off_topic_reminder') {
        addDelayedAIMessage(currentTab, result.message);
      } else if (result.type === 'success') {
        addDelayedAIMessage(
          currentTab,
          `我已经根据您的需求"${message}"优化了菜谱。新的菜谱已经体现了您要求的改进。`
        );
      }
    } catch {
      addDelayedAIMessage(
        currentTab,
        '抱歉，优化菜谱时遇到了问题，请稍后重试。'
      );
    }
  };

  return (
    <div
      className="recipe-card"
      style={{
        padding: '20px',
        margin: '20px 0',
        borderRadius: '8px',
      }}
    >
      {/* 图片区域 */}
      {recipe.image_url ? (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={recipe.image_url}
            alt={recipe.dish_name}
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              borderRadius: '8px',
            }}
          />
        </div>
      ) : (
        // 如果没有图片，则显示生成按钮
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <button
            onClick={handleGenerateImage}
            disabled={state.ui.isGeneratingImage}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: state.ui.isGeneratingImage ? 'not-allowed' : 'pointer',
              opacity: state.ui.isGeneratingImage ? 0.6 : 1,
            }}
          >
            {state.ui.isGeneratingImage ? '生成中...' : '生成图片'}
          </button>
          {state.ui.imageError && (
            <p style={{ marginTop: '10px', color: 'var(--error)' }}>
              {state.ui.imageError}
            </p>
          )}
        </div>
      )}

      {/* 菜谱信息区域 */}
      <h3>{recipe.dish_name}</h3>
      <p>{recipe.description}</p>
      <p>
        菜系: {recipe.cuisine_type} | 难度: {recipe.difficulty} | 份数:{' '}
        {recipe.servings}
      </p>
      <p>
        准备时间: {recipe.prep_time_mins}分钟 | 烹饪时间:{' '}
        {recipe.cook_time_mins}分钟
      </p>

      <h4>食材:</h4>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.name}: {ingredient.amount} {ingredient.unit}
          </li>
        ))}
      </ul>

      <h4>制作步骤:</h4>
      <ol>
        {recipe.instructions.map((instruction, index) => (
          <li key={index} style={{ marginBottom: '8px' }}>
            {instruction.description}
          </li>
        ))}
      </ol>

      <h4>营养信息:</h4>
      <p>
        热量: {recipe.nutritional_info.calories_kcal} 千卡 | 蛋白质:{' '}
        {recipe.nutritional_info.protein_g}g | 碳水化合物:{' '}
        {recipe.nutritional_info.carbs_g}g | 脂肪:{' '}
        {recipe.nutritional_info.fat_g}g
      </p>

      {recipe.tips && recipe.tips.length > 0 && (
        <>
          <h4>小贴士:</h4>
          <ul>
            {recipe.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </>
      )}

      {/* 优化菜谱区域 - 简化版本 */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'var(--background-tertiary)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>💬 继续优化菜谱</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOptimizeRecipe('简化一下制作步骤')}
            disabled={state.tabs[state.activeTab].isGenerating}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              opacity: state.tabs[state.activeTab].isGenerating ? 0.6 : 1,
            }}
          >
            简化步骤
          </button>
          <button
            onClick={() => handleOptimizeRecipe('增加一些蔬菜')}
            disabled={state.tabs[state.activeTab].isGenerating}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              opacity: state.tabs[state.activeTab].isGenerating ? 0.6 : 1,
            }}
          >
            增加蔬菜
          </button>
          <button
            onClick={() => handleOptimizeRecipe('减少热量')}
            disabled={state.tabs[state.activeTab].isGenerating}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              opacity: state.tabs[state.activeTab].isGenerating ? 0.6 : 1,
            }}
          >
            减少热量
          </button>
          <button
            onClick={() => handleOptimizeRecipe('改成素食版本')}
            disabled={state.tabs[state.activeTab].isGenerating}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              opacity: state.tabs[state.activeTab].isGenerating ? 0.6 : 1,
            }}
          >
            素食版本
          </button>
        </div>
        {state.tabs[state.activeTab].isGenerating && (
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            🤖 AI 正在优化菜谱...
          </p>
        )}
      </div>
    </div>
  );
}
