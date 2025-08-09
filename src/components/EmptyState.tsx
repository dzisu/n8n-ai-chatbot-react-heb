import React from 'react';
import { Bot } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <Bot size={64} className="mb-4 opacity-50" />
      <h3 className="text-xl font-medium mb-2">Welcome to AI Assistant</h3>
      <p className="text-center max-w-md">
        Start your conversation with AI Assistant powered by n8n workflow. 
        Type a message to begin chatting.
      </p>
    </div>
  );
};