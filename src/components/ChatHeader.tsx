import React from "react";
import {
  MessageSquare,
  Users,
  Sun,
  Moon,
  Wrench,
  LogIn,
  UserCheck,
} from "lucide-react";
import { Agent, User } from "../types/chat";

interface ChatHeaderProps {
  activeAgent?: Agent;
  currentUser: User | null;
  onOpenHistory: () => void;
  onOpenAgents: () => void;
  onOpenUserManagement: () => void;
  onOpenLogin: () => void;
  sessionsCount: number;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeAgent,
  currentUser,
  onOpenHistory,
  onOpenAgents,
  onOpenUserManagement,
  onOpenLogin,
  sessionsCount,
  theme,
  onToggleTheme,
}) => {
  const isAdmin = currentUser?.role === "admin";
  const isLoggedIn = !!currentUser;

  return (
    <header className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 px-3 sm:px-6 py-2.5 sm:py-3 flex-shrink-0 z-30 transition-colors duration-200 sticky top-0"
      style={{
        paddingTop: "max(0.65rem, env(safe-area-inset-top, 0.65rem))",
      }}
    >
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Right side in RTL: History, Theme, Settings (Wrench), Login */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History Button */}
          <button
            onClick={isLoggedIn ? onOpenHistory : onOpenLogin}
            disabled={!isLoggedIn}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all shadow-sm ${
              isLoggedIn
                ? "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/60 active:scale-95 cursor-pointer"
                : "bg-slate-100/40 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 border-slate-200/40 dark:border-slate-800/40 cursor-not-allowed opacity-50"
            }`}
            title={isLoggedIn ? "פתח היסטוריית שיחות" : "יש להתחבר למערכת לצפייה בהיסטוריה"}
          >
            <MessageSquare size={16} className={isLoggedIn ? "text-blue-500 dark:text-blue-400" : "text-slate-400"} />
            <span className="hidden xs:inline">שיחות</span>
            {isLoggedIn && sessionsCount > 0 && (
              <span className="bg-blue-100 dark:bg-blue-600/30 text-blue-600 dark:text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {sessionsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-all shadow-sm active:scale-95 cursor-pointer"
            title={theme === "dark" ? "עבור לתבנית בהירה" : "עבור לתבנית כהה"}
          >
            {theme === "dark" ? (
              <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={17} className="text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Settings Button - Wrench icon only, clickable ONLY for admin */}
          <button
            onClick={isAdmin ? onOpenUserManagement : undefined}
            disabled={!isAdmin}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all shadow-sm ${
              isAdmin
                ? "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700/60 active:scale-95 cursor-pointer"
                : "bg-slate-100/40 dark:bg-slate-800/30 text-slate-400/40 dark:text-slate-600/40 border-slate-200/40 dark:border-slate-800/40 cursor-not-allowed opacity-30"
            }`}
            title={
              isAdmin
                ? "ניהול משתמשים והרשאות (מנהל מערכת)"
                : "ניהול משתמשים (זמין למנהל מערכת בלבד)"
            }
          >
            <Wrench size={17} />
          </button>

          {/* Login / User Status Button - Icon only */}
          <button
            onClick={onOpenLogin}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition-all shadow-sm active:scale-95 cursor-pointer"
            title={
              isLoggedIn
                ? `מחובר: ${currentUser.username} (${isAdmin ? "מנהל מערכת" : "משתמש"}) - לחץ לפרטים`
                : "התחברות למערכת"
            }
          >
            {isLoggedIn ? (
              <UserCheck size={17} className="text-emerald-500 dark:text-emerald-400" />
            ) : (
              <LogIn size={17} className="text-blue-600 dark:text-blue-400" />
            )}
          </button>
        </div>

        {/* Left side in RTL: Single Agents Switcher Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={isLoggedIn ? onOpenAgents : onOpenLogin}
            disabled={!isLoggedIn}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md ${
              isLoggedIn
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white active:scale-95 cursor-pointer"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
            }`}
            title={isLoggedIn ? "פתח ניהול והחלפת סוכנים" : "יש להתחבר כדי לבחור סוכנים"}
          >
            <Users size={16} />
            <span>סוכנים</span>
          </button>
        </div>
      </div>
    </header>
  );
};
