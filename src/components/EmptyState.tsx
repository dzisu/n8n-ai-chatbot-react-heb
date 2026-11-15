import React from "react";
import { Lock, LogIn, ShieldAlert } from "lucide-react";
import { Agent, User } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface EmptyStateProps {
  activeAgent?: Agent;
  currentUser?: User | null;
  onOpenLogin?: () => void;
  onSuggestionClick?: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  activeAgent,
  currentUser,
  onOpenLogin,
}) => {
  // If not logged in
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-md mx-auto my-auto animate-fade-in">
        {/* Capsule pill */}
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D6D6D6] dark:border-[#353535] text-[#676767] dark:text-[#A4A4A4] font-mono text-[10px] uppercase tracking-wider font-semibold">
          <Lock size={12} />
          <span>AUTHENTICATION REQUIRED</span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] dark:bg-[#242424] text-[#191919] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 aspect-square shadow-sm mb-4 border border-[#E0E0E0] dark:border-[#353535]">
          <Lock size={28} />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-[#191919] dark:text-[#FAFAFA] mb-2 font-sans">
          ברוכים הבאים למערכת הסוכנים
        </h3>

        <p className="text-xs sm:text-sm text-[#676767] dark:text-[#A4A4A4] mb-6 leading-relaxed">
          המערכת מאובטחת. כדי לגשת לסוכנים ולהתחיל לשוחח, יש להתחבר עם שם משתמש וסיסמה.
        </p>

        {onOpenLogin && (
          <button
            onClick={onOpenLogin}
            className="bg-[#191919] hover:bg-[#333333] active:scale-95 text-[#FAFAFA] dark:bg-[#FAFAFA] dark:hover:bg-[#EAEAEA] dark:text-[#191919] font-bold py-2.5 px-6 rounded-2xl text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <LogIn size={16} />
            <span>התחברות למערכת</span>
          </button>
        )}
      </div>
    );
  }

  // If logged in but no active agent (e.g. no permitted agents)
  if (!activeAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-md mx-auto my-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#F1F1F1] dark:bg-[#242424] border border-[#E0E0E0] dark:border-[#353535] text-[#191919] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 aspect-square shadow-sm mb-4 p-4">
          <ShieldAlert size={32} />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#191919] dark:text-[#FAFAFA] mb-1.5 font-sans">
          אין סוכנים מורשים
        </h3>

        <p className="text-xs sm:text-sm text-[#676767] dark:text-[#A4A4A4] mb-2 leading-relaxed">
          למשתמש זה ({currentUser.username}) לא הוגדרו עדיין סוכנים מורשים.
        </p>
        <p className="text-xs text-[#868686] dark:text-[#676767]">
          פנה למנהל המערכת (Admin) כדי שיקצה עבורך סוכנים.
        </p>
      </div>
    );
  }

  // Normal Empty State for authorized agent
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-lg mx-auto my-auto">
      <div
        className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-[#FFFFFF] dark:bg-[#242424] text-[#191919] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 aspect-square shadow-sm mb-4 border border-[#E0E0E0] dark:border-[#353535]"
        style={{
          width: "5rem",
          height: "5rem",
          minWidth: "5rem",
          minHeight: "5rem",
          aspectRatio: "1 / 1",
        }}
      >
        <DynamicLucideIcon name={activeAgent?.avatarIcon} size={36} />
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
        שלום, אני {activeAgent?.name || "הסוכן שלך"}
      </h3>

      <div className="mb-3">
        <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#F1F1F1] dark:bg-[#242424] text-[#676767] dark:text-[#A4A4A4] border border-[#E0E0E0] dark:border-[#353535]">
          {activeAgent?.role || "סוכן n8n"}
        </span>
      </div>

      {activeAgent?.description && (
        <p className="text-xs sm:text-sm text-[#676767] dark:text-[#A4A4A4] mb-6 leading-relaxed max-w-sm">
          {activeAgent.description}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-[#868686] dark:text-[#676767] font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>הקלד הודעה או גרור קובץ למטה כדי להתחיל</span>
      </div>
    </div>
  );
};
