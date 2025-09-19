export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Instruction {
  step: number;
  description: string;
}

export interface NutritionalInfo {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Recipe {
  dish_name: string;
  description: string;
  cuisine_type: string;
  difficulty: string;
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tips: string[];
  nutritional_info: NutritionalInfo;
  image_url?: string;
}

// 对话相关类型
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface TabState {
  conversation: ChatMessage[];
  recipe: Recipe | null;
  isGenerating: boolean;
  error: string | null;
}

export interface ImageTabState extends TabState {
  identifiedIngredients: string[];
  isAnalyzing: boolean;
  analysisError: string | null;
}

export interface TextTabState extends TabState {
  userInput: string;
}

// 组件 Props 接口
export interface RecipeCardProps {
  recipe: Recipe;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  imageError: string | null;
  onOptimizeRecipe: (message: string) => void;
  isOptimizing: boolean;
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export interface IngredientManagerProps {
  ingredients: string[];
  onRemoveIngredient: (ingredient: string) => void;
  onAddIngredient: (ingredient: string) => void;
  isEditable: boolean;
}

export interface ImageRecognitionTabProps {
  state: ImageTabState;
  onImageUpload: (file: File) => void;
  onSendMessage: (message: string) => void;
  onRemoveIngredient: (ingredient: string) => void;
  onAddIngredient: (ingredient: string) => void;
  onGenerateRecipe: () => void;
  onGenerateImage?: () => void;
  isGeneratingImage?: boolean;
  imageError: string | null;
}

export interface TextInputTabProps {
  state: TextTabState;
  onInputChange: (input: string) => void;
  onSendMessage: (message: string) => void;
  onGenerateRecipe: () => void;
  onGenerateImage?: () => void;
  isGeneratingImage?: boolean;
  imageError: string | null;
}

export interface IngredientAnalysisResult {
  success: boolean;
  ingredients: string[];
  confidence?: string;
  error?: string;
}

// 主题相关类型
export type Theme = 'light' | 'dark';
