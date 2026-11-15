import { useState, useEffect, useCallback, useRef } from "react";
import { ChatSession, Message } from "../types/chat";
import { StorageService } from "../services/storageService";

export const useChatSessions = (
  initialAgentId: string = "shuki",
  ownerUid?: string | null
) => {
  const isLoggedIn = Boolean(ownerUid);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() =>
    isLoggedIn ? StorageService.loadSessions() : []
  );
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Ref to track if local user is actively typing or sending messages to avoid clobbering by listener
  const isLocalUpdateRef = useRef(false);

  // Initial setup from local cache
  useEffect(() => {
    if (!isLoggedIn || !ownerUid) {
      setChatSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
      return;
    }

    const savedSessions = StorageService.loadSessions().filter(
      (s) => s.ownerUid === ownerUid || !s.ownerUid
    );
    setChatSessions(savedSessions);

    const activeSessions = savedSessions.filter((s) => !s.isArchived);

    if (activeSessions.length === 0) {
      const initialId = crypto.randomUUID();
      const newSession: ChatSession = {
        id: initialId,
        title: "שיחה חדשה",
        agentId: initialAgentId,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
        isArchived: false,
        ownerUid,
        userId: ownerUid,
      };
      const initialList = [newSession, ...savedSessions];
      setChatSessions(initialList);
      setCurrentSessionId(initialId);
      setMessages([]);
      StorageService.saveSession(newSession, ownerUid);
    } else {
      const matching =
        activeSessions.find((s) => s.agentId === initialAgentId) ||
        activeSessions[0];
      setCurrentSessionId(matching.id);
      setMessages(matching.messages);
    }
  }, [initialAgentId, isLoggedIn, ownerUid]);

  // Real-time Firestore sync strictly scoped to ownerUid
  useEffect(() => {
    if (!isLoggedIn || !ownerUid) return;

    const unsubscribe = StorageService.subscribeToSessions(ownerUid, (fetched) => {
      if (fetched.length > 0) {
        setChatSessions((prev) => {
          // Merge preserving messages already loaded locally
          return fetched.map((f) => {
            const existing = prev.find((p) => p.id === f.id);
            return existing && existing.messages.length > 0
              ? { ...f, messages: existing.messages }
              : f;
          });
        });

        setCurrentSessionId((prev) => {
          if (prev && fetched.some((s) => s.id === prev)) {
            return prev;
          }
          const active = fetched.filter((s) => !s.isArchived);
          if (active.length > 0) {
            const match =
              active.find((s) => s.agentId === initialAgentId) || active[0];
            return match.id;
          }
          return prev;
        });
      } else {
        setChatSessions([]);
      }
    });

    return () => unsubscribe();
  }, [initialAgentId, isLoggedIn, ownerUid]);

  // Real-time subcollection messages listener for active session
  useEffect(() => {
    if (!currentSessionId || !isLoggedIn) return;

    const unsubMessages = StorageService.subscribeToMessages(
      currentSessionId,
      (fetchedMsgs) => {
        if (isLocalUpdateRef.current) {
          isLocalUpdateRef.current = false;
          return;
        }
        setMessages(fetchedMsgs);
        setChatSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: fetchedMsgs,
                  messageCount: fetchedMsgs.length,
                  lastMessage:
                    fetchedMsgs.length > 0
                      ? fetchedMsgs[fetchedMsgs.length - 1].content
                      : s.lastMessage,
                }
              : s
          )
        );
      }
    );

    return () => unsubMessages();
  }, [currentSessionId, isLoggedIn]);

  const createNewSession = useCallback(
    (agentId?: string): string => {
      isLocalUpdateRef.current = true;
      const newId = crypto.randomUUID();
      const targetAgentId = agentId || initialAgentId;
      const newSession: ChatSession = {
        id: newId,
        title: "שיחה חדשה",
        agentId: targetAgentId,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
        isArchived: false,
        ownerUid: ownerUid || undefined,
        userId: ownerUid || undefined,
      };

      setChatSessions((prev) => {
        const cleaned = prev.filter(
          (s) => s.isArchived || s.messages.length > 0
        );
        const updated = [newSession, ...cleaned];
        StorageService.saveSession(newSession, ownerUid || undefined);
        return updated;
      });

      setCurrentSessionId(newId);
      setMessages([]);
      return newId;
    },
    [initialAgentId, ownerUid]
  );

  const saveCurrentSession = useCallback((): void => {
    if (!currentSessionId) return;

    setChatSessions((prev) => {
      const target = prev.find((s) => s.id === currentSessionId);
      if (target) {
        const updatedTarget = {
          ...target,
          messages,
          lastUpdated: new Date(),
          ownerUid: ownerUid || target.ownerUid,
          userId: ownerUid || target.userId,
        };
        StorageService.saveSession(updatedTarget, ownerUid || undefined);
      }
      return prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages,
              lastUpdated: new Date(),
              ownerUid: ownerUid || session.ownerUid,
              userId: ownerUid || session.userId,
            }
          : session
      );
    });
  }, [currentSessionId, messages, ownerUid]);

  const switchSession = useCallback(
    (sessionId: string): ChatSession | undefined => {
      const allSessions = StorageService.loadSessions();
      const target =
        chatSessions.find((s) => s.id === sessionId) ||
        allSessions.find((s) => s.id === sessionId);

      if (!target) return undefined;

      setChatSessions((prev) => {
        const cleaned = prev.filter(
          (s) => s.id === sessionId || s.isArchived || s.messages.length > 0
        );
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

      isLocalUpdateRef.current = true;
      setChatSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id === sessionId) {
            const modified = { ...s, title: trimmed, lastUpdated: new Date() };
            StorageService.saveSession(modified, ownerUid || undefined);
            return modified;
          }
          return s;
        });
        return updated;
      });
    },
    [ownerUid]
  );

  const archiveSession = useCallback(
    (sessionId: string): void => {
      isLocalUpdateRef.current = true;
      setChatSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id === sessionId) {
            const modified = { ...s, isArchived: true, lastUpdated: new Date() };
            StorageService.saveSession(modified, ownerUid || undefined);
            return modified;
          }
          return s;
        });

        if (currentSessionId === sessionId) {
          const remainingActive = updated.filter((s) => !s.isArchived);
          if (remainingActive.length > 0) {
            setCurrentSessionId(remainingActive[0].id);
            setMessages(remainingActive[0].messages);
          } else {
            const newId = crypto.randomUUID();
            const freshSession: ChatSession = {
              id: newId,
              title: "שיחה חדשה",
              agentId: initialAgentId,
              messages: [],
              createdAt: new Date(),
              lastUpdated: new Date(),
              isArchived: false,
              ownerUid: ownerUid || undefined,
              userId: ownerUid || undefined,
            };
            const nextSessions = [freshSession, ...updated];
            StorageService.saveSession(freshSession, ownerUid || undefined);
            setCurrentSessionId(newId);
            setMessages([]);
            return nextSessions;
          }
        }

        return updated;
      });
    },
    [currentSessionId, initialAgentId, ownerUid]
  );

  const unarchiveSession = useCallback(
    (sessionId: string): void => {
      isLocalUpdateRef.current = true;
      setChatSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id === sessionId) {
            const modified = { ...s, isArchived: false, lastUpdated: new Date() };
            StorageService.saveSession(modified, ownerUid || undefined);
            return modified;
          }
          return s;
        });
        return updated;
      });
    },
    [ownerUid]
  );

  const archiveAllSessions = useCallback(
    (agentId?: string): void => {
      isLocalUpdateRef.current = true;
      setChatSessions((prev) => {
        const updated = prev.map((s) => {
          if (!s.isArchived) {
            if (!agentId || s.agentId === agentId) {
              if (s.messages.length > 0) {
                const modified = { ...s, isArchived: true, lastUpdated: new Date() };
                StorageService.saveSession(modified, ownerUid || undefined);
                return modified;
              }
            }
          }
          return s;
        });

        const cleaned = updated.filter(
          (s) => s.isArchived || s.messages.length > 0
        );

        const newId = crypto.randomUUID();
        const freshSession: ChatSession = {
          id: newId,
          title: "שיחה חדשה",
          agentId: agentId || initialAgentId,
          messages: [],
          createdAt: new Date(),
          lastUpdated: new Date(),
          isArchived: false,
          ownerUid: ownerUid || undefined,
          userId: ownerUid || undefined,
        };

        const finalSessions = [freshSession, ...cleaned];
        StorageService.saveSession(freshSession, ownerUid || undefined);
        setCurrentSessionId(newId);
        setMessages([]);
        return finalSessions;
      });
    },
    [initialAgentId, ownerUid]
  );

  const deleteSession = useCallback(
    (sessionId: string): void => {
      isLocalUpdateRef.current = true;
      StorageService.deleteSession(sessionId);
      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);

        if (currentSessionId === sessionId) {
          const activeSessions = filtered.filter((s) => !s.isArchived);
          if (activeSessions.length > 0) {
            setCurrentSessionId(activeSessions[0].id);
            setMessages(activeSessions[0].messages);
          } else {
            const newId = crypto.randomUUID();
            const emptySession: ChatSession = {
              id: newId,
              title: "שיחה חדשה",
              agentId: initialAgentId,
              messages: [],
              createdAt: new Date(),
              lastUpdated: new Date(),
              isArchived: false,
              ownerUid: ownerUid || undefined,
              userId: ownerUid || undefined,
            };
            const nextList = [emptySession, ...filtered];
            StorageService.saveSession(emptySession, ownerUid || undefined);
            setCurrentSessionId(newId);
            setMessages([]);
            return nextList;
          }
        }
        return filtered;
      });
    },
    [currentSessionId, initialAgentId, ownerUid]
  );

  const updateMessages = useCallback(
    (newMessages: Message[]): void => {
      isLocalUpdateRef.current = true;
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

            const updatedSession = {
              ...session,
              messages: newMessages,
              messageCount: newMessages.length,
              lastMessage:
                newMessages.length > 0
                  ? newMessages[newMessages.length - 1].content
                  : session.lastMessage,
              lastUpdated: new Date(),
              title,
              ownerUid: ownerUid || session.ownerUid,
              userId: ownerUid || session.userId,
            };
            StorageService.saveSession(updatedSession, ownerUid || undefined);
            return updatedSession;
          });
          return updated;
        });
      }
    },
    [currentSessionId, ownerUid]
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
