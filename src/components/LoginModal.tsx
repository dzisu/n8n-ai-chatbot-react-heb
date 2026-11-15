import React, { useState } from "react";
import { X, LogIn, Lock, User as UserIcon, Shield, AlertCircle, LogOut } from "lucide-react";
import { User } from "../types/chat";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const found = users.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === password
    );

    if (!found) {
      setError("שם משתמש או סיסמה שגויים. אנא נסה שוב.");
      return;
    }

    onLoginSuccess(found);
    setUsername("");
    setPassword("");
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="סגור"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg mb-3">
            <Lock size={22} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {currentUser ? "פרטי משתמש מחובר" : "התחברות למערכת"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentUser
              ? "אתה מחובר כעת למערכת"
              : "הזן שם משתמש וסיסמה כדי לקבל גישה לסוכנים"}
          </p>
        </div>

        {/* Current User Logged In State */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                {currentUser.role === "admin" ? <Shield size={20} /> : <UserIcon size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white text-sm">
                    {currentUser.username}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      currentUser.role === "admin"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/30"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {currentUser.role === "admin" ? "מנהל מערכת (Admin)" : "משתמש"}
                  </span>
                </div>
                {currentUser.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
              >
                <LogOut size={16} />
                <span>התנתק מהמערכת</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-all"
              >
                סגור
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                שם משתמש
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="למשל: admin או tomer"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
                <UserIcon
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן סיסמה..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                />
                <Lock
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 mt-2"
            >
              <LogIn size={16} />
              <span>התחבר למערכת</span>
            </button>

            <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                כניסת מנהל ברירת מחדל: <strong className="text-slate-600 dark:text-slate-300 font-mono">admin</strong> / סיסמה: <strong className="text-slate-600 dark:text-slate-300 font-mono">admin</strong>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
