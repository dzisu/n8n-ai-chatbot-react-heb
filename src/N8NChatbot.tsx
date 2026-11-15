import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { OpeningScreen } from "./components/OpeningScreen";
import { useChatSessions } from "./hooks/useChatSessions";
import { useChat } from "./hooks/useChat";
import { N8NService } from "./services/n8nService";
import { StorageService } from "./services/storageService";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Agent, User } from "./types/chat";

// Code Splitting - Lazy load heavy drawers & modals to optimize initial bundle size
const AgentDrawer = lazy(() =>
  import("./components/AgentDrawer").then((m) => ({ default: m.AgentDrawer }))
);
const UserManagementDrawer = lazy(() =>
  import("./components/UserManagementDrawer").then((m) => ({
    default: m.UserManagementDrawer,
  }))
);
const LoginModal = lazy(() =>
  import("./components/LoginModal").then((m) => ({ default: m.LoginModal }))
);

const N8NChatbot: React.FC = () => {
  // Theme state - Default is dark
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("chatbot_theme");
    return saved === "light" ? "light" : "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("chatbot_theme", next);
      return next;
    });
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  // Users & Authentication State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    StorageService.loadCurrentUser()
  );

  // Subscribe to Firebase Auth state
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await StorageService.syncUserProfile(firebaseUser);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
        StorageService.saveCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore users updates
  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      return;
    }

    const unsub = StorageService.subscribeToUsers((fetched) => {
      setUsers(fetched);
      setCurrentUser((curr) => {
        if (!curr) return null;
        const fresh = fetched.find((u) => u.id === curr.id);
        if (fresh) {
          StorageService.saveCurrentUser(fresh);
          return fresh;
        }
        return curr;
      });
    });
    return () => unsub();
  }, [currentUser?.id]);

  // Agents State
  const [agents, setAgents] = useState<Agent[]>(() =>
    StorageService.loadAgents()
  );

  // Subscribe to real-time Firestore agents updates
  useEffect(() => {
    const unsub = StorageService.subscribeToAgents((fetched) => {
      setAgents(fetched);
    });
    return () => unsub();
  }, []);

  // Calculate visible agents based on login status and role
  const visibleAgents = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return agents;
    const allowed = new Set(currentUser.allowedAgentIds || []);
    return agents.filter((a) => allowed.has(a.id));
  }, [agents, currentUser]);

  const [activeAgentId, setActiveAgentId] = useState<string>(() => {
    return StorageService.loadActiveAgentId("shuki");
  });

  // Keep activeAgentId valid among visible agents
  useEffect(() => {
    if (currentUser && visibleAgents.length > 0) {
      if (!visibleAgents.some((a) => a.id === activeAgentId)) {
        setActiveAgentId(visibleAgents[0].id);
      }
    }
  }, [currentUser, visibleAgents, activeAgentId]);

  // UI Drawers & Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Service instance
  const [n8nService] = useState(() => new N8NService());

  // Find active agent object
  const activeAgent = useMemo(() => {
    if (!currentUser || visibleAgents.length === 0) return undefined;
    return (
      visibleAgents.find((a) => a.id === activeAgentId) || visibleAgents[0]
    );
  }, [currentUser, visibleAgents, activeAgentId]);

  // Chat sessions strictly bound and scoped to current user UID
  const {
    chatSessions,
    currentSessionId,
    currentSession,
    messages,
    createNewSession,
    switchSession,
    renameSession,
    archiveSession,
    unarchiveSession,
    archiveAllSessions,
    deleteSession,
    updateMessages,
    saveCurrentSession,
  } = useChatSessions(activeAgent?.id || "shuki", currentUser?.id);

  // Visible sessions for the current user
  const visibleSessions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return chatSessions;
    const allowedIds = new Set(visibleAgents.map((a) => a.id));
    return chatSessions.filter((s) => allowedIds.has(s.agentId));
  }, [chatSessions, currentUser, visibleAgents]);

  const activeSessionsCount = useMemo(() => {
    return visibleSessions.filter((s) => !s.isArchived).length;
  }, [visibleSessions]);

  // Chat hook
  const { sendMessage, isLoading } = useChat(
    messages,
    updateMessages,
    currentSessionId,
    n8nService,
    activeAgent
  );

  // Save active agent ID
  useEffect(() => {
    if (activeAgent?.id) {
      StorageService.saveActiveAgentId(activeAgent.id);
    }
  }, [activeAgent]);

  // Save current session before unmounting
  useEffect(() => {
    return () => {
      saveCurrentSession();
    };
  }, [saveCurrentSession]);

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.saveCurrentUser(null);
    setIsAgentsOpen(false);
    setIsHistoryOpen(false);
    setIsUserManagementOpen(false);
  };

  // User Management Handlers (Admin)
  const handleSaveUser = async (user: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      const updated = exists
        ? prev.map((u) => (u.id === user.id ? user : u))
        : [...prev, user];
      return updated;
    });
    await StorageService.saveUser(user);

    if (currentUser?.id === user.id) {
      setCurrentUser(user);
      StorageService.saveCurrentUser(user);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    await StorageService.deleteUser(userId);
  };

  // If active session changes, sync active agent if session has one
  const handleSwitchSession = (sessionId: string) => {
    const session = switchSession(sessionId);
    if (session && session.agentId) {
      const match = visibleAgents.find((a) => a.id === session.agentId);
      if (match) {
        setActiveAgentId(match.id);
      }
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setActiveAgentId(agentId);
    setIsAgentsOpen(false);
    setIsHistoryOpen(false);

    // If current session is already an empty conversation for this agent, keep it
    if (
      currentSession &&
      currentSession.agentId === agentId &&
      messages.length === 0
    ) {
      return;
    }

    // Always create a fresh new session for the selected agent by default
    createNewSession(agentId);
  };

  const handleSaveAgent = async (agent: Agent) => {
    setAgents((prev) => {
      const exists = prev.some((a) => a.id === agent.id);
      const updated = exists
        ? prev.map((a) => (a.id === agent.id ? agent : a))
        : [...prev, agent];
      return updated;
    });
    await StorageService.saveAgent(agent);
    setActiveAgentId(agent.id);
  };

  const handleDeleteAgent = async (agentId: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
    await StorageService.deleteAgent(agentId);

    if (activeAgentId === agentId) {
      const fallback =
        visibleAgents.find((a) => a.id !== agentId) || visibleAgents[0];
      if (fallback) {
        setActiveAgentId(fallback.id);
      }
    }
  };

  const handleCreateNewSession = (agentId?: string) => {
    const target =
      agentId || activeAgent?.id || (visibleAgents[0]?.id || "shuki");
    setActiveAgentId(target);
    createNewSession(target);
  };

  const handleExportChat = () => {
    if (currentSession) {
      StorageService.exportSession(currentSession, activeAgent);
    }
  };

  return (
    <div
      dir="rtl"
      className="flex h-[100dvh] h-full w-full bg-[#FAFAFA] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] overflow-hidden relative font-sans transition-colors duration-200"
    >
      {/* n8n Canvas dot grid and subtle ambient pink aura */}
      <div className="absolute inset-0 n8n-dot-grid -z-10" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF91AC]/5 dark:bg-[#FF91AC]/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#87003C]/5 dark:bg-[#87003C]/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Area: If not logged in, show Opening Screen with solid n8n logo only */}
      {!currentUser ? (
        <OpeningScreen
          onOpenLogin={() => setIsLoginOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        /* Main Chat Area */
        <div className="flex-1 flex flex-col h-full w-full min-w-0 relative">
          <ChatHeader
            activeAgent={activeAgent}
            currentUser={currentUser}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenAgents={() => setIsAgentsOpen(true)}
            onOpenUserManagement={() => setIsUserManagementOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            sessionsCount={activeSessionsCount}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            activeAgent={activeAgent}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
            onSendMessage={sendMessage}
          />

          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            activeAgent={activeAgent}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* History & Archive Drawer */}
      <ChatSidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        chatSessions={visibleSessions}
        currentSessionId={currentSessionId}
        agents={visibleAgents}
        activeAgentId={activeAgentId}
        onCreateNewSession={handleCreateNewSession}
        onSwitchSession={handleSwitchSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onArchiveSession={archiveSession}
        onUnarchiveSession={unarchiveSession}
        onArchiveAllHistory={(agentId) =>
          archiveAllSessions(agentId || activeAgent?.id)
        }
        onExportChat={handleExportChat}
        hasMessages={messages.length > 0}
      />

      {/* Suspended Drawers and Modals for Code Splitting */}
      <Suspense fallback={null}>
        {isAgentsOpen && (
          <AgentDrawer
            isOpen={isAgentsOpen}
            onClose={() => setIsAgentsOpen(false)}
            agents={visibleAgents}
            activeAgentId={activeAgentId}
            currentUser={currentUser}
            onSelectAgent={handleSelectAgent}
            onSaveAgent={handleSaveAgent}
            onDeleteAgent={handleDeleteAgent}
            onLogout={handleLogout}
          />
        )}

        {isUserManagementOpen && (
          <UserManagementDrawer
            isOpen={isUserManagementOpen}
            onClose={() => setIsUserManagementOpen(false)}
            users={users}
            agents={agents}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {isLoginOpen && (
          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}
      </Suspense>
    </div>
  );
};

export default N8NChatbot;
