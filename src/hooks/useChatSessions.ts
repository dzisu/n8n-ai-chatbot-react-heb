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

    if (savedSessions.length === 0) {
      const initialId = Date.now().toString();
      const newSession: ChatSession = {
        id: initialId,
        title: "שיחה חדשה",
        agentId: initialAgentId,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      setChatSessions([newSession]);
      setCurrentSessionId(initialId);
      setMessages([]);
      StorageService.saveSessions([newSession]);
    } else {
      // Prefer the most recent session for initialAgentId if exists, otherwise first session
      const matching =
        savedSessions.find((s) => s.agentId === initialAgentId) ||
        savedSessions[0];
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
      };

      setChatSessions((prev) => {
        // Prune any existing empty sessions so they don't pile up
        const cleaned = prev.filter((s) => s.messages.length > 0);
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

      // Clean up previous session if it was completely empty
      setChatSessions((prev) => {
        const cleaned = prev.filter(
          (s) => s.id === sessionId || s.messages.length > 0
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

  const deleteSession = useCallback(
    (sessionId: string): void => {
      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        StorageService.saveSessions(filtered);

        if (currentSessionId === sessionId) {
          if (filtered.length > 0) {
            setCurrentSessionId(filtered[0].id);
            setMessages(filtered[0].messages);
          } else {
            const newId = Date.now().toString();
            const emptySession: ChatSession = {
              id: newId,
              title: "שיחה חדשה",
              agentId: initialAgentId,
              messages: [],
              createdAt: new Date(),
              lastUpdated: new Date(),
            };
            setCurrentSessionId(newId);
            setMessages([]);
            StorageService.saveSessions([emptySession]);
            return [emptySession];
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
      const newId = Date.now().toString();
      const freshSession: ChatSession = {
        id: newId,
        title: "שיחה חדשה",
        agentId: agentId || initialAgentId,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      setChatSessions([freshSession]);
      setCurrentSessionId(newId);
      setMessages([]);
      StorageService.saveSessions([freshSession]);
    },
    [initialAgentId]
  );

  const clearAgentSessions = useCallback(
    (agentId: string): void => {
      setChatSessions((prev) => {
        const remaining = prev.filter((s) => s.agentId !== agentId);
        if (remaining.length === 0) {
          const newId = Date.now().toString();
          const freshSession: ChatSession = {
            id: newId,
            title: "שיחה חדשה",
            agentId,
            messages: [],
            createdAt: new Date(),
            lastUpdated: new Date(),
          };
          StorageService.saveSessions([freshSession]);
          setCurrentSessionId(newId);
          setMessages([]);
          return [freshSession];
        }

        const currentWasDeleted = !remaining.some((s) => s.id === currentSessionId);
        if (currentWasDeleted) {
          setCurrentSessionId(remaining[0].id);
          setMessages(remaining[0].messages);
        }

        StorageService.saveSessions(remaining);
        return remaining;
      });
    },
    [currentSessionId]
  );

  return {
    chatSessions,
    currentSessionId,
    currentSession: chatSessions.find((s) => s.id === currentSessionId),
    messages,
    createNewSession,
    switchSession,
    deleteSession,
    clearAllSessions,
    clearAgentSessions,
    updateMessages,
    saveCurrentSession,
  };
};
