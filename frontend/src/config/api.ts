/**
 * API 配置
 * 统一管理所有API端点
 */

// 获取API基础URL，优先使用环境变量，否则使用默认值
const getApiBaseUrl = (): string => {
  // 在浏览器环境中，Next.js会自动处理 NEXT_PUBLIC_ 前缀的环境变量
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  }

  // 服务端渲染时的默认值
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API 端点配置
export const API_ENDPOINTS = {
  // 菜谱相关
  RECIPES: {
    GENERATE: `${API_BASE_URL}/api/v1/recipes/generate`,
    OPTIMIZE: `${API_BASE_URL}/api/v1/recipes/optimize`,
    GENERATE_IMAGE: `${API_BASE_URL}/api/v1/recipes/generate-image`,
  },

  // 图片识别
  INGREDIENTS: {
    ANALYZE: `${API_BASE_URL}/api/v1/ingredients/analyze`,
  },

  // 智能分析
  INTENT: {
    ANALYZE: `${API_BASE_URL}/api/v1/intent/analyze`,
  },
} as const;

// 导出单个端点，方便使用
export const {
  RECIPES: {
    GENERATE: RECIPE_GENERATE_URL,
    OPTIMIZE: RECIPE_OPTIMIZE_URL,
    GENERATE_IMAGE: RECIPE_GENERATE_IMAGE_URL,
  },
  INGREDIENTS: { ANALYZE: INGREDIENT_ANALYZE_URL },
  INTENT: { ANALYZE: INTENT_ANALYZE_URL },
} = API_ENDPOINTS;
