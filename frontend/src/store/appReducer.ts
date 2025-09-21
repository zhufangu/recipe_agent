// 应用状态 Reducer
import { AppState, AppAction } from '../types/appState';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Tab 切换
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };

    // 对话相关
    case 'ADD_MESSAGE':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: {
            ...state.tabs[action.payload.tab],
            conversation: [
              ...state.tabs[action.payload.tab].conversation,
              action.payload.message,
            ],
          },
        },
      };

    // 菜谱生成相关
    case 'START_RECIPE_GENERATION':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: {
            ...state.tabs[action.payload.tab],
            isGenerating: true,
            error: null,
          },
        },
      };

    case 'RECIPE_GENERATION_SUCCESS':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: {
            ...state.tabs[action.payload.tab],
            recipe: action.payload.recipe,
            isGenerating: false,
            error: null,
          },
        },
      };

    case 'RECIPE_GENERATION_ERROR':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: {
            ...state.tabs[action.payload.tab],
            isGenerating: false,
            error: action.payload.error,
          },
        },
      };

    // 图片识别相关
    case 'START_IMAGE_ANALYSIS':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          image: {
            ...state.tabs.image,
            isAnalyzing: true,
            analysisError: null,
            identifiedIngredients: [],
          },
        },
      };

    case 'IMAGE_ANALYSIS_SUCCESS':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          image: {
            ...state.tabs.image,
            isAnalyzing: false,
            analysisError: null,
            identifiedIngredients: action.payload.ingredients,
          },
        },
      };

    case 'IMAGE_ANALYSIS_ERROR':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          image: {
            ...state.tabs.image,
            isAnalyzing: false,
            analysisError: action.payload.error,
          },
        },
      };

    case 'ADD_INGREDIENT':
      if (
        action.payload.ingredient.trim() &&
        !state.tabs.image.identifiedIngredients.includes(
          action.payload.ingredient.trim()
        )
      ) {
        return {
          ...state,
          tabs: {
            ...state.tabs,
            image: {
              ...state.tabs.image,
              identifiedIngredients: [
                ...state.tabs.image.identifiedIngredients,
                action.payload.ingredient.trim(),
              ],
            },
          },
        };
      }
      return state;

    case 'REMOVE_INGREDIENT':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          image: {
            ...state.tabs.image,
            identifiedIngredients:
              state.tabs.image.identifiedIngredients.filter(
                (ingredient) => ingredient !== action.payload.ingredient
              ),
          },
        },
      };

    // 文字输入相关
    case 'UPDATE_TEXT_INPUT':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          text: {
            ...state.tabs.text,
            userInput: action.payload.input,
          },
        },
      };

    // 图片生成相关
    case 'START_IMAGE_GENERATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          isGeneratingImage: true,
          imageError: null,
        },
      };

    case 'IMAGE_GENERATION_SUCCESS':
      // 更新当前激活 tab 的菜谱图片
      const currentTab = state.activeTab;
      const currentRecipe = state.tabs[currentTab].recipe;

      if (!currentRecipe) return state;

      return {
        ...state,
        tabs: {
          ...state.tabs,
          [currentTab]: {
            ...state.tabs[currentTab],
            recipe: {
              ...currentRecipe,
              image_url: action.payload.imageUrl,
            },
          },
        },
        ui: {
          ...state.ui,
          isGeneratingImage: false,
          imageError: null,
        },
      };

    case 'IMAGE_GENERATION_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          isGeneratingImage: false,
          imageError: action.payload.error,
        },
      };

    // 菜谱优化相关
    case 'START_RECIPE_OPTIMIZATION':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: {
            ...state.tabs[action.payload.tab],
            isGenerating: true,
            error: null,
          },
        },
      };

    case 'RECIPE_OPTIMIZATION_SUCCESS':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: {
            ...state.tabs[action.payload.tab],
            recipe: action.payload.recipe,
            isGenerating: false,
            error: null,
          },
        },
      };

    case 'RECIPE_OPTIMIZATION_ERROR':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: {
            ...state.tabs[action.payload.tab],
            isGenerating: false,
            error: action.payload.error,
          },
        },
      };

    // 错误清除
    case 'CLEAR_ERROR':
      if (action.payload.tab && action.payload.errorType) {
        const { tab, errorType } = action.payload;

        if (errorType === 'analysis' && tab === 'image') {
          return {
            ...state,
            tabs: {
              ...state.tabs,
              image: {
                ...state.tabs.image,
                analysisError: null,
              },
            },
          };
        }

        if (errorType === 'recipe') {
          return {
            ...state,
            tabs: {
              ...state.tabs,
              [tab]: {
                ...state.tabs[tab],
                error: null,
              },
            },
          };
        }

        if (errorType === 'image') {
          return {
            ...state,
            ui: {
              ...state.ui,
              imageError: null,
            },
          };
        }
      }
      return state;

    // 重置状态
    case 'RESET_TAB':
      const { tab } = action.payload;
      if (tab === 'image') {
        return {
          ...state,
          tabs: {
            ...state.tabs,
            image: {
              conversation: [],
              recipe: null,
              isGenerating: false,
              error: null,
              identifiedIngredients: [],
              isAnalyzing: false,
              analysisError: null,
            },
          },
        };
      } else {
        return {
          ...state,
          tabs: {
            ...state.tabs,
            text: {
              conversation: [],
              recipe: null,
              isGenerating: false,
              error: null,
              userInput: '',
            },
          },
        };
      }

    case 'SHOW_PROGRESS':
      return {
        ...state,
        ui: {
          ...state.ui,
          progressBar: {
            isVisible: true,
            progress: 0,
            message: action.payload.message,
            variant: action.payload.variant,
          },
        },
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        ui: {
          ...state.ui,
          progressBar: {
            ...state.ui.progressBar,
            progress: action.payload.progress,
          },
        },
      };

    case 'HIDE_PROGRESS':
      return {
        ...state,
        ui: {
          ...state.ui,
          progressBar: {
            ...state.ui.progressBar,
            isVisible: false,
          },
        },
      };

    case 'RESET_ALL':
      return {
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

    default:
      return state;
  }
}
