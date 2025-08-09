import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-slate-400 mt-1">Powered by N8N Workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300 text-sm">Online</span>
        </div>
      </div>
    </div>
  );
};