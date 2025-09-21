import { TextInputTabProps } from '../../types/componentProps';
import ChatInterface from '../ChatInterface';
import SmartRecipeCard from './SmartRecipeCard';

export default function TextInputTab({
  state,
  onInputChange,
  onSendMessage,
  onGenerateRecipe,
}: TextInputTabProps) {
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📝 文字描述</h3>

      {/* 初始输入区域 */}
      {state.conversation.length === 0 && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#fafafa',
          }}
        >
          <label
            htmlFor="requirements"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333',
            }}
          >
            告诉 AI 你的需求：
          </label>
          <textarea
            id="requirements"
            rows={4}
            value={state.userInput}
            onChange={(e) => onInputChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
            }}
            placeholder="例如：我想用土豆和牛肉做一道简单的菜，半小时内完成..."
          />

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              onClick={() => {
                if (state.userInput.trim()) {
                  onSendMessage(state.userInput.trim());
                }
              }}
              disabled={!state.userInput.trim() || state.isGenerating}
              style={{
                padding: '10px 20px',
                backgroundColor:
                  !state.userInput.trim() || state.isGenerating
                    ? '#ccc'
                    : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor:
                  !state.userInput.trim() || state.isGenerating
                    ? 'not-allowed'
                    : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              {state.isGenerating ? '处理中...' : '开始对话'}
            </button>
          </div>
        </div>
      )}

      {/* 对话界面 */}
      {state.conversation.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
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
