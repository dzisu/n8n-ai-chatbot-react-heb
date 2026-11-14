import React from "react";
import { Bot, Sparkles, Code, Film, BookOpen, User } from "lucide-react";
import { Agent } from "../types/chat";

interface EmptyStateProps {
  activeAgent?: Agent;
  onSuggestionClick?: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  activeAgent,
  onSuggestionClick,
}) => {
  const renderAgentIcon = (iconName?: string) => {
    switch (iconName) {
      case "sparkles":
        return <Sparkles size={32} />;
      case "code":
        return <Code size={32} />;
      case "film":
        return <Film size={32} />;
      case "book-open":
        return <BookOpen size={32} />;
      case "user":
        return <User size={32} />;
      default:
        return <Bot size={32} />;
    }
  };

  const defaultSuggestions = [
    "ספר לי מה אתה יכול לעשות ואיך אתה יכול לעזור",
    "בוא נעשה סיעור מוחות קצר",
    "תן לי טיפ מעשי שיכול לעזור לי היום",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-lg mx-auto">
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${
          activeAgent?.color || "from-blue-600 to-indigo-600"
        } flex items-center justify-center text-white shadow-xl mb-4 animate-bounce-subtle`}
      >
        {renderAgentIcon(activeAgent?.avatarIcon)}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
        היי! אני {activeAgent?.name || "העוזר שלך"}
      </h3>

      <p className="text-sm text-blue-300 font-medium mb-2">
        {activeAgent?.role || "סוכן n8n"}
      </p>

      {activeAgent?.description && (
        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed max-w-sm">
          {activeAgent.description}
        </p>
      )}

      {/* Suggested prompts */}
      <div className="w-full space-y-2 mt-2">
        <p className="text-[11px] text-slate-400 font-medium mb-1">הצעות לפתיחת שיחה:</p>
        {defaultSuggestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick && onSuggestionClick(text)}
            className="w-full text-right bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/40 text-xs sm:text-sm transition-all duration-200 shadow-sm"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
