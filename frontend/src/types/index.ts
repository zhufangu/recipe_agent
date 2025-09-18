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

export interface RecipeCardProps {
  recipe: Recipe;
}
