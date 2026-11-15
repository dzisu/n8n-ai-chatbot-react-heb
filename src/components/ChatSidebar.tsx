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
  onClearAllHistory: () => void;
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
  onClearAllHistory,
  onExportChat,
  hasMessages,
}) => {
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);

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

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-98 text-xs sm:text-sm"
            >
              <Plus size={16} />
              <span>שיחה חדשה</span>
            </button>
            {chatSessions.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 py-2 px-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1 shadow-sm active:scale-98 text-xs"
                title="נקה את כל ההיסטוריה"
              >
                <Trash2 size={15} />
                <span>נקה הכל</span>
              </button>
            )}
          </div>

          {showConfirmClear && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/70 rounded-xl text-center space-y-2">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                למחוק את כל היסטוריית השיחות?
              </p>
              <p className="text-[11px] text-red-600/80 dark:text-red-400">
                פעולה זו תמחק את כל השיחות מהמכשיר ותפתח שיחה חדשה נקייה.
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={() => {
                    onClearAllHistory();
                    setShowConfirmClear(false);
                    onClose();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm active:scale-95 transition-all"
                >
                  כן, מחק הכל
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
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
                      className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 rounded transition-all"
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
