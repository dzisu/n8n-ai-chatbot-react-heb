import React from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Download,
  X,
  Clock,
} from "lucide-react";
import { ChatSession, Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  agents: Agent[];
  onCreateNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportChat: () => void;
  hasMessages: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  chatSessions,
  currentSessionId,
  agents,
  onCreateNewSession,
  onSwitchSession,
  onDeleteSession,
  onExportChat,
  hasMessages,
}) => {
  if (!isOpen) return null;

  const getAgentForSession = (agentId?: string) => {
    return agents.find((a) => a.id === agentId);
  };

  const handleSelectSession = (sessionId: string) => {
    onSwitchSession(sessionId);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNewSession();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700/60 shadow-2xl h-full flex flex-col z-10 text-right">
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/60"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top, 1rem))" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-blue-500 dark:text-blue-400" size={20} />
              היסטוריית שיחות
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="סגור היסטוריה"
            >
              <X size={18} />
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-98 text-sm"
          >
            <Plus size={18} />
            <span>שיחה חדשה</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatSessions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              אין עדיין שיחות בהיסטוריה
            </div>
          ) : (
            chatSessions.map((session) => {
              const isSelected = currentSessionId === session.id;
              const sessionAgent = getAgentForSession(session.agentId);

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-600/20 border-blue-400 dark:border-blue-500/50 shadow-sm"
                      : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-xs sm:text-sm text-slate-800 dark:text-white truncate flex-1 ml-2">
                      {session.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition-opacity"
                      title="מחק שיחה"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>
                        {new Date(session.lastUpdated).toLocaleDateString("he-IL", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {sessionAgent && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px]">
                        <DynamicLucideIcon name={sessionAgent.avatarIcon} size={11} />
                        <span className="truncate max-w-[80px]">
                          {sessionAgent.name}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {hasMessages && (
          <div
            className="p-4 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/60"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
          >
            <button
              onClick={onExportChat}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Download size={14} />
              <span>ייצוא היסטוריית השיחה (JSON)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
