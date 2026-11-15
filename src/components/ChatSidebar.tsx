import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Download,
  X,
  Clock,
  Layers,
  Archive,
  ArchiveRestore,
  Pencil,
  Check,
  Search,
  ArrowRight,
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
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onArchiveSession: (sessionId: string) => void;
  onUnarchiveSession: (sessionId: string) => void;
  onArchiveAllHistory: (agentId?: string) => void;
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
  onRenameSession,
  onArchiveSession,
  onUnarchiveSession,
  onArchiveAllHistory,
  onExportChat,
  hasMessages,
}) => {
  const [viewMode, setViewMode] = useState<"history" | "archive">("history");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showConfirmArchive, setShowConfirmArchive] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  // Active filter agent object if not "all"
  const filterAgent = useMemo(() => {
    return agents.find((a) => a.id === selectedAgentFilter);
  }, [agents, selectedAgentFilter]);

  // Active (unarchived) sessions: non-empty or currently selected
  const activeSessions = useMemo(() => {
    return chatSessions.filter(
      (s) => !s.isArchived && (s.messages.length > 0 || s.id === currentSessionId)
    );
  }, [chatSessions, currentSessionId]);

  // Filtered active sessions based on agent tab
  const filteredActiveSessions = useMemo(() => {
    if (selectedAgentFilter === "all") {
      return activeSessions;
    }
    return activeSessions.filter((s) => s.agentId === selectedAgentFilter);
  }, [activeSessions, selectedAgentFilter]);

  // All archived sessions
  const archivedSessions = useMemo(() => {
    return chatSessions.filter((s) => s.isArchived);
  }, [chatSessions]);

  // Filtered archived sessions based on agent tab and search query
  const filteredArchivedSessions = useMemo(() => {
    let result = archivedSessions;

    if (selectedAgentFilter !== "all") {
      result = result.filter((s) => s.agentId === selectedAgentFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((s) => {
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesContent = s.messages.some(
          (m) => m.content && m.content.toLowerCase().includes(q)
        );
        return matchesTitle || matchesContent;
      });
    }

    return result;
  }, [archivedSessions, selectedAgentFilter, searchQuery]);

  const getSessionCountForAgent = (agentId: string, isArchive: boolean) => {
    const list = isArchive ? archivedSessions : activeSessions;
    return list.filter((s) => s.agentId === agentId).length;
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

  const handleConfirmArchive = () => {
    if (selectedAgentFilter === "all") {
      onArchiveAllHistory();
    } else {
      onArchiveAllHistory(selectedAgentFilter);
    }
    setShowConfirmArchive(false);
  };

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = (sessionId: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelEdit = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setEditingSessionId(null);
  };

  // Extract snippet when matching content in archive search
  const getContentSnippet = (session: ChatSession, query: string) => {
    if (!query.trim()) return null;
    const term = query.toLowerCase().trim();
    for (const msg of session.messages) {
      if (msg.content && msg.content.toLowerCase().includes(term)) {
        const idx = msg.content.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 18);
        const end = Math.min(msg.content.length, idx + term.length + 28);
        return (
          (start > 0 ? "..." : "") +
          msg.content.slice(start, end).replace(/\s+/g, " ") +
          (end < msg.content.length ? "..." : "")
        );
      }
    }
    return null;
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
            <div className="flex items-center gap-2">
              {viewMode === "archive" ? (
                <>
                  <button
                    onClick={() => {
                      setViewMode("history");
                      setSearchQuery("");
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="חזרה להיסטוריית שיחות פעילות"
                  >
                    <ArrowRight size={18} />
                  </button>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Archive className="text-amber-500" size={19} />
                    <span>ארכיב שיחות</span>
                  </h2>
                </>
              ) : (
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <MessageSquare className="text-blue-500 dark:text-blue-400" size={19} />
                  <span>היסטוריית שיחות</span>
                </h2>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="סגור חלון"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search box (In Archive View) */}
          {viewMode === "archive" && (
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש לפי כותרת או תוכן שיחה..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="נקה חיפוש"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Action Buttons (In History View) */}
          {viewMode === "history" && (
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
              {filteredActiveSessions.length > 0 && (
                <button
                  onClick={() => setShowConfirmArchive(true)}
                  className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 py-2 px-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1 shadow-sm active:scale-98 text-xs shrink-0"
                  title={
                    selectedAgentFilter === "all"
                      ? "ארכב את כל השיחות הפעילות"
                      : `ארכב שיחות של ${filterAgent?.name}`
                  }
                >
                  <Archive size={14} />
                  <span>
                    {selectedAgentFilter === "all" ? "ארכב הכל" : "ארכב"}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Filter by Agent Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedAgentFilter("all")}
              className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1 text-xs shrink-0 ${
                selectedAgentFilter === "all"
                  ? viewMode === "archive"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Layers size={12} />
              <span>כל הסוכנים</span>
              <span className="opacity-80 text-[10px]">
                (
                {viewMode === "archive"
                  ? filteredArchivedSessions.length
                  : activeSessions.length}
                )
              </span>
            </button>
            {agents.map((agent) => {
              const count = getSessionCountForAgent(agent.id, viewMode === "archive");
              const isSelected = selectedAgentFilter === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentFilter(agent.id)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5 text-xs shrink-0 ${
                    isSelected
                      ? viewMode === "archive"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-blue-600 text-white shadow-sm"
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

          {/* Confirm archive dialog */}
          {showConfirmArchive && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 rounded-xl text-center space-y-2">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                {selectedAgentFilter === "all"
                  ? "לארכב את כל היסטוריית השיחות?"
                  : `לארכב את השיחות עם ${filterAgent?.name}?`}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                {selectedAgentFilter === "all"
                  ? "השיחות יועברו לארכיב ויישמרו שם. תמיד תוכל לחפש בהן ולשחזר אותן."
                  : `השיחות עם ${filterAgent?.name} יועברו לארכיב. שיחות עם שאר הסוכנים יישארו ללא שינוי.`}
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={handleConfirmArchive}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm active:scale-95 transition-all"
                >
                  כן, ארכב
                </button>
                <button
                  onClick={() => setShowConfirmArchive(false)}
                  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sessions List (History or Archive) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {viewMode === "history" ? (
            /* Active Sessions */
            filteredActiveSessions.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 text-xs space-y-1">
                <p className="font-medium text-slate-500 dark:text-slate-400">
                  {selectedAgentFilter === "all"
                    ? "אין שיחות פעילות בהיסטוריה"
                    : `אין שיחות פעילות עם ${filterAgent?.name || "סוכן זה"}`}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  התחל שיחה חדשה או בדוק בארכיב השיחות בתחתית
                </p>
              </div>
            ) : (
              filteredActiveSessions.map((session) => {
                const isSelected = currentSessionId === session.id;
                const sessionAgent = getAgentForSession(session.agentId);
                const isEditing = editingSessionId === session.id;

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
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1.5 flex-1 min-w-0 ml-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(session.id, e);
                              if (e.key === "Escape") handleCancelEdit(e);
                            }}
                            autoFocus
                            className="flex-1 min-w-0 py-0.5 px-2 text-xs bg-white dark:bg-slate-900 border border-blue-500 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none shadow-inner"
                          />
                          <button
                            onClick={(e) => handleSaveEdit(session.id, e)}
                            className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                            title="שמור שינוי"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={(e) => handleCancelEdit(e)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="ביטול"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white truncate flex-1 ml-2">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleStartEdit(session, e)}
                              className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded transition-colors"
                              title="שנה שם שיחה"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onArchiveSession(session.id);
                              }}
                              className="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 p-1 rounded transition-colors"
                              title="העבר לארכיב"
                            >
                              <Archive size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                              title="מחק שיחה"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
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
            )
          ) : (
            /* Archived Sessions */
            filteredArchivedSessions.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 text-xs space-y-1">
                <p className="font-medium text-slate-500 dark:text-slate-400">
                  {searchQuery.trim()
                    ? "לא נמצאו שיחות בארכיב התואמות לחיפוש"
                    : selectedAgentFilter === "all"
                    ? "אין שיחות בארכיב"
                    : `אין שיחות בארכיב עם ${filterAgent?.name || "סוכן זה"}`}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {searchQuery.trim()
                    ? "נסה מילת חיפוש אחרת"
                    : "שיחות שתארכב יופיעו כאן בצורה מאובטחת"}
                </p>
              </div>
            ) : (
              filteredArchivedSessions.map((session) => {
                const isSelected = currentSessionId === session.id;
                const sessionAgent = getAgentForSession(session.agentId);
                const isEditing = editingSessionId === session.id;
                const snippet = searchQuery.trim()
                  ? getContentSnippet(session, searchQuery)
                  : null;

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/50 shadow-sm ring-1 ring-amber-400/40"
                        : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1.5 flex-1 min-w-0 ml-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(session.id, e);
                              if (e.key === "Escape") handleCancelEdit(e);
                            }}
                            autoFocus
                            className="flex-1 min-w-0 py-0.5 px-2 text-xs bg-white dark:bg-slate-900 border border-amber-500 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none shadow-inner"
                          />
                          <button
                            onClick={(e) => handleSaveEdit(session.id, e)}
                            className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                            title="שמור שינוי"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={(e) => handleCancelEdit(e)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="ביטול"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white truncate flex-1 ml-2">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleStartEdit(session, e)}
                              className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded transition-colors"
                              title="שנה שם שיחה"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUnarchiveSession(session.id);
                              }}
                              className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-1 rounded transition-colors"
                              title="שחזר לשיחות פעילות"
                            >
                              <ArchiveRestore size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                              title="מחק לצמיתות"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {snippet && (
                      <div className="mb-2 p-1.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-[10px] text-amber-800 dark:text-amber-200 truncate">
                        <span className="font-semibold ml-1">תוכן תואם:</span>
                        <span>{snippet}</span>
                      </div>
                    )}

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
            )
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50/90 dark:bg-slate-900/70 space-y-2"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
        >
          {viewMode === "history" ? (
            /* Button to switch to Archive */
            <button
              onClick={() => {
                setViewMode("archive");
                setSearchQuery("");
              }}
              className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-slate-800 hover:bg-amber-50/50 dark:hover:bg-slate-750 rounded-xl transition-all border border-slate-200/90 dark:border-slate-700/80 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Archive size={15} className="text-amber-500" />
                <span>ארכיב שיחות</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                {archivedSessions.length}
              </span>
            </button>
          ) : (
            /* Button to switch back to History */
            <button
              onClick={() => {
                setViewMode("history");
                setSearchQuery("");
              }}
              className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-750 rounded-xl transition-all border border-slate-200/90 dark:border-slate-700/80 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-blue-500" />
                <span>חזרה לשיחות פעילות</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                {activeSessions.length}
              </span>
            </button>
          )}

          {hasMessages && (
            <button
              onClick={onExportChat}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/80 dark:border-slate-700/60"
            >
              <Download size={13} />
              <span>ייצוא השיחה הפעילה (JSON)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
