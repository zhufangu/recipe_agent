// 现代化的文字输入Tab组件
'use client';
import { TextInputTabProps } from '../../types/componentProps';
import ChatInterface from '../ChatInterface';
import ModernRecipeCard from '../ModernRecipeCard';

export default function ModernTextInputTab({
  state,
  onInputChange,
  onSendMessage,
  onGenerateRecipe,
}: TextInputTabProps) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 初始输入区域 */}
      {state.conversation.length === 0 && (
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
              📝
            </div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
              }}
            >
              描述您的菜谱需求
            </h3>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              告诉AI您想要什么样的菜谱，包括食材、口味、时间等要求
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <textarea
              rows={4}
              value={state.userInput}
              onChange={(e) => onInputChange(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                transition: 'border-color 0.2s',
                ':focus': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              }}
              placeholder="例如：我想用土豆和牛肉做一道简单的菜，半小时内完成，口味不要太重..."
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                if (state.userInput.trim()) {
                  onSendMessage(state.userInput.trim());
                }
              }}
              disabled={!state.userInput.trim() || state.isGenerating}
              style={{
                backgroundColor:
                  !state.userInput.trim() || state.isGenerating
                    ? '#9ca3af'
                    : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '500',
                cursor:
                  !state.userInput.trim() || state.isGenerating
                    ? 'not-allowed'
                    : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                transition: 'all 0.2s',
              }}
            >
              {state.isGenerating ? '处理中...' : '🚀 开始生成'}
            </button>
          </div>
        </div>
      )}

      {/* 对话界面 */}
      {state.conversation.length > 0 && (
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
            placeholder="继续与 AI 对话，优化你的需求..."
          />
        </div>
      )}

      {/* 生成菜谱按钮 */}
      {state.conversation.length > 0 && !state.recipe && (
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
