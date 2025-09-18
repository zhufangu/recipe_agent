import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  imageError: string | null;
}

export default function RecipeCard({
  recipe,
  onGenerateImage,
  isGeneratingImage,
  imageError,
}: RecipeCardProps) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
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
            style={{
              padding: '10px 20px',
              backgroundColor: isGeneratingImage ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isGeneratingImage ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            {isGeneratingImage ? '生成中...' : '生成图片'}
          </button>
          {/* 显示从 Props 传来的图片生成错误 */}
          {imageError && (
            <p style={{ color: 'red', marginTop: '10px' }}>{imageError}</p>
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
    </div>
  );
}
