import React from "react";
import { User, FileText, Download } from "lucide-react";
import { Message, Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface MessageBubbleProps {
  message: Message;
  agent?: Agent;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, agent }) => {
  const isUser = message.sender === "user";
  const attachment = message.attachment;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-start" : "justify-end"} my-2`}>
      <div
        className={`flex max-w-[88%] sm:max-w-[78%] md:max-w-[70%] gap-2.5 sm:gap-3 ${
          isUser ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 aspect-square text-white shadow-md ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-indigo-600"
              : `bg-gradient-to-br ${
                  agent?.color || "from-emerald-600 to-teal-600"
                }`
          }`}
          style={{
            width: "2.25rem",
            height: "2.25rem",
            minWidth: "2.25rem",
            minHeight: "2.25rem",
            aspectRatio: "1 / 1",
          }}
        >
          {isUser ? (
            <User
              size={18}
              className="shrink-0 aspect-square"
              style={{
                width: 18,
                height: 18,
                minWidth: 18,
                minHeight: 18,
                aspectRatio: "1 / 1",
              }}
            />
          ) : (
            <DynamicLucideIcon name={agent?.avatarIcon} size={18} />
          )}
        </div>

        {/* Bubble content */}
        <div className="flex flex-col min-w-0 max-w-full">
          {/* Header row in bubble */}
          {!isUser && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 px-1 text-right">
              {message.agentName || agent?.name || "סוכן"}
            </span>
          )}

          <div
            className={`rounded-2xl px-4 py-3 shadow-sm text-sm sm:text-base leading-relaxed text-right space-y-2.5 ${
              isUser
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                : "bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200 dark:border-slate-700/60"
            }`}
          >
            {/* Attachment Display */}
            {attachment && (
              <div
                className={`rounded-xl p-2.5 border transition-all ${
                  isUser
                    ? "bg-white/15 border-white/25 text-white"
                    : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                }`}
              >
                {attachment.isImage && attachment.dataUrl ? (
                  <div className="space-y-1.5">
                    <img
                      src={attachment.dataUrl}
                      alt={attachment.name}
                      className="max-h-56 w-auto max-w-full rounded-lg object-contain shadow-sm bg-black/5"
                    />
                    <div className="flex items-center justify-between text-[11px] opacity-80 pt-1">
                      <span className="truncate max-w-[180px]">{attachment.name}</span>
                      <span>{formatFileSize(attachment.size)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isUser
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                        }`}
                      >
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-xs font-semibold truncate max-w-[160px] sm:max-w-[200px]">
                          {attachment.name}
                        </p>
                        <p className="text-[10px] opacity-75">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>

                    {attachment.dataUrl && (
                      <a
                        href={attachment.dataUrl}
                        download={attachment.name}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                          isUser
                            ? "hover:bg-white/20 text-white"
                            : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        }`}
                        title="הורד קובץ"
                      >
                        <Download size={15} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}

            <p
              className={`text-[10px] mt-1 opacity-60 text-left ${
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
