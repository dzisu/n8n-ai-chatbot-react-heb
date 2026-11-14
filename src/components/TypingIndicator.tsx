import React from "react";
import { Bot, Sparkles, Code, Film, BookOpen } from "lucide-react";
import { Agent } from "../types/chat";

interface TypingIndicatorProps {
  agent?: Agent;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ agent }) => {
  const renderAgentIcon = (iconName?: string) => {
    switch (iconName) {
      case "sparkles":
        return <Sparkles size={16} />;
      case "code":
        return <Code size={16} />;
      case "film":
        return <Film size={16} />;
      case "book-open":
        return <BookOpen size={16} />;
      default:
        return <Bot size={16} />;
    }
  };

  return (
    <div className="flex w-full justify-end my-2">
      <div className="flex max-w-[80%] gap-2.5 sm:gap-3 flex-row-reverse items-center">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${
            agent?.color || "from-emerald-600 to-teal-600"
          } flex items-center justify-center flex-shrink-0 text-white shadow-md`}
        >
          {renderAgentIcon(agent?.avatarIcon)}
        </div>
        <div className="bg-slate-800/90 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700/60 shadow-md">
          <div className="flex space-x-2 space-x-reverse items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
