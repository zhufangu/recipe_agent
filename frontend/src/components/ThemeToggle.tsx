'use client';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getIcon = () => {
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getTooltip = () => {
    return theme === 'dark' ? '切换到浅色主题' : '切换到深色主题';
  };

  return (
    <button
      onClick={toggleTheme}
      title={getTooltip()}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: theme === 'dark' ? '2px solid #444' : '2px solid #e0e0e0',
        backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#333333',
        cursor: 'pointer',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow:
          theme === 'dark'
            ? '0 2px 8px rgba(255, 255, 255, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow =
          theme === 'dark'
            ? '0 4px 12px rgba(255, 255, 255, 0.2)'
            : '0 4px 12px rgba(0, 0, 0, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow =
          theme === 'dark'
            ? '0 2px 8px rgba(255, 255, 255, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)';
      }}
    >
      {getIcon()}
    </button>
  );
}
