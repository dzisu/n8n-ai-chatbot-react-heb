import React from "react";
import { User } from "lucide-react";
import { Message, Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface MessageBubbleProps {
  message: Message;
  agent?: Agent;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, agent }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-start" : "justify-end"} my-2`}>
      <div
        className={`flex max-w-[88%] sm:max-w-[78%] md:max-w-[70%] gap-2.5 sm:gap-3 ${
          isUser ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-indigo-600"
              : `bg-gradient-to-br ${
                  agent?.color || "from-emerald-600 to-teal-600"
                }`
          }`}
        >
          {isUser ? <User size={16} /> : <DynamicLucideIcon name={agent?.avatarIcon} size={16} />}
        </div>

        {/* Bubble content */}
        <div className="flex flex-col">
          {/* Header row in bubble */}
          {!isUser && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 px-1 text-right">
              {message.agentName || agent?.name || "סוכן"}
            </span>
          )}

          <div
            className={`rounded-2xl px-4 py-3 shadow-sm text-sm sm:text-base leading-relaxed text-right ${
              isUser
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                : "bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200 dark:border-slate-700/60"
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>

            <p
              className={`text-[10px] mt-1.5 opacity-60 text-left ${
                isUser ? "text-white" : "text-slate-500 dark:text-slate-400"
              }`}
              dir="ltr"
            >
              {new Date(message.timestamp).toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
