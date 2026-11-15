import React from "react";
import {
  MessageSquare,
  Users,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface ChatHeaderProps {
  activeAgent?: Agent;
  onOpenHistory: () => void;
  onOpenAgents: () => void;
  sessionsCount: number;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeAgent,
  onOpenHistory,
  onOpenAgents,
  sessionsCount,
  theme,
  onToggleTheme,
}) => {
  const hasMissingWebhook =
    !activeAgent?.webhookUrl ||
    activeAgent.webhookUrl.includes("your-n8n-instance.com");

  return (
    <header className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 px-3 sm:px-6 py-2.5 sm:py-3 flex-shrink-0 z-30 transition-colors duration-200 sticky top-0"
      style={{
        paddingTop: "max(0.65rem, env(safe-area-inset-top, 0.65rem))",
      }}
    >
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Right side in RTL: History toggle & Theme toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
            title="פתח היסטוריית שיחות"
          >
            <MessageSquare size={16} className="text-blue-500 dark:text-blue-400" />
            <span className="hidden xs:inline">שיחות</span>
            {sessionsCount > 0 && (
              <span className="bg-blue-100 dark:bg-blue-600/30 text-blue-600 dark:text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {sessionsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-all shadow-sm active:scale-95"
            title={theme === "dark" ? "עבור לתבנית בהירה" : "עבור לתבנית כהה"}
          >
            {theme === "dark" ? (
              <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={17} className="text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>

        {/* Center: Current Active Agent Display (Static Badge, non-clickable) */}
        <div
          className="flex items-center gap-2 sm:gap-2.5 px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 max-w-[50%] sm:max-w-none text-right shadow-sm select-none"
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br ${
              activeAgent?.color || "from-blue-600 to-indigo-600"
            } flex items-center justify-center text-white shadow-sm flex-shrink-0`}
          >
            <DynamicLucideIcon name={activeAgent?.avatarIcon} size={16} />
          </div>

          <div className="min-w-0 text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                {activeAgent?.name || "סוכן ראשי"}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse flex-shrink-0" title="מחובר" />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              {activeAgent?.role || "סוכן n8n"}
            </p>
          </div>
        </div>

        {/* Left side in RTL: Single Agents Switcher Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {hasMissingWebhook && (
            <button
              onClick={onOpenAgents}
              className="hidden md:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all"
              title="הגדר כתובת Webhook לסוכן זה"
            >
              <AlertCircle size={14} />
              <span>הגדר Webhook</span>
            </button>
          )}

          <button
            onClick={onOpenAgents}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md active:scale-95"
            title="פתח ניהול והחלפת סוכנים"
          >
            <Users size={16} />
            <span>סוכנים</span>
          </button>
        </div>
      </div>
    </header>
  );
};
