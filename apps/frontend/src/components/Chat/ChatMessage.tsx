import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { formatDate } from '@/utils';
import { User, Bot, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps): React.ReactElement {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`flex gap-3 p-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-navy-900 text-white'
            : isError
            ? 'bg-red-100 text-red-600'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      <div
        className={`flex flex-col max-w-[80%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-navy-900 text-white'
              : isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-slate-50 text-slate-900 border border-slate-200'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        <div
          className={`text-xs text-slate-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatDate(message.timestamp, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

