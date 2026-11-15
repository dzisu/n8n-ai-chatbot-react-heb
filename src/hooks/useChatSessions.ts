import { useState, useEffect, useCallback } from "react";
import { ChatSession, Message } from "../types/chat";
import { StorageService } from "../services/storageService";

export const useChatSessions = (initialAgentId: string = "shuki") => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const savedSessions = StorageService.loadSessions();
    setChatSessions(savedSessions);

    const activeSessions = savedSessions.filter((s) => !s.isArchived);

    if (activeSessions.length === 0) {
      const initialId = Date.now().toString();
      const newSession: ChatSession = {
        id: initialId,
        title: "שיחה חדשה",
        agentId: initialAgentId,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
        isArchived: false,
      };
      const initialList = [newSession, ...savedSessions];
      setChatSessions(initialList);
      setCurrentSessionId(initialId);
      setMessages([]);
      StorageService.saveSessions(initialList);
    } else {
      // Prefer the most recent active session for initialAgentId if exists, otherwise first active session
      const matching =
        activeSessions.find((s) => s.agentId === initialAgentId) ||
        activeSessions[0];
      setCurrentSessionId(matching.id);
      setMessages(matching.messages);
    }
  }, []);

  const createNewSession = useCallback(
    (agentId?: string): string => {
      const newId = Date.now().toString();
      const targetAgentId = agentId || initialAgentId;
      const newSession: ChatSession = {
        id: newId,
        title: "שיחה חדשה",
        agentId: targetAgentId,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
        isArchived: false,
      };

      setChatSessions((prev) => {
        // Prune any existing empty unarchived sessions so they don't pile up
        const cleaned = prev.filter(
          (s) => s.isArchived || s.messages.length > 0
        );
        const updated = [newSession, ...cleaned];
        StorageService.saveSessions(updated);
        return updated;
      });

      setCurrentSessionId(newId);
      setMessages([]);
      return newId;
    },
    [initialAgentId]
  );

  const saveCurrentSession = useCallback((): void => {
    if (!currentSessionId) return;

    setChatSessions((prev) => {
      const updated = prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages,
              lastUpdated: new Date(),
            }
          : session
      );
      StorageService.saveSessions(updated);
      return updated;
    });
  }, [currentSessionId, messages]);

  const switchSession = useCallback(
    (sessionId: string): ChatSession | undefined => {
      const allSessions = StorageService.loadSessions();
      const target =
        chatSessions.find((s) => s.id === sessionId) ||
        allSessions.find((s) => s.id === sessionId);

      if (!target) return undefined;

      // Clean up previous session if it was completely empty and not archived
      setChatSessions((prev) => {
        const cleaned = prev.filter(
          (s) => s.id === sessionId || s.isArchived || s.messages.length > 0
        );
        StorageService.saveSessions(cleaned);
        return cleaned;
      });

      setCurrentSessionId(sessionId);
      setMessages(target.messages);
      return target;
    },
    [chatSessions]
  );

  const renameSession = useCallback(
    (sessionId: string, newTitle: string): void => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      setChatSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === sessionId ? { ...s, title: trimmed, lastUpdated: new Date() } : s
        );
        StorageService.saveSessions(updated);
        return updated;
      });
    },
    []
  );

  const archiveSession = useCallback(
    (sessionId: string): void => {
      setChatSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === sessionId ? { ...s, isArchived: true, lastUpdated: new Date() } : s
        );
        StorageService.saveSessions(updated);

        // If currently viewed session was archived, switch to another active session or create new
        if (currentSessionId === sessionId) {
          const remainingActive = updated.filter((s) => !s.isArchived);
          if (remainingActive.length > 0) {
            setCurrentSessionId(remainingActive[0].id);
            setMessages(remainingActive[0].messages);
          } else {
            const newId = Date.now().toString();
            const freshSession: ChatSession = {
              id: newId,
              title: "שיחה חדשה",
              agentId: initialAgentId,
              messages: [],
              createdAt: new Date(),
              lastUpdated: new Date(),
              isArchived: false,
            };
            const nextSessions = [freshSession, ...updated];
            StorageService.saveSessions(nextSessions);
            setCurrentSessionId(newId);
            setMessages([]);
            return nextSessions;
          }
        }

        return updated;
      });
    },
    [currentSessionId, initialAgentId]
  );

  const unarchiveSession = useCallback(
    (sessionId: string): void => {
      setChatSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === sessionId ? { ...s, isArchived: false, lastUpdated: new Date() } : s
        );
        StorageService.saveSessions(updated);
        return updated;
      });
    },
    []
  );

  const archiveAllSessions = useCallback(
    (agentId?: string): void => {
      setChatSessions((prev) => {
        const updated = prev.map((s) => {
          if (!s.isArchived) {
            if (!agentId || s.agentId === agentId) {
              if (s.messages.length > 0) {
                return { ...s, isArchived: true, lastUpdated: new Date() };
              }
            }
          }
          return s;
        });

        // Filter out empty sessions
        const cleaned = updated.filter(
          (s) => s.isArchived || s.messages.length > 0
        );

        // Create a new fresh active session for the agent
        const newId = Date.now().toString();
        const freshSession: ChatSession = {
          id: newId,
          title: "שיחה חדשה",
          agentId: agentId || initialAgentId,
          messages: [],
          createdAt: new Date(),
          lastUpdated: new Date(),
          isArchived: false,
        };

        const finalSessions = [freshSession, ...cleaned];
        StorageService.saveSessions(finalSessions);
        setCurrentSessionId(newId);
        setMessages([]);
        return finalSessions;
      });
    },
    [initialAgentId]
  );

  const deleteSession = useCallback(
    (sessionId: string): void => {
      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        StorageService.saveSessions(filtered);

        if (currentSessionId === sessionId) {
          const activeSessions = filtered.filter((s) => !s.isArchived);
          if (activeSessions.length > 0) {
            setCurrentSessionId(activeSessions[0].id);
            setMessages(activeSessions[0].messages);
          } else {
            const newId = Date.now().toString();
            const emptySession: ChatSession = {
              id: newId,
              title: "שיחה חדשה",
              agentId: initialAgentId,
              messages: [],
              createdAt: new Date(),
              lastUpdated: new Date(),
              isArchived: false,
            };
            const nextList = [emptySession, ...filtered];
            setCurrentSessionId(newId);
            setMessages([]);
            StorageService.saveSessions(nextList);
            return nextList;
          }
        }
        return filtered;
      });
    },
    [currentSessionId, initialAgentId]
  );

  const updateMessages = useCallback(
    (newMessages: Message[]): void => {
      setMessages(newMessages);
      if (currentSessionId) {
        setChatSessions((prev) => {
          const updated = prev.map((session) => {
            if (session.id !== currentSessionId) return session;

            let title = session.title;
            if (newMessages.length > 0 && session.title === "שיחה חדשה") {
              const firstMsg = newMessages[0];
              if (firstMsg.content && firstMsg.content.trim()) {
                const text = firstMsg.content.trim();
                title = text.slice(0, 32) + (text.length > 32 ? "..." : "");
              } else if (firstMsg.attachment) {
                title = firstMsg.attachment.name || "קובץ מצורף";
              }
            }

            return {
              ...session,
              messages: newMessages,
              lastUpdated: new Date(),
              title,
            };
          });
          StorageService.saveSessions(updated);
          return updated;
        });
      }
    },
    [currentSessionId]
  );

  const clearAllSessions = useCallback(
    (agentId?: string): void => {
      archiveAllSessions(agentId);
    },
    [archiveAllSessions]
  );

  const clearAgentSessions = useCallback(
    (agentId: string): void => {
      archiveAllSessions(agentId);
    },
    [archiveAllSessions]
  );

  return {
    chatSessions,
    currentSessionId,
    currentSession: chatSessions.find((s) => s.id === currentSessionId),
    messages,
    createNewSession,
    switchSession,
    renameSession,
    archiveSession,
    unarchiveSession,
    archiveAllSessions,
    deleteSession,
    clearAllSessions,
    clearAgentSessions,
    updateMessages,
    saveCurrentSession,
  };
};
