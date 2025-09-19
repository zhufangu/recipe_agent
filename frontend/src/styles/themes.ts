export interface ThemeColors {
  // 背景色
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // 文字色
  text: string;
  textSecondary: string;
  textMuted: string;

  // 边框色
  border: string;
  borderLight: string;

  // 按钮色
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  success: string;
  successHover: string;
  warning: string;
  warningHover: string;
  danger: string;
  dangerHover: string;

  // 状态色
  error: string;
  errorBackground: string;
  info: string;
  infoBackground: string;

  // 阴影
  shadow: string;
  shadowHover: string;
}

export const lightTheme: ThemeColors = {
  // 背景色
  background: '#ffffff',
  backgroundSecondary: '#fafafa',
  backgroundTertiary: '#f8f9fa',

  // 文字色
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',

  // 边框色
  border: '#e0e0e0',
  borderLight: '#f0f0f0',

  // 按钮色
  primary: '#007bff',
  primaryHover: '#0056b3',
  secondary: '#17a2b8',
  secondaryHover: '#138496',
  success: '#28a745',
  successHover: '#1e7e34',
  warning: '#fd7e14',
  warningHover: '#e55a00',
  danger: '#dc3545',
  dangerHover: '#c82333',

  // 状态色
  error: '#721c24',
  errorBackground: '#f8d7da',
  info: '#007bff',
  infoBackground: '#e3f2fd',

  // 阴影
  shadow: 'rgba(0, 0, 0, 0.15)',
  shadowHover: 'rgba(0, 0, 0, 0.25)',
};

export const darkTheme: ThemeColors = {
  // 背景色
  background: '#1a1a1a',
  backgroundSecondary: '#2a2a2a',
  backgroundTertiary: '#333333',

  // 文字色
  text: '#ffffff',
  textSecondary: '#cccccc',
  textMuted: '#999999',

  // 边框色
  border: '#444444',
  borderLight: '#555555',

  // 按钮色
  primary: '#4dabf7',
  primaryHover: '#339af0',
  secondary: '#20c997',
  secondaryHover: '#17a085',
  success: '#51cf66',
  successHover: '#40c057',
  warning: '#ffa94d',
  warningHover: '#ff922b',
  danger: '#ff6b6b',
  dangerHover: '#ff5252',

  // 状态色
  error: '#ffb3ba',
  errorBackground: '#3d1a1d',
  info: '#4dabf7',
  infoBackground: '#1a2332',

  // 阴影
  shadow: 'rgba(255, 255, 255, 0.1)',
  shadowHover: 'rgba(255, 255, 255, 0.2)',
};

export const getTheme = (theme: 'light' | 'dark'): ThemeColors => {
  return theme === 'dark' ? darkTheme : lightTheme;
};
