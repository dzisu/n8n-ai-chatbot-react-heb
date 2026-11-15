import React from "react";
import { Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface TypingIndicatorProps {
  agent?: Agent;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ agent }) => {
  return (
    <div className="flex w-full justify-end my-2">
      <div className="flex max-w-[80%] gap-2.5 sm:gap-3 flex-row-reverse items-center">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${
            agent?.color || "from-emerald-600 to-teal-600"
          } flex items-center justify-center flex-shrink-0 text-white shadow-md`}
        >
          <DynamicLucideIcon name={agent?.avatarIcon} size={16} />
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex space-x-2 space-x-reverse items-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
