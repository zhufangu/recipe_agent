'use client';
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, initialAppState } from '../types/appState';
import { appReducer } from '../store/appReducer';

// 创建 Context
const AppStateContext = createContext<AppState | null>(null);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | null>(
  null
);

// Provider 组件
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// 自定义 Hook 用于访问状态
export function useAppState(): AppState {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return state;
}

// 自定义 Hook 用于访问 dispatch
export function useAppDispatch(): React.Dispatch<AppAction> {
  const dispatch = useContext(AppDispatchContext);
  if (!dispatch) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return dispatch;
}

// 组合 Hook，同时获取状态和 dispatch
export function useApp(): [AppState, React.Dispatch<AppAction>] {
  return [useAppState(), useAppDispatch()];
}
