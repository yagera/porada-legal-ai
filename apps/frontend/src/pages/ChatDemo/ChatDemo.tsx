import React from 'react';
import { Chat } from '@/components/Chat';
import { Card } from '@/components/UI/Card';

export function ChatDemo(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Legal Assistant Demo</h1>
        <p className="text-slate-600">
          Test the chat functionality with our AI legal assistant. Ask questions about legal documents, 
          contracts, or get legal insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <Chat 
              placeholder="Ask me about contract analysis, legal risks, or document review..."
              maxHeight="h-[600px]"
            />
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2">💡 Try asking:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• "What should I look for in a service agreement?"</li>
              <li>• "Explain liability clauses in contracts"</li>
              <li>• "What are common contract risks?"</li>
              <li>• "How to review payment terms?"</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2">🔧 Features:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Real-time AI responses</li>
              <li>• Error handling & retry</li>
              <li>• Message history</li>
              <li>• Mobile responsive</li>
              <li>• Keyboard shortcuts</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2">⌨️ Shortcuts:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Enter</kbd> Send message</li>
              <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Shift+Enter</kbd> New line</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

