import { ImageUploadProps } from '../types';

export default function ImageUpload({
  onImageUpload,
  isAnalyzing,
  analysisError,
  identifiedIngredients,
  onGenerateRecipe,
  isGeneratingRecipe,
}: ImageUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleGenerateRecipe = () => {
    onGenerateRecipe(identifiedIngredients); // 传递食材列表
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h3>📷 上传食材图片</h3>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isAnalyzing}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '300px',
          }}
        />
      </div>

      {isAnalyzing && (
        <p style={{ color: '#007bff' }}>🔍 正在分析图片中的食材...</p>
      )}

      {analysisError && <p style={{ color: 'red' }}>❌ {analysisError}</p>}

      {identifiedIngredients.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4>识别到的食材：</h4>
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
            }}
          >
            {identifiedIngredients.map((ingredient, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '4px 8px',
                  margin: '2px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {ingredient}
              </span>
            ))}
          </div>

          <button
            onClick={handleGenerateRecipe}
            disabled={isGeneratingRecipe}
            style={{
              padding: '10px 20px',
              backgroundColor: isGeneratingRecipe ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isGeneratingRecipe ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            {isGeneratingRecipe ? '生成菜谱中...' : '生成菜谱'}
          </button>
        </div>
      )}
    </div>
  );
}
