import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Agent } from "../types/chat";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeAgent?: Agent;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  activeAgent,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="border-t border-slate-200 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0 z-20 transition-colors"
      style={{
        paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0.65rem))",
      }}
    >
      <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-center">
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              activeAgent
                ? `כתוב הודעה ל-${activeAgent.name}...`
                : "כתוב הודעה כאן..."
            }
            className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm sm:text-base p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
            disabled={isLoading}
            autoFocus={false}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-2.5 sm:p-3 rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex-shrink-0 flex items-center justify-center"
          title="שלח הודעה"
        >
          <Send size={18} className="transform -rotate-90 sm:rotate-0" />
        </button>
      </div>
    </div>
  );
};
