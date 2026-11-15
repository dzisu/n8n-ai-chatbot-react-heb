import React, { useState, useEffect, useMemo } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { AgentDrawer } from "./components/AgentDrawer";
import { useChatSessions } from "./hooks/useChatSessions";
import { useChat } from "./hooks/useChat";
import { N8NService } from "./services/n8nService";
import { StorageService } from "./services/storageService";
import { Agent } from "./types/chat";

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

  // Agents State
  const [agents, setAgents] = useState<Agent[]>(() =>
    StorageService.loadAgents()
  );
  const [activeAgentId, setActiveAgentId] = useState<string>(() =>
    StorageService.loadActiveAgentId(agents[0]?.id || "shuki")
  );

  // UI Drawers - Closed by default on all devices (especially mobile)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);

  // Service instance
  const [n8nService] = useState(() => new N8NService());

  // Find active agent object
  const activeAgent = useMemo(() => {
    return agents.find((a) => a.id === activeAgentId) || agents[0];
  }, [agents, activeAgentId]);

  // Chat sessions
  const {
    chatSessions,
    currentSessionId,
    currentSession,
    messages,
    createNewSession,
    switchSession,
    deleteSession,
    clearAllSessions,
    updateMessages,
    saveCurrentSession,
    updateSessionAgent,
  } = useChatSessions(activeAgent?.id || "shuki");

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

  // If active session changes, sync active agent if session has one
  const handleSwitchSession = (sessionId: string) => {
    const session = switchSession(sessionId);
    if (session && session.agentId) {
      const match = agents.find((a) => a.id === session.agentId);
      if (match) {
        setActiveAgentId(match.id);
      }
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setActiveAgentId(agentId);
    if (currentSessionId) {
      updateSessionAgent(currentSessionId, agentId);
    }
  };

  const handleSaveAgent = (agent: Agent) => {
    setAgents((prev) => {
      const exists = prev.some((a) => a.id === agent.id);
      const updated = exists
        ? prev.map((a) => (a.id === agent.id ? agent : a))
        : [...prev, agent];
      StorageService.saveAgents(updated);
      return updated;
    });
    setActiveAgentId(agent.id);
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents((prev) => {
      const updated = prev.filter((a) => a.id !== agentId);
      StorageService.saveAgents(updated);
      return updated;
    });

    if (activeAgentId === agentId) {
      const fallback = agents.find((a) => a.id !== agentId) || agents[0];
      if (fallback) {
        setActiveAgentId(fallback.id);
      }
    }
  };

  const handleCreateNewSession = () => {
    createNewSession(activeAgent?.id);
  };

  const handleExportChat = () => {
    if (currentSession) {
      StorageService.exportSession(currentSession, activeAgent);
    }
  };

  return (
    <div
      dir="rtl"
      className="flex h-[100dvh] h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative font-sans transition-colors duration-200"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 -z-10" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Chat Area - 100% full screen on mobile by default */}
      <div className="flex-1 flex flex-col h-full w-full min-w-0 relative">
        <ChatHeader
          activeAgent={activeAgent}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenAgents={() => setIsAgentsOpen(true)}
          sessionsCount={chatSessions.length}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          activeAgent={activeAgent}
          onSendMessage={sendMessage}
        />

        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          activeAgent={activeAgent}
        />
      </div>

      {/* History Drawer - Hidden by default */}
      <ChatSidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        agents={agents}
        onCreateNewSession={handleCreateNewSession}
        onSwitchSession={handleSwitchSession}
        onDeleteSession={deleteSession}
        onClearAllHistory={() => clearAllSessions(activeAgent?.id)}
        onExportChat={handleExportChat}
        hasMessages={messages.length > 0}
      />

      {/* Agents Drawer - Hidden by default */}
      <AgentDrawer
        isOpen={isAgentsOpen}
        onClose={() => setIsAgentsOpen(false)}
        agents={agents}
        activeAgentId={activeAgentId}
        onSelectAgent={handleSelectAgent}
        onSaveAgent={handleSaveAgent}
        onDeleteAgent={handleDeleteAgent}
      />
    </div>
  );
};

export default N8NChatbot;
