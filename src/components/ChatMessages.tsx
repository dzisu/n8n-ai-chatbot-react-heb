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
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll container directly without touching window scroll (essential for iOS Safari)
    scrollToBottom(true);
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 overscroll-contain transition-colors"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
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
    </div>
  );
};
