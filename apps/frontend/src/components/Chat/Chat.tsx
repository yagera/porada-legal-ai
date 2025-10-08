import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Trash2, Loader2, Upload } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/UI/Button';

interface ChatProps {
  className?: string;
  placeholder?: string;
  maxHeight?: string;
  uploadedFiles?: File[];
  onFileUpload?: (files: FileList) => void;
}

export function Chat({ 
  className = '', 
  placeholder = 'Ask me anything about your legal documents...',
  maxHeight = 'h-96',
  uploadedFiles = [],
  onFileUpload
}: ChatProps): React.ReactElement {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, isLoading, error, sendMessage, clearChat, retryLastMessage } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || isComposing) return;

    const message = inputValue.trim();
    setInputValue('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const canSend = inputValue.trim().length > 0 && !isLoading;
  const hasMessages = messages.length > 0;

  return (
    <div className={`flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-900">Legal AI Assistant</h3>
        </div>
        
        {hasMessages && (
          <div className="flex items-center gap-2">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={retryLastMessage}
                disabled={isLoading}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retry
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={isLoading}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto ${maxHeight}`}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Welcome to Porada AI</h4>
            <p className="text-slate-600 max-w-sm mb-4">
              I'm here to help you analyze legal documents, answer questions about contracts, 
              and provide legal insights. How can I assist you today?
            </p>
            
            {uploadedFiles.length > 0 && (
              <div className="w-full max-w-md">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">📄 Ready to analyze:</h5>
                  <div className="space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="text-xs text-blue-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex gap-3 p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed h-14"
              style={{ maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex gap-2">
            {onFileUpload && (
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => e.target.files && onFileUpload(e.target.files)}
                  className="hidden"
                  id="chat-file-upload"
                />
                <label htmlFor="chat-file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={isLoading}
                    leftIcon={<Upload className="w-4 h-4" />}
                    className="px-3 h-14"
                  >
                    Upload
                  </Button>
                </label>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={!canSend}
              loading={isLoading}
              leftIcon={!isLoading ? <Send className="w-4 h-4" /> : undefined}
              className="px-4 h-14"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {error && (
            <span className="text-red-600">Error: {error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
