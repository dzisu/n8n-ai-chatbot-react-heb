import React from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Download,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { ChatSession, Agent } from "../types/chat";

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
      <div className="relative w-full max-w-xs sm:max-w-sm bg-slate-900/95 backdrop-blur-md border-r border-slate-700/60 shadow-2xl h-full flex flex-col z-10 text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="text-blue-400" size={20} />
              היסטוריית שיחות
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                  className={`p-3 rounded-xl cursor-pointer transition-all group relative border ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500/40 text-white shadow-sm"
                      : "bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/40 text-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate leading-snug">
                        {session.title || "שיחה ללא כותרת"}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(session.lastUpdated).toLocaleDateString("he-IL", {
                            day: "numeric",
                            month: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {sessionAgent && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-slate-700/80 text-blue-300 border border-slate-600/50 flex items-center gap-1`}
                          >
                            <Sparkles size={9} />
                            {sessionAgent.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-700/60 transition-all"
                      title="מחק שיחה"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-slate-900/60">
          <button
            onClick={() => {
              onExportChat();
              onClose();
            }}
            disabled={!hasMessages}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-medium border border-slate-700"
          >
            <Download size={15} />
            <span>ייצא שיחה נוכחית (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
