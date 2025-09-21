// 应用状态管理类型定义
import { Recipe, ChatMessage } from './index';

// Tab 类型
export type TabType = 'image' | 'text';

// 基础 Tab 数据结构
export interface BaseTabData {
  conversation: ChatMessage[];
  recipe: Recipe | null;
  isGenerating: boolean;
  error: string | null;
}

// 图片识别 Tab 特有数据
export interface ImageTabData extends BaseTabData {
  identifiedIngredients: string[];
  isAnalyzing: boolean;
  analysisError: string | null;
}

// 文字输入 Tab 特有数据
export interface TextTabData extends BaseTabData {
  userInput: string;
}

// 进度条状态
export interface ProgressState {
  isVisible: boolean;
  progress: number; // 0-100
  message: string;
  variant: 'default' | 'recipe' | 'image' | 'analysis' | 'optimize';
}

// 全局 UI 状态
export interface UIState {
  isGeneratingImage: boolean;
  imageError: string | null;
  progressBar: ProgressState;
}

// 应用总状态
export interface AppState {
  // 当前激活的 Tab
  activeTab: TabType;

  // 各个 Tab 的数据
  tabs: {
    image: ImageTabData;
    text: TextTabData;
  };

  // 全局 UI 状态
  ui: UIState;
}

// Action 类型定义
export type AppAction =
  // Tab 切换
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }

  // 对话相关
  | { type: 'ADD_MESSAGE'; payload: { tab: TabType; message: ChatMessage } }

  // 菜谱生成相关
  | { type: 'START_RECIPE_GENERATION'; payload: { tab: TabType } }
  | {
      type: 'RECIPE_GENERATION_SUCCESS';
      payload: { tab: TabType; recipe: Recipe };
    }
  | {
      type: 'RECIPE_GENERATION_ERROR';
      payload: { tab: TabType; error: string };
    }

  // 图片识别相关
  | { type: 'START_IMAGE_ANALYSIS' }
  | { type: 'IMAGE_ANALYSIS_SUCCESS'; payload: { ingredients: string[] } }
  | { type: 'IMAGE_ANALYSIS_ERROR'; payload: { error: string } }
  | { type: 'ADD_INGREDIENT'; payload: { ingredient: string } }
  | { type: 'REMOVE_INGREDIENT'; payload: { ingredient: string } }

  // 文字输入相关
  | { type: 'UPDATE_TEXT_INPUT'; payload: { input: string } }

  // 图片生成相关
  | { type: 'START_IMAGE_GENERATION' }
  | { type: 'IMAGE_GENERATION_SUCCESS'; payload: { imageUrl: string } }
  | { type: 'IMAGE_GENERATION_ERROR'; payload: { error: string } }

  // 菜谱优化相关
  | { type: 'START_RECIPE_OPTIMIZATION'; payload: { tab: TabType } }
  | {
      type: 'RECIPE_OPTIMIZATION_SUCCESS';
      payload: { tab: TabType; recipe: Recipe };
    }
  | {
      type: 'RECIPE_OPTIMIZATION_ERROR';
      payload: { tab: TabType; error: string };
    }

  // 错误清除
  | {
      type: 'CLEAR_ERROR';
      payload: { tab?: TabType; errorType?: 'recipe' | 'image' | 'analysis' };
    }

  // 进度条控制
  | {
      type: 'SHOW_PROGRESS';
      payload: {
        message: string;
        variant: 'default' | 'recipe' | 'image' | 'analysis' | 'optimize';
      };
    }
  | { type: 'UPDATE_PROGRESS'; payload: { progress: number } }
  | { type: 'HIDE_PROGRESS' }

  // 重置状态
  | { type: 'RESET_TAB'; payload: { tab: TabType } }
  | { type: 'RESET_ALL' };

// 初始状态
export const initialAppState: AppState = {
  activeTab: 'text',
  tabs: {
    image: {
      conversation: [],
      recipe: null,
      isGenerating: false,
      error: null,
      identifiedIngredients: [],
      isAnalyzing: false,
      analysisError: null,
    },
    text: {
      conversation: [],
      recipe: null,
      isGenerating: false,
      error: null,
      userInput: '',
    },
  },
  ui: {
    isGeneratingImage: false,
    imageError: null,
    progressBar: {
      isVisible: false,
      progress: 0,
      message: '',
      variant: 'default',
    },
  },
};
