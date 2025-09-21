// 共享的Tab导航组件
'use client';
import { TabType } from '../../types/appState';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  style?: 'classic' | 'modern';
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  style = 'classic',
}: TabNavigationProps) {
  if (style === 'modern') {
    return (
      <div
        style={{
          display: 'flex',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '6px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
          width: 'fit-content',
          margin: '0 auto 24px auto',
        }}
      >
        <button
          onClick={() => onTabChange('text')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            backgroundColor: activeTab === 'text' ? '#3b82f6' : 'transparent',
            color: activeTab === 'text' ? 'white' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📝 文字描述
        </button>
        <button
          onClick={() => onTabChange('image')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            backgroundColor: activeTab === 'image' ? '#3b82f6' : 'transparent',
            color: activeTab === 'image' ? 'white' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📷 图片识别
        </button>
      </div>
    );
  }

  // Classic style (原有样式)
  return (
    <div className="tab-navigation">
      <button
        onClick={() => onTabChange('text')}
        className={activeTab === 'text' ? 'tab-active' : 'tab-inactive'}
        style={{
          padding: '12px 24px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          borderRadius: '8px 8px 0 0',
          transition: 'all 0.3s ease',
        }}
      >
        📝 文字描述
      </button>
      <button
        onClick={() => onTabChange('image')}
        className={activeTab === 'image' ? 'tab-active' : 'tab-inactive'}
        style={{
          padding: '12px 24px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          borderRadius: '8px 8px 0 0',
          transition: 'all 0.3s ease',
        }}
      >
        📷 图片识别
      </button>
    </div>
  );
}
