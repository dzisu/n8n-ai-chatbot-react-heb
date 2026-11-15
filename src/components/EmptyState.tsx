import React from "react";
import { Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface EmptyStateProps {
  activeAgent?: Agent;
  onSuggestionClick?: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ activeAgent }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-lg mx-auto my-auto">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${
          activeAgent?.color || "from-blue-600 to-indigo-600"
        } flex items-center justify-center shrink-0 aspect-square text-white shadow-xl mb-4`}
        style={{
          width: "5rem",
          height: "5rem",
          minWidth: "5rem",
          minHeight: "5rem",
          aspectRatio: "1 / 1",
        }}
      >
        <DynamicLucideIcon name={activeAgent?.avatarIcon} size={42} />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1">
        היי! אני {activeAgent?.name || "העוזר שלך"}
      </h3>

      <p className="text-sm text-blue-600 dark:text-blue-300 font-medium mb-2">
        {activeAgent?.role || "סוכן n8n"}
      </p>

      {activeAgent?.description && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed max-w-sm">
          {activeAgent.description}
        </p>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
        הקלד הודעה למטה כדי להתחיל בשיחה
      </p>
    </div>
  );
};
