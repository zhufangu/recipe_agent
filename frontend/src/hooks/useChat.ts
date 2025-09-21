// 对话相关业务逻辑 Hook
import { useAppDispatch } from '../contexts/AppContext';
import { TabType } from '../types/appState';
import { ChatMessage } from '../types';

export function useChat() {
  const dispatch = useAppDispatch();

  // 添加消息到对话历史
  const addMessage = (tab: TabType, role: 'user' | 'ai', content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { tab, message },
    });

    return message;
  };

  // 添加用户消息
  const addUserMessage = (tab: TabType, content: string) => {
    return addMessage(tab, 'user', content);
  };

  // 添加 AI 消息
  const addAIMessage = (tab: TabType, content: string) => {
    return addMessage(tab, 'ai', content);
  };

  // 添加延迟的 AI 消息（用于模拟思考时间）
  const addDelayedAIMessage = (
    tab: TabType,
    content: string,
    delay: number = 500
  ) => {
    setTimeout(() => {
      addAIMessage(tab, content);
    }, delay);
  };

  return {
    addMessage,
    addUserMessage,
    addAIMessage,
    addDelayedAIMessage,
  };
}
