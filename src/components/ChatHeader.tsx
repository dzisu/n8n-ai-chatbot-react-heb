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
import { DynamicLucideIcon } from "./DynamicLucideIcon";
import { N8NLogo } from "./N8NLogo";

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
    <header
      className="bg-[#FAFAFA]/90 dark:bg-[#191919]/90 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#353535] px-3 sm:px-6 py-2.5 sm:py-3 flex-shrink-0 z-30 transition-colors duration-200 sticky top-0"
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
                ? "bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] text-[#191919] dark:text-[#FAFAFA] border-[#E0E0E0] dark:border-[#353535] active:scale-95 cursor-pointer"
                : "bg-[#F1F1F1]/50 dark:bg-[#242424]/50 text-[#868686] dark:text-[#676767] border-[#E0E0E0]/50 dark:border-[#353535]/50 cursor-not-allowed opacity-50"
            }`}
            title={isLoggedIn ? "פתח היסטוריית שיחות" : "יש להתחבר למערכת לצפייה בהיסטוריה"}
          >
            <MessageSquare
              size={16}
              className={isLoggedIn ? "text-[#87003C] dark:text-[#FF91AC]" : "text-[#868686]"}
            />
            <span className="hidden xs:inline font-sans">שיחות</span>
            {isLoggedIn && sessionsCount > 0 && (
              <span className="bg-[#FF91AC] text-[#191919] text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none">
                {sessionsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] text-[#191919] dark:text-[#FAFAFA] border border-[#E0E0E0] dark:border-[#353535] transition-all shadow-sm active:scale-95 cursor-pointer"
            title={theme === "dark" ? "עבור לתבנית בהירה" : "עבור לתבנית כהה"}
          >
            {theme === "dark" ? (
              <Sun size={17} className="text-[#FF91AC] hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={17} className="text-[#87003C] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Settings Button - Wrench icon only, clickable ONLY for admin */}
          <button
            onClick={isAdmin ? onOpenUserManagement : undefined}
            disabled={!isAdmin}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all shadow-sm ${
              isAdmin
                ? "bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] text-[#191919] dark:text-[#FAFAFA] hover:text-[#87003C] dark:hover:text-[#FF91AC] border-[#E0E0E0] dark:border-[#353535] active:scale-95 cursor-pointer"
                : "bg-[#F1F1F1]/40 dark:bg-[#242424]/40 text-[#A4A4A4] dark:text-[#676767] border-[#E0E0E0]/40 dark:border-[#353535]/40 cursor-not-allowed opacity-30"
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
            className="p-1.5 sm:p-2 rounded-xl bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] text-[#191919] dark:text-[#FAFAFA] border border-[#E0E0E0] dark:border-[#353535] transition-all shadow-sm active:scale-95 cursor-pointer"
            title={
              isLoggedIn
                ? `מחובר: ${currentUser.username} (${isAdmin ? "מנהל מערכת" : "משתמש"}) - לחץ לפרטים`
                : "התחברות למערכת"
            }
          >
            {isLoggedIn ? (
              <UserCheck size={17} className="text-[#FF91AC]" />
            ) : (
              <LogIn size={17} className="text-[#87003C] dark:text-[#FF91AC]" />
            )}
          </button>
        </div>

        {/* Center: Official n8n Symbol for brand recognition */}
        <div className="hidden md:flex items-center justify-center">
          <N8NLogo size={24} showText={false} />
        </div>

        {/* Left side in RTL: Single Agents Switcher Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={isLoggedIn ? onOpenAgents : onOpenLogin}
            className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] border border-[#E0E0E0] dark:border-[#353535] text-[#191919] dark:text-[#FAFAFA] shadow-sm transition-all active:scale-95 cursor-pointer"
            title="בחר סוכן או נהל סוכנים"
          >
            {activeAgent ? (
              <>
                <div
                  className="w-6 h-6 rounded-lg bg-[#FF91AC] text-[#191919] flex items-center justify-center shrink-0 font-bold text-xs"
                >
                  <DynamicLucideIcon name={activeAgent.avatarIcon} size={14} />
                </div>
                <div className="text-right leading-tight min-w-0">
                  <div className="font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]">
                    {activeAgent.name}
                  </div>
                  <div className="text-[10px] text-[#676767] dark:text-[#A4A4A4] truncate max-w-[120px] sm:max-w-[180px]">
                    {activeAgent.role}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Users size={16} className="text-[#FF91AC]" />
                <span className="text-xs sm:text-sm font-medium">סוכנים</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
