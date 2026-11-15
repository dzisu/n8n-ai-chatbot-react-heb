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
      (s) =>
        !s.isArchived &&
        ((s.messages && s.messages.length > 0) ||
          (s.messageCount && s.messageCount > 0) ||
          s.id === currentSessionId)
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
        const matchesContent =
          (s.messages || []).some(
            (m) => m.content && m.content.toLowerCase().includes(q)
          ) || (s.lastMessage && s.lastMessage.toLowerCase().includes(q));
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#FAFAFA] dark:bg-[#191919] border-r border-[#E0E0E0] dark:border-[#353535] shadow-2xl h-full flex flex-col z-10 text-right">
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b border-[#E0E0E0] dark:border-[#353535]"
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
                    className="p-1 rounded-lg text-[#676767] hover:text-[#191919] dark:text-[#A4A4A4] dark:hover:text-[#FAFAFA] hover:bg-[#F1F1F1] dark:hover:bg-[#242424] transition-colors"
                    title="חזרה להיסטוריית שיחות פעילות"
                  >
                    <ArrowRight size={18} />
                  </button>
                  <h2 className="text-base sm:text-lg font-bold text-[#191919] dark:text-[#FAFAFA] flex items-center gap-2 font-sans">
                    <Archive className="text-[#87003C] dark:text-[#FF91AC]" size={19} />
                    <span>ארכיב שיחות</span>
                  </h2>
                </>
              ) : (
                <h2 className="text-base sm:text-lg font-bold text-[#191919] dark:text-[#FAFAFA] flex items-center gap-2 font-sans">
                  <MessageSquare className="text-[#87003C] dark:text-[#FF91AC]" size={19} />
                  <span>היסטוריית שיחות</span>
                </h2>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#676767] hover:text-[#191919] dark:text-[#A4A4A4] dark:hover:text-[#FAFAFA] hover:bg-[#F1F1F1] dark:hover:bg-[#242424] transition-colors cursor-pointer"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#868686] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש לפי כותרת או תוכן שיחה..."
                className="w-full pl-8 pr-8 py-2 text-xs bg-[#F1F1F1] dark:bg-[#242424] border border-[#E0E0E0] dark:border-[#353535] rounded-xl text-[#191919] dark:text-[#FAFAFA] placeholder-[#868686] focus:outline-none focus:ring-1 focus:ring-[#FF91AC]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#868686] hover:text-[#191919] dark:hover:text-[#FAFAFA]"
                  title="נקה חיפוש"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Action Buttons (In History View) - Official n8n Pink Button */}
          {viewMode === "history" && (
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleCreateNew}
                className="flex-1 bg-[#FF91AC] hover:bg-[#FFD0D9] active:bg-[#FFBCCA] text-[#191919] py-2.5 px-3 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-n8n-pink active:scale-95 text-xs sm:text-sm cursor-pointer"
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
                  className="bg-[#FFE8EC] hover:bg-[#FFD0D9] dark:bg-[#5A0026] dark:hover:bg-[#87003C] text-[#87003C] dark:text-[#FFBCCA] border border-[#FF91AC]/30 py-2.5 px-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-1 shadow-sm active:scale-95 text-xs shrink-0 cursor-pointer"
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
              className={`px-3 py-1 rounded-full font-mono font-medium transition-all whitespace-nowrap flex items-center gap-1 text-[11px] shrink-0 cursor-pointer ${
                selectedAgentFilter === "all"
                  ? "bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] shadow-sm font-bold"
                  : "bg-[#F1F1F1] dark:bg-[#242424] text-[#676767] dark:text-[#A4A4A4] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] border border-[#E0E0E0] dark:border-[#353535]"
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
                  className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5 text-xs shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#FF91AC] text-[#191919] shadow-n8n-pink font-bold border border-[#FFBCCA]"
                      : "bg-[#F1F1F1] dark:bg-[#242424] text-[#676767] dark:text-[#A4A4A4] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] border border-[#E0E0E0] dark:border-[#353535]"
                  }`}
                >
                  <DynamicLucideIcon name={agent.avatarIcon} size={12} />
                  <span>{agent.name}</span>
                  <span className="opacity-80 text-[10px] font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Confirm archive dialog */}
          {showConfirmArchive && (
            <div className="mt-3 p-3 bg-[#FFE8EC] dark:bg-[#5A0026] border border-[#FF91AC]/40 rounded-2xl text-center space-y-2">
              <p className="text-xs font-semibold text-[#87003C] dark:text-[#FFBCCA]">
                {selectedAgentFilter === "all"
                  ? "לארכב את כל היסטוריית השיחות?"
                  : `לארכב את השיחות עם ${filterAgent?.name}?`}
              </p>
              <p className="text-[11px] text-[#87003C]/80 dark:text-[#FFBCCA]/80">
                {selectedAgentFilter === "all"
                  ? "השיחות יועברו לארכיב ויישמרו שם. תמיד תוכל לחפש בהן ולשחזר אותן."
                  : `השיחות עם ${filterAgent?.name} יועברו לארכיב. שיחות עם שאר הסוכנים יישארו ללא שינוי.`}
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={handleConfirmArchive}
                  className="bg-[#FF91AC] hover:bg-[#FFD0D9] text-[#191919] text-xs font-bold py-1.5 px-3 rounded-xl shadow-n8n-pink active:scale-95 transition-all cursor-pointer"
                >
                  כן, ארכב
                </button>
                <button
                  onClick={() => setShowConfirmArchive(false)}
                  className="bg-white dark:bg-[#242424] text-[#191919] dark:text-[#FAFAFA] text-xs py-1.5 px-3 rounded-xl border border-[#E0E0E0] dark:border-[#353535] hover:bg-[#F1F1F1] transition-all cursor-pointer"
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
              <div className="text-center py-12 px-4 text-[#868686] text-xs space-y-1">
                <p className="font-medium text-[#676767] dark:text-[#A4A4A4]">
                  {selectedAgentFilter === "all"
                    ? "אין שיחות פעילות בהיסטוריה"
                    : `אין שיחות פעילות עם ${filterAgent?.name || "סוכן זה"}`}
                </p>
                <p className="text-[11px] text-[#868686] dark:text-[#676767]">
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
                    className={`group relative p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-[#FFE8EC] dark:bg-[#242424] border-[#FF91AC] shadow-n8n-pink ring-1 ring-[#FF91AC]/40"
                        : "bg-[#FFFFFF] dark:bg-[#242424] border-[#E0E0E0] dark:border-[#353535] hover:border-[#BFBFBF] dark:hover:border-[#676767]"
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
                            className="flex-1 min-w-0 py-0.5 px-2 text-xs bg-white dark:bg-[#191919] border border-[#FF91AC] rounded-lg text-[#191919] dark:text-[#FAFAFA] focus:outline-none shadow-inner"
                          />
                          <button
                            onClick={(e) => handleSaveEdit(session.id, e)}
                            className="p-1 rounded-md text-[#FF91AC] hover:bg-black/10"
                            title="שמור שינוי"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={(e) => handleCancelEdit(e)}
                            className="p-1 rounded-md text-[#868686] hover:text-[#191919] dark:hover:text-[#FAFAFA]"
                            title="ביטול"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-xs sm:text-sm text-[#191919] dark:text-[#FAFAFA] truncate flex-1 ml-2 font-sans">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleStartEdit(session, e)}
                              className="text-[#868686] hover:text-[#FF91AC] p-1 rounded transition-colors"
                              title="שנה שם שיחה"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onArchiveSession(session.id);
                              }}
                              className="text-[#868686] hover:text-[#87003C] dark:hover:text-[#FF91AC] p-1 rounded transition-colors"
                              title="העבר לארכיב"
                            >
                              <Archive size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="text-[#868686] hover:text-red-500 p-1 rounded transition-colors"
                              title="מחק שיחה"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#868686] dark:text-[#676767]">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock size={11} />
                        <span>
                          {new Date(session.lastUpdated).toLocaleDateString("he-IL", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {(session.messageCount ?? session.messages?.length ?? 0) > 0 && (
                          <>
                            <span>•</span>
                            <span>{session.messageCount ?? session.messages?.length ?? 0} הודעות</span>
                          </>
                        )}
                      </div>

                      {sessionAgent && (
                        <span className="n8n-capsule bg-[#F1F1F1] dark:bg-[#191919] text-[#676767] dark:text-[#A4A4A4] border border-[#E0E0E0] dark:border-[#353535] text-[9px] gap-1">
                          <DynamicLucideIcon name={sessionAgent.avatarIcon} size={10} />
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
              <div className="text-center py-12 px-4 text-[#868686] text-xs space-y-1">
                <p className="font-medium text-[#676767] dark:text-[#A4A4A4]">
                  {searchQuery.trim()
                    ? "לא נמצאו שיחות בארכיב התואמות לחיפוש"
                    : selectedAgentFilter === "all"
                    ? "אין שיחות בארכיב"
                    : `אין שיחות בארכיב עם ${filterAgent?.name || "סוכן זה"}`}
                </p>
                <p className="text-[11px] text-[#868686] dark:text-[#676767]">
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
                    className={`group relative p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-[#FFE8EC] dark:bg-[#242424] border-[#FF91AC] shadow-n8n-pink ring-1 ring-[#FF91AC]/40"
                        : "bg-[#FFFFFF] dark:bg-[#242424] border-[#E0E0E0] dark:border-[#353535] hover:border-[#BFBFBF] dark:hover:border-[#676767]"
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
                            className="flex-1 min-w-0 py-0.5 px-2 text-xs bg-white dark:bg-[#191919] border border-[#FF91AC] rounded-lg text-[#191919] dark:text-[#FAFAFA] focus:outline-none shadow-inner"
                          />
                          <button
                            onClick={(e) => handleSaveEdit(session.id, e)}
                            className="p-1 rounded-md text-[#FF91AC] hover:bg-black/10"
                            title="שמור שינוי"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={(e) => handleCancelEdit(e)}
                            className="p-1 rounded-md text-[#868686] hover:text-[#191919] dark:hover:text-[#FAFAFA]"
                            title="ביטול"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-xs sm:text-sm text-[#191919] dark:text-[#FAFAFA] truncate flex-1 ml-2 font-sans">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleStartEdit(session, e)}
                              className="text-[#868686] hover:text-[#FF91AC] p-1 rounded transition-colors"
                              title="שנה שם שיחה"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUnarchiveSession(session.id);
                              }}
                              className="text-[#868686] hover:text-[#FF91AC] p-1 rounded transition-colors"
                              title="שחזר לשיחות פעילות"
                            >
                              <ArchiveRestore size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="text-[#868686] hover:text-red-500 p-1 rounded transition-colors"
                              title="מחק לצמיתות"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {snippet && (
                      <div className="mb-2 p-1.5 bg-[#FFE8EC] dark:bg-[#5A0026] rounded-xl border border-[#FF91AC]/30 text-[10px] text-[#87003C] dark:text-[#FFBCCA] truncate">
                        <span className="font-semibold ml-1">תוכן תואם:</span>
                        <span>{snippet}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#868686] dark:text-[#676767]">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock size={11} />
                        <span>
                          {new Date(session.lastUpdated).toLocaleDateString("he-IL", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {(session.messageCount ?? session.messages?.length ?? 0) > 0 && (
                          <>
                            <span>•</span>
                            <span>{session.messageCount ?? session.messages?.length ?? 0} הודעות</span>
                          </>
                        )}
                      </div>

                      {sessionAgent && (
                        <span className="n8n-capsule bg-[#F1F1F1] dark:bg-[#191919] text-[#676767] dark:text-[#A4A4A4] border border-[#E0E0E0] dark:border-[#353535] text-[9px] gap-1">
                          <DynamicLucideIcon name={sessionAgent.avatarIcon} size={10} />
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
          className="p-3 border-t border-[#E0E0E0] dark:border-[#353535] bg-[#F1F1F1]/80 dark:bg-[#191919]/80 space-y-2"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
        >
          {viewMode === "history" ? (
            /* Button to switch to Archive */
            <button
              onClick={() => {
                setViewMode("archive");
                setSearchQuery("");
              }}
              className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-[#191919] dark:text-[#FAFAFA] hover:text-[#87003C] dark:hover:text-[#FF91AC] bg-[#FFFFFF] dark:bg-[#242424] rounded-2xl transition-all border border-[#E0E0E0] dark:border-[#353535] shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Archive size={15} className="text-[#87003C] dark:text-[#FF91AC]" />
                <span>ארכיב שיחות</span>
              </div>
              <span className="n8n-capsule bg-[#FFE8EC] dark:bg-[#5A0026] text-[#87003C] dark:text-[#FFBCCA] text-[9px] font-bold">
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
              className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-[#191919] dark:text-[#FAFAFA] hover:text-[#87003C] dark:hover:text-[#FF91AC] bg-[#FFFFFF] dark:bg-[#242424] rounded-2xl transition-all border border-[#E0E0E0] dark:border-[#353535] shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-[#FF91AC]" />
                <span>חזרה לשיחות פעילות</span>
              </div>
              <span className="n8n-capsule bg-[#FFE8EC] dark:bg-[#5A0026] text-[#87003C] dark:text-[#FFBCCA] text-[9px] font-bold">
                {activeSessions.length}
              </span>
            </button>
          )}

          {hasMessages && (
            <button
              onClick={onExportChat}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] text-[#676767] dark:text-[#A4A4A4] hover:text-[#191919] dark:hover:text-[#FAFAFA] bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#EAEAEA] dark:hover:bg-[#353535] rounded-xl transition-colors border border-[#E0E0E0] dark:border-[#353535] cursor-pointer"
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
