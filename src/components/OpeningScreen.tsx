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
    <div className="flex-1 flex flex-col h-full w-full min-w-0 relative select-none bg-[#FAFAFA] dark:bg-[#191919] n8n-dot-grid">
      {/* Top minimal bar */}
      <header
        className="w-full px-4 sm:px-8 py-3 flex items-center justify-between z-20 border-b border-[#E0E0E0] dark:border-[#353535] bg-[#FAFAFA]/80 dark:bg-[#191919]/80 backdrop-blur-md"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top, 0.75rem))",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[#F1F1F1] dark:bg-[#242424] hover:bg-[#F8F8F8] dark:hover:bg-[#353535] text-[#191919] dark:text-[#FAFAFA] border border-[#E0E0E0] dark:border-[#353535] shadow-sm transition-all active:scale-95 cursor-pointer"
            title={theme === "dark" ? "עבור לתבנית בהירה" : "עבור לתבנית כהה"}
          >
            {theme === "dark" ? (
              <Sun size={17} className="hover:rotate-45 transition-transform text-[#FAFAFA]" />
            ) : (
              <Moon size={17} className="hover:-rotate-12 transition-transform text-[#191919]" />
            )}
          </button>
        </div>

        {/* Quick login button in header */}
        <button
          onClick={onOpenLogin}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] hover:bg-[#353535] dark:hover:bg-[#EAEAEA] text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <LogIn size={14} />
          <span>התחברות</span>
        </button>
      </header>

      {/* Center content - Official n8n Logo, Capsule & Login */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center my-auto z-10">
        <div className="max-w-md mx-auto flex flex-col items-center">
          {/* n8n Capsule Device (ALL CAPS mono) - Restrained, clean gray outline like nod.n8n.io */}
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D6D6D6] dark:border-[#353535] text-[#676767] dark:text-[#A4A4A4] font-mono text-[11px] font-medium tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#676767] dark:bg-[#A4A4A4]" />
            <span>N8N AI AGENTS PLATFORM</span>
          </div>

          {/* Official n8n Logo Container */}
          <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#242424] border border-[#E0E0E0] dark:border-[#353535] shadow-sm flex items-center justify-center">
            <N8NLogo size={36} showText={true} />
          </div>

          {/* Subtitle / System Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191919] dark:text-[#FAFAFA] mb-2 font-sans">
            מערכת סוכנים חכמים
          </h1>

          <p className="text-xs sm:text-sm text-[#676767] dark:text-[#A4A4A4] mb-8 max-w-xs leading-relaxed">
            סביבת עבודה מאובטחת בזמן אמת לשיחה, תפעול ואוטומציה מבוססת n8n
          </p>

          {/* Single touch of pink: Primary CTA button, identical to nod.n8n.io download button */}
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto min-w-[220px] bg-[#FF91AC] hover:bg-[#ff7a9b] active:scale-95 text-[#191919] py-3.5 px-7 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
          >
            <LogIn size={18} className="text-[#191919]" />
            <span>כניסה למערכת</span>
          </button>
        </div>
      </div>

      {/* Footer minimal info */}
      <footer
        className="w-full py-4 text-center text-[11px] text-[#868686] dark:text-[#676767] z-10 border-t border-[#E0E0E0] dark:border-[#353535] bg-[#FAFAFA]/60 dark:bg-[#191919]/60 backdrop-blur-sm"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
        }}
      >
        <span className="font-mono text-[10px] tracking-wider uppercase">n8n Workflow Automation & AI Infrastructure</span>
      </footer>
    </div>
  );
};
