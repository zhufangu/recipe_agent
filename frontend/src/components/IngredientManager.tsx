import { useState } from 'react';
import { IngredientManagerProps } from '../types';

export default function IngredientManager({
  ingredients,
  onRemoveIngredient,
  onAddIngredient,
  isEditable,
}: IngredientManagerProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;

    onAddIngredient(newIngredient.trim());
    setNewIngredient('');
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    } else if (e.key === 'Escape') {
      setNewIngredient('');
      setIsAdding(false);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>🥘 食材列表</h4>

      {/* 食材标签 */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          minHeight: '60px',
          marginBottom: '8px',
        }}
      >
        {ingredients.length === 0 ? (
          <div
            style={{
              color: '#666',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px 0',
            }}
          >
            暂无食材
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ingredients.map((ingredient, index) => (
              <div
                key={`${ingredient}-${index}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  gap: '4px',
                }}
              >
                <span>{ingredient}</span>
                {isEditable && (
                  <button
                    onClick={() => onRemoveIngredient(ingredient)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '12px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="删除食材"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加食材 */}
      {isEditable && (
        <div>
          {isAdding ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入食材名称"
                autoFocus
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddIngredient}
                disabled={!newIngredient.trim()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: !newIngredient.trim() ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !newIngredient.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                添加
              </button>
              <button
                onClick={() => {
                  setNewIngredient('');
                  setIsAdding(false);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ➕ 添加食材
            </button>
          )}
        </div>
      )}
    </div>
  );
}
