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
      setCurrentSessionId(savedSessions[0].id);
      setMessages(savedSessions[0].messages);
    }
  }, []);

  const createNewSession = useCallback((agentId?: string): string => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "שיחה חדשה",
      agentId: agentId || initialAgentId,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    setChatSessions((prev) => {
      const updated = [newSession, ...prev];
      StorageService.saveSessions(updated);
      return updated;
    });

    setCurrentSessionId(newId);
    setMessages([]);
    return newId;
  }, [initialAgentId]);

  const saveCurrentSession = useCallback((): void => {
    if (!currentSessionId) return;

    setChatSessions((prev) => {
      const updated = prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages,
              lastUpdated: new Date(),
              title:
                messages.length > 0
                  ? messages[0].content.slice(0, 32).trim() +
                    (messages[0].content.length > 32 ? "..." : "")
                  : session.title,
            }
          : session
      );
      StorageService.saveSessions(updated);
      return updated;
    });
  }, [currentSessionId, messages]);

  const switchSession = useCallback((sessionId: string): ChatSession | undefined => {
    if (currentSessionId) {
      saveCurrentSession();
    }

    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      return session;
    }
    return undefined;
  }, [currentSessionId, chatSessions, saveCurrentSession]);

  const deleteSession = useCallback((sessionId: string): void => {
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      StorageService.saveSessions(filtered);
      return filtered;
    });

    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter((s) => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
        setMessages(remainingSessions[0].messages);
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
        setChatSessions([emptySession]);
        setCurrentSessionId(newId);
        setMessages([]);
        StorageService.saveSessions([emptySession]);
      }
    }
  }, [currentSessionId, chatSessions, initialAgentId]);

  const updateMessages = useCallback((newMessages: Message[]): void => {
    setMessages(newMessages);
    if (currentSessionId) {
      setChatSessions((prev) => {
        const updated = prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: newMessages,
                lastUpdated: new Date(),
                title:
                  newMessages.length > 0
                    ? newMessages[0].content.slice(0, 32).trim() +
                      (newMessages[0].content.length > 32 ? "..." : "")
                    : session.title,
              }
            : session
        );
        StorageService.saveSessions(updated);
        return updated;
      });
    }
  }, [currentSessionId]);

  const updateSessionAgent = useCallback((sessionId: string, agentId: string) => {
    setChatSessions((prev) => {
      const updated = prev.map((session) =>
        session.id === sessionId ? { ...session, agentId } : session
      );
      StorageService.saveSessions(updated);
      return updated;
    });
  }, []);

  const clearAllSessions = useCallback((agentId?: string): void => {
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
  }, [initialAgentId]);

  return {
    chatSessions,
    currentSessionId,
    currentSession: chatSessions.find((s) => s.id === currentSessionId),
    messages,
    createNewSession,
    switchSession,
    deleteSession,
    clearAllSessions,
    updateMessages,
    saveCurrentSession,
    updateSessionAgent,
  };
};
