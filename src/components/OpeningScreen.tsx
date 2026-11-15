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
      {/* Subtle brand ambient pink glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF91AC]/10 dark:bg-[#FF91AC]/5 rounded-full blur-[120px] pointer-events-none -z-0" />

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
              <Sun size={17} className="text-[#FF91AC] hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={17} className="text-[#87003C] hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>

        {/* Quick login button in header */}
        <button
          onClick={onOpenLogin}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] hover:bg-[#353535] dark:hover:bg-[#EAEAEA] text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <LogIn size={14} className="text-[#FF91AC] dark:text-[#87003C]" />
          <span>התחברות</span>
        </button>
      </header>

      {/* Center content - Official n8n Logo, Capsule & Login */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center my-auto z-10">
        <div className="max-w-md mx-auto flex flex-col items-center">
          {/* n8n Capsule Device (ALL CAPS mono) */}
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE8EC] dark:bg-[#5A0026] border border-[#FF91AC]/40 text-[#87003C] dark:text-[#FFBCCA] font-mono text-[11px] font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FF91AC] animate-pulse" />
            <span>N8N AI AGENTS PLATFORM</span>
          </div>

          {/* Official n8n Logo Container */}
          <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#242424] border border-[#E0E0E0] dark:border-[#353535] shadow-xl flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <N8NLogo size={36} showText={true} />
          </div>

          {/* Subtitle / System Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191919] dark:text-[#FAFAFA] mb-2 font-sans">
            מערכת סוכנים חכמים
          </h1>

          <p className="text-xs sm:text-sm text-[#676767] dark:text-[#A4A4A4] mb-8 max-w-xs leading-relaxed">
            סביבת עבודה מאובטחת בזמן אמת לשיחה, תפעול ואוטומציה מבוססת n8n
          </p>

          {/* Primary Action Button - Official n8n Pink #FF91AC with Black Text */}
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto min-w-[220px] bg-[#FF91AC] hover:bg-[#FFD0D9] active:bg-[#FFBCCA] active:scale-95 text-[#191919] py-3.5 px-7 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-n8n-pink hover:shadow-n8n-pink-lg transition-all cursor-pointer"
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
