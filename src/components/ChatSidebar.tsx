import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Download,
  X,
  Clock,
  Layers,
} from "lucide-react";
import { ChatSession, Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  agents: Agent[];
  activeAgentId: string;
  onCreateNewSession: (agentId?: string) => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllHistory: () => void;
  onClearAgentHistory: (agentId: string) => void;
  onExportChat: () => void;
  hasMessages: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  chatSessions,
  currentSessionId,
  agents,
  activeAgentId,
  onCreateNewSession,
  onSwitchSession,
  onDeleteSession,
  onClearAllHistory,
  onClearAgentHistory,
  onExportChat,
  hasMessages,
}) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Active filter agent object if not "all"
  const filterAgent = useMemo(() => {
    return agents.find((a) => a.id === selectedAgentFilter);
  }, [agents, selectedAgentFilter]);

  // Non-empty sessions or currently selected session
  const validSessions = useMemo(() => {
    return chatSessions.filter(
      (s) => s.messages.length > 0 || s.id === currentSessionId
    );
  }, [chatSessions, currentSessionId]);

  // Filtered sessions based on selected filter
  const filteredSessions = useMemo(() => {
    if (selectedAgentFilter === "all") {
      return validSessions;
    }
    return validSessions.filter((s) => s.agentId === selectedAgentFilter);
  }, [validSessions, selectedAgentFilter]);

  const getSessionCountForAgent = (agentId: string) => {
    return validSessions.filter((s) => s.agentId === agentId).length;
  };

  const getAgentForSession = (agentId?: string) => {
    return agents.find((a) => a.id === agentId);
  };

  if (!isOpen) return null;

  const handleSelectSession = (sessionId: string) => {
    onSwitchSession(sessionId);
    onClose();
  };

  const handleCreateNew = () => {
    const targetAgent =
      selectedAgentFilter !== "all" ? selectedAgentFilter : activeAgentId;
    onCreateNewSession(targetAgent);
    onClose();
  };

  const handleConfirmClear = () => {
    if (selectedAgentFilter === "all") {
      onClearAllHistory();
    } else {
      onClearAgentHistory(selectedAgentFilter);
    }
    setShowConfirmClear(false);
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
          <div className="flex items-center justify-between mb-3">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleCreateNew}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-98 text-xs sm:text-sm"
            >
              <Plus size={16} />
              <span>
                {selectedAgentFilter !== "all" && filterAgent
                  ? `שיחה חדשה עם ${filterAgent.name}`
                  : "שיחה חדשה"}
              </span>
            </button>
            {filteredSessions.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 py-2 px-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1 shadow-sm active:scale-98 text-xs"
                title={
                  selectedAgentFilter === "all"
                    ? "נקה את כל ההיסטוריה"
                    : `נקה שיחות של ${filterAgent?.name}`
                }
              >
                <Trash2 size={15} />
                <span>
                  {selectedAgentFilter === "all" ? "נקה הכל" : "נקה"}
                </span>
              </button>
            )}
          </div>

          {/* Filter by Agent Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedAgentFilter("all")}
              className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1 text-xs shrink-0 ${
                selectedAgentFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Layers size={12} />
              <span>כל הסוכנים</span>
              <span className="opacity-80 text-[10px]">
                ({validSessions.length})
              </span>
            </button>
            {agents.map((agent) => {
              const count = getSessionCountForAgent(agent.id);
              const isSelected = selectedAgentFilter === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentFilter(agent.id)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5 text-xs shrink-0 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <DynamicLucideIcon name={agent.avatarIcon} size={12} />
                  <span>{agent.name}</span>
                  <span className="opacity-80 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Confirm clear dialog */}
          {showConfirmClear && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/70 rounded-xl text-center space-y-2">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                {selectedAgentFilter === "all"
                  ? "למחוק את כל היסטוריית השיחות?"
                  : `למחוק את השיחות עם ${filterAgent?.name}?`}
              </p>
              <p className="text-[11px] text-red-600/80 dark:text-red-400">
                {selectedAgentFilter === "all"
                  ? "פעולה זו תמחק את כל השיחות מכל הסוכנים ותפתח שיחה חדשה נקייה."
                  : `פעולה זו תמחק רק את השיחות עם ${filterAgent?.name}. שיחות עם שאר הסוכנים יישמרו.`}
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={handleConfirmClear}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm active:scale-95 transition-all"
                >
                  כן, מחק
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
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-xs space-y-1">
              <p className="font-medium text-slate-500 dark:text-slate-400">
                {selectedAgentFilter === "all"
                  ? "אין עדיין שיחות בהיסטוריה"
                  : `אין עדיין שיחות עם ${filterAgent?.name || "סוכן זה"}`}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                התחל שיחה חדשה כדי שהיא תופיע כאן
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = currentSessionId === session.id;
              const sessionAgent = getAgentForSession(session.agentId);

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-600/20 border-blue-400 dark:border-blue-500/50 shadow-sm ring-1 ring-blue-400/40"
                      : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white truncate flex-1 ml-2">
                      {session.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 rounded transition-all"
                      title="מחק שיחה זו"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} />
                      <span>
                        {new Date(session.lastUpdated).toLocaleDateString("he-IL", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {session.messages.length > 0 && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>{session.messages.length} הודעות</span>
                        </>
                      )}
                    </div>

                    {sessionAgent && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] font-medium shrink-0">
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
