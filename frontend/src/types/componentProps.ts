// 更新后的组件 Props 接口 - 简化版本，消除 Prop Drilling
import { ImageTabData, TextTabData } from './appState';
import { Recipe, ChatMessage } from './index';

// RecipeCard 组件 Props - 简化版本
export interface RecipeCardProps {
  recipe: Recipe;
}

// ChatInterface 组件 Props - 保持原有接口
export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

// IngredientManager 组件 Props - 保持原有接口
export interface IngredientManagerProps {
  ingredients: string[];
  onRemoveIngredient: (ingredient: string) => void;
  onAddIngredient: (ingredient: string) => void;
  isEditable: boolean;
}

// Tab 组件 Props - 简化版本，只传递必要的状态
export interface ImageRecognitionTabProps {
  state: ImageTabData;
  onImageUpload: (file: File) => void;
  onSendMessage: (message: string) => void;
  onRemoveIngredient: (ingredient: string) => void;
  onAddIngredient: (ingredient: string) => void;
  onGenerateRecipe: () => void;
}

export interface TextInputTabProps {
  state: TextTabData;
  onInputChange: (input: string) => void;
  onSendMessage: (message: string) => void;
  onGenerateRecipe: () => void;
}
