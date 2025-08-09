import React from 'react';
import { MessageCircle, Trash2, Download } from 'lucide-react';
import { ChatSession } from '../types/chat';
import { StorageService } from '../services/storageService';

interface ChatSidebarProps {
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onCreateNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  n8nWebhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
  onExportChat: () => void;
  hasMessages: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatSessions,
  currentSessionId,
  onCreateNewSession,
  onSwitchSession,
  onDeleteSession,
  n8nWebhookUrl,
  onWebhookUrlChange,
  onExportChat,
  hasMessages
}) => {
  return (
    <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="text-blue-400" />
          Chat History
        </h2>
        <button
          onClick={onCreateNewSession}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
        >
          New Chat
        </button>
      </div>
      
      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatSessions.map((session) => (
          <div
            key={session.id}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
              currentSessionId === session.id
                ? 'bg-blue-600/20 border border-blue-500/30'
                : 'hover:bg-slate-700/30 border border-transparent'
            }`}
            onClick={() => onSwitchSession(session.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {session.title}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {session.lastUpdated.toLocaleDateString('en-US')}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all duration-200 ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Settings */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="mb-4">
          <label className="block text-slate-300 text-xs font-medium mb-2">
            N8N Webhook URL
          </label>
          <input
            type="text"
            value={n8nWebhookUrl}
            onChange={(e) => onWebhookUrlChange(e.target.value)}
            className="w-full bg-slate-700/50 text-white text-xs p-2 rounded border border-slate-600/50 focus:border-blue-500 focus:outline-none"
            placeholder="https://your-n8n-instance.com/webhook/chat"
          />
        </div>
        <button
          onClick={onExportChat}
          disabled={!hasMessages}
          className="w-full bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          <Download size={16} />
          Export Chat
        </button>
      </div>
    </div>
  );
};