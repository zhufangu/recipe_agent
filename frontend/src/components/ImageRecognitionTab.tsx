import { ImageRecognitionTabProps } from '../types/componentProps';
import ChatInterface from './ChatInterface';
import IngredientManager from './IngredientManager';
import SmartRecipeCard from './SmartRecipeCard';

export default function ImageRecognitionTab({
  state,
  onImageUpload,
  onSendMessage,
  onRemoveIngredient,
  onAddIngredient,
  onGenerateRecipe,
}: ImageRecognitionTabProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📷 图片识别</h3>

      {/* 图片上传区域 */}
      <div
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px',
          backgroundColor: '#fafafa',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={state.isAnalyzing}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '300px',
            }}
          />
        </div>

        {state.isAnalyzing && (
          <p style={{ color: '#007bff', margin: '8px 0' }}>
            🔍 正在分析图片中的食材...
          </p>
        )}

        {state.analysisError && (
          <p style={{ color: 'red', margin: '8px 0' }}>
            ❌ {state.analysisError}
          </p>
        )}
      </div>

      {/* 食材管理 */}
      {state.identifiedIngredients.length > 0 && (
        <IngredientManager
          ingredients={state.identifiedIngredients}
          onRemoveIngredient={onRemoveIngredient}
          onAddIngredient={onAddIngredient}
          isEditable={true}
        />
      )}

      {/* 对话界面 */}
      {state.identifiedIngredients.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <ChatInterface
            messages={state.conversation}
            onSendMessage={onSendMessage}
            isLoading={state.isGenerating}
            placeholder="告诉 AI 你的需求，比如：我想做清淡的菜..."
          />
        </div>
      )}

      {/* 生成菜谱按钮 */}
      {state.identifiedIngredients.length > 0 && !state.recipe && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={onGenerateRecipe}
            disabled={state.isGenerating}
            style={{
              padding: '12px 24px',
              backgroundColor: state.isGenerating ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: state.isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            {state.isGenerating ? '生成菜谱中...' : '生成菜谱'}
          </button>
        </div>
      )}

      {/* 错误显示 */}
      {state.error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            marginBottom: '20px',
          }}
        >
          ❌ {state.error}
        </div>
      )}

      {/* 菜谱显示 */}
      {state.recipe && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>📋 生成的菜谱</h4>
          <SmartRecipeCard recipe={state.recipe} />
        </div>
      )}
    </div>
  );
}
