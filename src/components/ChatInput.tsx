import React, { useState, useRef } from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";
import { Agent, FileAttachment, User } from "../types/chat";

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: FileAttachment) => void;
  isLoading: boolean;
  activeAgent?: Agent;
  currentUser?: User | null;
}

const ALLOWED_EXTENSIONS = [
  "png", "jpg", "jpeg", "webp", "gif", "svg",
  "pdf", "txt", "md", "doc", "docx", "csv", "xlsx", "xls", "json", "xml",
  "py", "rpy", "js", "ts", "html", "css",
  "mp3", "wav", "m4a", "ogg"
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

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

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert("גודל הקובץ חורג מהמקסימום המותר (10MB). אנא בחר קובץ קטן יותר.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`סוג הקובץ (.${ext}) אינו נתמך. ניתן לצרף תמונות, מסמכי PDF, קבצי טקסט/קוד או אודיו.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        rawFile: file,
        uploadId: crypto.randomUUID(),
        status: "pending",
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
      className="border-t border-[#E0E0E0] dark:border-[#353535] bg-[#FAFAFA]/95 dark:bg-[#191919]/95 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0 z-20 transition-colors"
      style={{
        paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0.65rem))",
      }}
    >
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Attachment preview bar */}
        {attachment && (
          <div className="flex items-center justify-between bg-[#F1F1F1] dark:bg-[#242424] border border-[#E0E0E0] dark:border-[#353535] rounded-xl p-2 px-3 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              {attachment.isImage && attachment.dataUrl ? (
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="w-10 h-10 object-cover rounded-lg border border-[#E0E0E0] dark:border-[#353535] flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#EAEAEA] dark:bg-[#353535] text-[#191919] dark:text-[#FAFAFA] flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
              )}
              <div className="min-w-0 text-right">
                <p className="text-xs font-semibold text-[#191919] dark:text-[#FAFAFA] truncate max-w-[200px] sm:max-w-xs font-sans">
                  {attachment.name}
                </p>
                <p className="text-[10px] text-[#676767] dark:text-[#A4A4A4] font-mono">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="p-1 rounded-lg text-[#676767] hover:text-[#191919] dark:text-[#A4A4A4] dark:hover:text-[#FAFAFA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
            className="p-2.5 sm:p-3 rounded-2xl text-[#676767] dark:text-[#A4A4A4] hover:text-[#191919] dark:hover:text-[#FAFAFA] bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] border border-[#E0E0E0] dark:border-[#353535] transition-all flex-shrink-0 active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
              className="w-full bg-[#F1F1F1] dark:bg-[#242424] text-[#191919] dark:text-[#FAFAFA] text-sm sm:text-base p-2.5 sm:p-3 rounded-2xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#191919] dark:focus:border-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#191919]/20 dark:focus:ring-[#FAFAFA]/20 transition-all placeholder-[#868686] dark:placeholder-[#676767] shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isInputDisabled}
              autoFocus={false}
            />
          </div>

          {/* Send Button - Official n8n Accent Pink Single Touch */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="bg-[#FF91AC] hover:bg-[#ff7a9b] text-[#191919] p-2.5 sm:p-3 rounded-2xl transition-all duration-200 disabled:bg-[#EAEAEA] dark:disabled:bg-[#353535] disabled:text-[#868686] dark:disabled:text-[#676767] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 flex-shrink-0 flex items-center justify-center cursor-pointer"
            title="שלח הודעה"
          >
            <Send size={18} className="transform -rotate-90 sm:rotate-0 text-[#191919]" />
          </button>
        </div>
      </div>
    </div>
  );
};
