import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 智能菜谱生成器 - 现代化版本',
  description: '现代化布局的AI菜谱生成器，支持图片识别和自然语言交互',
};

export default function NewLayoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
