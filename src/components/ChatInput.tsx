import React, { useState, useRef } from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";
import { Agent, FileAttachment, User } from "../types/chat";

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: FileAttachment) => void;
  isLoading: boolean;
  activeAgent?: Agent;
  currentUser?: User | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  activeAgent,
  currentUser,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("גודל הקובץ חורג מהמקסימום המותר (15MB)");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachment({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
        isImage,
      });
    };

    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    if ((!inputMessage.trim() && !attachment) || isLoading) return;
    onSendMessage(inputMessage.trim(), attachment || undefined);
    setInputMessage("");
    setAttachment(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInputDisabled = isLoading || !currentUser || !activeAgent;
  const canSend = (inputMessage.trim().length > 0 || attachment !== null) && !isInputDisabled;

  return (
    <div
      className="border-t border-slate-200 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0 z-20 transition-colors"
      style={{
        paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0.65rem))",
      }}
    >
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Attachment preview bar */}
        {attachment && (
          <div className="flex items-center justify-between bg-blue-50/90 dark:bg-slate-800/90 border border-blue-200 dark:border-blue-500/30 rounded-xl p-2 px-3 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              {attachment.isImage && attachment.dataUrl ? (
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
              )}
              <div className="min-w-0 text-right">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {attachment.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="הסר קובץ"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex gap-2 sm:gap-2.5 items-center">
          {/* File attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isInputDisabled}
            className="p-2.5 sm:p-3 rounded-2xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/70 transition-all flex-shrink-0 active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title="צרף קובץ או תמונה"
          >
            <Paperclip size={18} />
          </button>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !currentUser
                  ? "יש להתחבר למערכת כדי להתחיל שיחה..."
                  : !activeAgent
                  ? "אין סוכן מורשה לבחירה..."
                  : attachment
                  ? "הוסף הודעה לקובץ או לחץ שלח..."
                  : `כתוב הודעה ל-${activeAgent.name}...`
              }
              className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm sm:text-base p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isInputDisabled}
              autoFocus={false}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-2.5 sm:p-3 rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex-shrink-0 flex items-center justify-center"
            title="שלח הודעה"
          >
            <Send size={18} className="transform -rotate-90 sm:rotate-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
