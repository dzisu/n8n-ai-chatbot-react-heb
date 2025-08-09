import React, { useState, useEffect } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { useChatSessions } from "./hooks/useChatSessions";
import { useChat } from "./hooks/useChat";
import { N8NService } from "./services/n8nService";
import { StorageService } from "./services/storageService";

const N8NChatbot: React.FC = () => {
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(
    "https://your-n8n-instance.com/webhook/chat"
  );
  const [n8nService] = useState(() => new N8NService(n8nWebhookUrl));

  const {
    chatSessions,
    currentSessionId,
    messages,
    createNewSession,
    switchSession,
    deleteSession,
    updateMessages,
    saveCurrentSession,
  } = useChatSessions();

  const { sendMessage, isLoading } = useChat(
    messages,
    updateMessages,
    currentSessionId,
    n8nService
  );

  // Update N8N service when webhook URL changes
  useEffect(() => {
    n8nService.updateWebhookUrl(n8nWebhookUrl);
  }, [n8nWebhookUrl, n8nService]);

  // Save current session before unmounting
  useEffect(() => {
    return () => {
      saveCurrentSession();
    };
  }, [saveCurrentSession]);

  const handleExportChat = () => {
    const currentSession = chatSessions.find((s) => s.id === currentSessionId);
    if (currentSession) {
      StorageService.exportSession(currentSession);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <ChatSidebar
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onCreateNewSession={createNewSession}
        onSwitchSession={switchSession}
        onDeleteSession={deleteSession}
        n8nWebhookUrl={n8nWebhookUrl}
        onWebhookUrlChange={setN8nWebhookUrl}
        onExportChat={handleExportChat}
        hasMessages={messages.length > 0}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default N8NChatbot;
