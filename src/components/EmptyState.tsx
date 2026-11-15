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
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 aspect-square text-white shadow-xl mb-4">
          <Lock size={38} />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
          ברוכים הבאים למערכת הסוכנים
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          המערכת מאובטחת. כדי לגשת לסוכנים ולהתחיל לשוחח, יש להתחבר עם שם משתמש וסיסמה.
        </p>

        {onOpenLogin && (
          <button
            onClick={onOpenLogin}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-6 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            <LogIn size={18} />
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
        <div className="w-18 h-18 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 aspect-square shadow-md mb-4 p-4">
          <ShieldAlert size={36} />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1.5">
          אין סוכנים מורשים
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
          למשתמש זה ({currentUser.username}) לא הוגדרו עדיין סוכנים מורשים.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          פנה למנהל המערכת (Admin) כדי שיקצה עבורך סוכנים.
        </p>
      </div>
    );
  }

  // Normal Empty State for authorized agent
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-lg mx-auto my-auto">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${
          activeAgent?.color || "from-blue-600 to-indigo-600"
        } flex items-center justify-center shrink-0 aspect-square text-white shadow-xl mb-4`}
        style={{
          width: "5rem",
          height: "5rem",
          minWidth: "5rem",
          minHeight: "5rem",
          aspectRatio: "1 / 1",
        }}
      >
        <DynamicLucideIcon name={activeAgent?.avatarIcon} size={42} />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1">
        היי! אני {activeAgent?.name || "העוזר שלך"}
      </h3>

      <p className="text-sm text-blue-600 dark:text-blue-300 font-medium mb-2">
        {activeAgent?.role || "סוכן n8n"}
      </p>

      {activeAgent?.description && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed max-w-sm">
          {activeAgent.description}
        </p>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
        הקלד הודעה למטה כדי להתחיל בשיחה
      </p>
    </div>
  );
};
