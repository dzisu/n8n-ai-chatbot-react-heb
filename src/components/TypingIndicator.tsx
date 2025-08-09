import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-xs lg:max-w-md xl:max-w-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div className="bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-600/30">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};