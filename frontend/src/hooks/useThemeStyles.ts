import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../styles/themes';

export function useThemeStyles() {
  const { theme: currentTheme } = useTheme();
  const theme = getTheme(currentTheme);

  // 常用的样式组合
  const styles = {
    // 卡片样式
    card: {
      backgroundColor: theme.backgroundSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: `0 2px 8px ${theme.shadow}`,
      transition: 'all 0.3s ease',
    },

    // 输入框样式
    input: {
      backgroundColor: theme.background,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease',
    },

    // 按钮样式
    button: {
      primary: {
        backgroundColor: theme.primary,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
      secondary: {
        backgroundColor: theme.secondary,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
      success: {
        backgroundColor: theme.success,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
      warning: {
        backgroundColor: theme.warning,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
      danger: {
        backgroundColor: theme.danger,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
    },

    // 错误样式
    error: {
      color: theme.error,
      backgroundColor: theme.errorBackground,
      border: `1px solid ${theme.error}`,
      borderRadius: '4px',
      padding: '12px',
      fontSize: '14px',
    },

    // 标签样式
    tag: {
      backgroundColor: theme.primary,
      color: 'white',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    },
  };

  return { theme, styles };
}
