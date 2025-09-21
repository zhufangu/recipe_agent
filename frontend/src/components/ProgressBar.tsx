interface ProgressBarProps {
  progress: number; // 0-100
  message: string;
  isVisible: boolean;
  variant?: 'default' | 'recipe' | 'image' | 'analysis' | 'optimize';
}

export default function ProgressBar({
  progress,
  message,
  isVisible,
  variant = 'default',
}: ProgressBarProps) {
  if (!isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'recipe':
        return {
          barColor: '#28a745', // 绿色 - 菜谱生成
          bgColor: '#d4edda',
          icon: '👨‍🍳',
        };
      case 'image':
        return {
          barColor: '#007bff', // 蓝色 - 图片生成
          bgColor: '#d1ecf1',
          icon: '🖼️',
        };
      case 'analysis':
        return {
          barColor: '#fd7e14', // 橙色 - 图片识别
          bgColor: '#fff3cd',
          icon: '🔍',
        };
      case 'optimize':
        return {
          barColor: '#6f42c1', // 紫色 - 菜谱优化
          bgColor: '#e2e3f3',
          icon: '🔧',
        };
      default:
        return {
          barColor: '#6c757d', // 灰色 - 默认
          bgColor: '#f8f9fa',
          icon: '⏳',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        minWidth: '320px',
        maxWidth: '400px',
        border: '1px solid #e0e0e0',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* 标题区域 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '24px', marginRight: '10px' }}>
          {styles.icon}
        </span>
        <h3
          style={{
            margin: 0,
            color: '#333',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          {message}
        </h3>
      </div>

      {/* 进度条容器 */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: styles.bgColor,
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        {/* 进度条 */}
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: styles.barColor,
            borderRadius: '4px',
            transition: 'width 0.3s ease-in-out',
            background: `linear-gradient(90deg, ${styles.barColor}, ${styles.barColor}dd)`,
          }}
        />
      </div>

      {/* 进度百分比 */}
      <div
        style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        {progress}%
      </div>

      {/* 动画点 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '4px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bounce-dot"
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: styles.barColor,
                borderRadius: '50%',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .bounce-dot {
          animation: bounce 1.4s infinite ease-in-out both;
        }
      `}</style>
    </div>
  );
}
