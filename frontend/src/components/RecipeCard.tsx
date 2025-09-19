import { RecipeCardProps } from '../types';

export default function RecipeCard({
  recipe,
  onGenerateImage,
  isGeneratingImage,
  imageError,
  onOptimizeRecipe,
  isOptimizing,
}: RecipeCardProps) {
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
          {/* 关键修改 B: onClick 使用从 Props 传来的 onGenerateImage */}
          <button
            onClick={onGenerateImage}
            disabled={isGeneratingImage}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isGeneratingImage ? 'not-allowed' : 'pointer',
              opacity: isGeneratingImage ? 0.6 : 1,
            }}
          >
            {isGeneratingImage ? '生成中...' : '生成图片'}
          </button>
          {/* 显示从 Props 传来的图片生成错误 */}
          {imageError && (
            <p style={{ marginTop: '10px', color: 'var(--error)' }}>
              {imageError}
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

      <h4>步骤:</h4>
      <ol>
        {recipe.instructions.map((instruction) => (
          <li key={instruction.step}>{instruction.description}</li>
        ))}
      </ol>

      <h4>营养信息:</h4>
      <p>
        卡路里: {recipe.nutritional_info.calories_kcal}kcal | 蛋白质:{' '}
        {recipe.nutritional_info.protein_g}g | 碳水:{' '}
        {recipe.nutritional_info.carbs_g}g | 脂肪:{' '}
        {recipe.nutritional_info.fat_g}g
      </p>

      {/* 小贴士区域 */}
      {recipe.tips.length > 0 && (
        <>
          <h4>小贴士:</h4>
          <ul>
            {recipe.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </>
      )}

      {/* 优化菜谱区域 */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>💬 继续优化菜谱</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOptimizeRecipe('简化一下制作步骤')}
            disabled={isOptimizing}
            style={{
              padding: '6px 12px',
              backgroundColor: isOptimizing ? '#ccc' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            简化步骤
          </button>
          <button
            onClick={() => onOptimizeRecipe('增加一些蔬菜')}
            disabled={isOptimizing}
            style={{
              padding: '6px 12px',
              backgroundColor: isOptimizing ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            增加蔬菜
          </button>
          <button
            onClick={() => onOptimizeRecipe('改成更健康的做法')}
            disabled={isOptimizing}
            style={{
              padding: '6px 12px',
              backgroundColor: isOptimizing ? '#ccc' : '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            更健康
          </button>
          <button
            onClick={() => onOptimizeRecipe('调整成素食版本')}
            disabled={isOptimizing}
            style={{
              padding: '6px 12px',
              backgroundColor: isOptimizing ? '#ccc' : '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            素食版本
          </button>
        </div>
        {isOptimizing && (
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              color: '#6c757d',
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
