// 现代化的图片识别Tab组件
'use client';
import { ImageRecognitionTabProps } from '../../types/componentProps';
import ChatInterface from '../ChatInterface';
import IngredientManager from '../IngredientManager';
import ModernRecipeCard from '../ModernRecipeCard';

export default function ModernImageRecognitionTab({
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 图片上传区域 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
            }}
          >
            📷
          </div>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px',
            }}
          >
            上传食材图片
          </h3>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            上传包含食材的图片，AI会自动识别并为您生成菜谱
          </p>
        </div>

        <div
          style={{
            border: '2px dashed #d1d5db',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            transition: 'all 0.2s',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#e5e7eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '20px',
            }}
          >
            🖼️
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={state.isAnalyzing}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: state.isAnalyzing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            />
          </div>

          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 16px 0',
            }}
          >
            支持 JPG、PNG、WebP 格式，文件大小不超过 10MB
          </p>

          {state.isAnalyzing && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '500',
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
              🔍 正在分析图片中的食材...
            </div>
          )}

          {state.analysisError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <span>❌</span>
              {state.analysisError}
            </div>
          )}
        </div>
      </div>

      {/* 食材管理 */}
      {state.identifiedIngredients.length > 0 && (
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
          <h4
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
            🥘 识别的食材
          </h4>
          <IngredientManager
            ingredients={state.identifiedIngredients}
            onRemoveIngredient={onRemoveIngredient}
            onAddIngredient={onAddIngredient}
            isEditable={true}
          />
        </div>
      )}

      {/* 对话界面 */}
      {state.identifiedIngredients.length > 0 && (
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
          <h4
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
            💬 与 AI厨师 对话
          </h4>
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            onClick={onGenerateRecipe}
            disabled={state.isGenerating}
            style={{
              backgroundColor: state.isGenerating ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: state.isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
            }}
          >
            {state.isGenerating ? (
              <>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                ></div>
                生成菜谱中...
              </>
            ) : (
              <>🍳 生成菜谱</>
            )}
          </button>
        </div>
      )}

      {/* 错误显示 */}
      {state.error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>❌</span>
          <span style={{ color: '#dc2626', fontWeight: '500' }}>
            {state.error}
          </span>
        </div>
      )}

      {/* 菜谱显示 */}
      {state.recipe && (
        <div>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
            }}
          >
            <span style={{ fontSize: '24px', marginRight: '8px' }}>🎉</span>
            <span
              style={{ fontSize: '18px', fontWeight: '600', color: '#166534' }}
            >
              菜谱生成完成！
            </span>
          </div>
          <ModernRecipeCard recipe={state.recipe} />
        </div>
      )}
    </div>
  );
}
