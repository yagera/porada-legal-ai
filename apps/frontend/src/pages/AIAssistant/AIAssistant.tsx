import React, { useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Chat } from '@/components/Chat';
import { Card } from '@/components/UI/Card';

export function AIAssistant(): React.ReactElement {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-navy-900 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Porada AI Assistant</h1>
              <p className="text-slate-600">Your intelligent legal document analyzer and advisor</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Card className="p-0 overflow-hidden h-[600px] flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-navy-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">AI Legal Assistant</h2>
                      <p className="text-sm text-slate-600">Ask questions about your documents</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <Chat 
                  placeholder="Upload your legal documents and ask me anything about them..."
                  maxHeight="h-full"
                  uploadedFiles={uploadedFiles}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">💡 Try asking:</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="text-sm font-medium text-blue-900">
                    "Analyze the risks in this contract"
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Get comprehensive risk assessment
                  </div>
                </button>
                
                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="text-sm font-medium text-green-900">
                    "What are the key terms I should review?"
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    Identify important clauses
                  </div>
                </button>
                
                <button className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                  <div className="text-sm font-medium text-amber-900">
                    "Compare this with standard terms"
                  </div>
                  <div className="text-xs text-amber-700 mt-1">
                    Benchmark against industry standards
                  </div>
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">🚀 Features</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Document analysis & risk assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Contract clause identification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Legal compliance checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Term comparison & benchmarking</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
