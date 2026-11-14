import React, { useRef, useEffect } from "react";
import { Message, Agent } from "../types/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  activeAgent?: Agent;
  onSendMessage?: (message: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  activeAgent,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
      {messages.length === 0 ? (
        <EmptyState
          activeAgent={activeAgent}
          onSuggestionClick={onSendMessage}
        />
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            agent={activeAgent}
          />
        ))
      )}

      {isLoading && <TypingIndicator agent={activeAgent} />}

      <div ref={messagesEndRef} />
    </div>
  );
};
