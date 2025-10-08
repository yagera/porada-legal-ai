import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatApiResponse, UseChatReturn } from '@/types/chat';
import { generateId } from '@/utils';

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastMessageRef = useRef<ChatMessage | null>(null);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          conversationId: generateId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response from AI');
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      lastMessageRef.current = assistantMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      const errorChatMessage: ChatMessage = {
        id: generateId(),
        content: `Error: ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorChatMessage]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    lastMessageRef.current = null;
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (!lastMessageRef.current || lastMessageRef.current.role !== 'user') return;

    const lastUserMessage = lastMessageRef.current;
    
    setMessages(prev => prev.filter(msg => msg.id !== lastUserMessage.id));
    setError(null);
    
    await sendMessage(lastUserMessage.content);
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    retryLastMessage,
  };
}

