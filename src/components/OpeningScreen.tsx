import React from "react";
import { LogIn, Sun, Moon } from "lucide-react";
import { N8NLogo } from "./N8NLogo";

interface OpeningScreenProps {
  onOpenLogin: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  onOpenLogin,
  theme,
  onToggleTheme,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 relative select-none">
      {/* Top minimal bar */}
      <header
        className="w-full px-4 sm:px-8 py-3 flex items-center justify-between z-20"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top, 0.75rem))",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all active:scale-95 cursor-pointer"
            title={theme === "dark" ? "עבור לתבנית בהירה" : "עבור לתבנית כהה"}
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={18} className="text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>

        {/* Quick login button in header */}
        <button
          onClick={onOpenLogin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <LogIn size={15} className="text-[#FF6D5A]" />
          <span>התחברות</span>
        </button>
      </header>

      {/* Center content - Solid n8n Logo & Login */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center my-auto z-10 animate-fade-in">
        <div className="max-w-md mx-auto flex flex-col items-center">
          {/* Solid n8n Logo Container */}
          <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <N8NLogo size={42} showText={true} color="#FF6D5A" />
          </div>

          {/* Subtitle / System Title */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-2">
            מערכת סוכנים מבוססת n8n
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
            שיחה מאובטחת בזמן אמת עם סוכנים חכמים
          </p>

          {/* Solid Login Action Button */}
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto min-w-[200px] bg-[#FF6D5A] hover:bg-[#ff5540] active:scale-95 text-white py-3 px-6 rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#FF6D5A]/25 hover:shadow-xl hover:shadow-[#FF6D5A]/35 transition-all cursor-pointer"
          >
            <LogIn size={18} />
            <span>התחברות למערכת</span>
          </button>
        </div>
      </div>

      {/* Footer minimal info */}
      <footer
        className="w-full py-4 text-center text-[11px] text-slate-400 dark:text-slate-600 z-10"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
        }}
      >
        <span>n8n Workflow Automation & AI Agents</span>
      </footer>
    </div>
  );
};
