import { useState } from 'react';
import { ChatInterfaceProps, ChatMessage } from '../types';

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  placeholder = '与AI厨师对话...',
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;

    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fafafa',
      }}
    >
      <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>💬 与 AI厨师 对话</h4>

      {/* 对话历史 */}
      {messages.length > 0 && (
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'chat-message-user'
                  : 'chat-message-ai'
              }
              style={{
                marginBottom: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '4px',
                  fontWeight: '500',
                }}
              >
                {message.role === 'user' ? '👤 您' : '🤖 AI厨师'}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                {message.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          rows={2}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor:
              !inputMessage.trim() || isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor:
              !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
          }}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
