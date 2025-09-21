// 现代化卡片布局的菜谱组件
'use client';
import { useAppState } from '../contexts/AppContext';
import { useRecipe } from '../hooks/useRecipe';
import { useChat } from '../hooks/useChat';
import { Recipe } from '../types';

interface ModernRecipeCardProps {
  recipe: Recipe;
}

export default function ModernRecipeCard({ recipe }: ModernRecipeCardProps) {
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header Card - 标题和基本信息 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
                lineHeight: '1.2',
              }}
            >
              {recipe.dish_name}
            </h1>
            <p
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.5',
                marginBottom: '16px',
              }}
            >
              {recipe.description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {recipe.cuisine_type}
          </span>
          <span
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {recipe.difficulty}
          </span>
          <span
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {recipe.servings}人份
          </span>
          <span
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {recipe.prep_time_mins + recipe.cook_time_mins}分钟
          </span>
        </div>
      </div>

      {/* 营养卡片 - 独立成行 */}
      <div
        style={{
          backgroundColor: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📊 营养成分
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔥</div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '4px',
              }}
            >
              {recipe.nutritional_info.calories_kcal}
            </div>
            <div
              style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}
            >
              千卡
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>💪</div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '4px',
              }}
            >
              {recipe.nutritional_info.protein_g}
            </div>
            <div
              style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}
            >
              蛋白质(g)
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌾</div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#f59e0b',
                marginBottom: '4px',
              }}
            >
              {recipe.nutritional_info.carbs_g}
            </div>
            <div
              style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}
            >
              碳水(g)
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🥑</div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#8b5cf6',
                marginBottom: '4px',
              }}
            >
              {recipe.nutritional_info.fat_g}
            </div>
            <div
              style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}
            >
              脂肪(g)
            </div>
          </div>
        </div>
      </div>

      {/* 食材+步骤 并排布局 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 3fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* 食材卡片 */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            height: 'fit-content',
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🥘 食材清单
          </h3>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #f3f4f6',
                }}
              >
                <span style={{ fontWeight: '500', color: '#374151' }}>
                  {ingredient.name}
                </span>
                <span
                  style={{
                    backgroundColor: '#e5e7eb',
                    color: '#6b7280',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {ingredient.amount} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 步骤卡片 */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            height: 'fit-content',
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            👨‍🍳 制作步骤
          </h3>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {recipe.instructions.map((instruction, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {instruction.step}
                </div>
                <p
                  style={{
                    color: '#374151',
                    lineHeight: '1.6',
                    margin: 0,
                    paddingTop: '2px',
                  }}
                >
                  {instruction.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 图片区域 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📸 菜品图片
        </h3>

        {recipe.image_url ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={recipe.image_url}
              alt={recipe.dish_name}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f3f4f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px',
              }}
            >
              📸
            </div>
            <button
              onClick={handleGenerateImage}
              disabled={state.ui.isGeneratingImage}
              style={{
                backgroundColor: state.ui.isGeneratingImage
                  ? '#9ca3af'
                  : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: state.ui.isGeneratingImage ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
              }}
            >
              {state.ui.isGeneratingImage ? '生成中...' : '🎨 生成菜品图片'}
            </button>
            {state.ui.imageError && (
              <p
                style={{
                  color: '#ef4444',
                  marginTop: '12px',
                  fontSize: '14px',
                }}
              >
                {state.ui.imageError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 小贴士卡片 */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #fed7aa',
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#92400e',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            💡 小贴士
          </h3>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {recipe.tips.map((tip, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  borderLeft: '4px solid #f59e0b',
                }}
              >
                <span
                  style={{
                    color: '#f59e0b',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                <span style={{ color: '#374151', lineHeight: '1.6' }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Card - 优化按钮区域 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🔧 菜谱优化
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[
            '简化一下制作步骤',
            '增加一些蛋白质含量',
            '降低一些热量',
            '调整口味更清淡一些',
            '让菜谱更适合素食者',
          ].map((text, index) => (
            <button
              key={index}
              onClick={() => handleOptimizeRecipe(text)}
              disabled={state.tabs[state.activeTab].isGenerating}
              style={{
                backgroundColor: state.tabs[state.activeTab].isGenerating
                  ? '#f3f4f6'
                  : '#f8fafc',
                color: state.tabs[state.activeTab].isGenerating
                  ? '#9ca3af'
                  : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: state.tabs[state.activeTab].isGenerating
                  ? 'not-allowed'
                  : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {text}
            </button>
          ))}
        </div>

        {state.tabs[state.activeTab].isGenerating && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#dbeafe',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1e40af',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #3b82f6',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              🤖 AI 正在优化菜谱...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
