import React, { useState } from "react";
import {
  X,
  LogIn,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  AlertCircle,
  LogOut,
  UserPlus,
  Loader2,
} from "lucide-react";
import { User } from "../types/chat";
import { auth } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!auth) {
      setError("שירות Firebase Auth אינו מוגדר או אינו זמין.");
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("נא להזין כתובת אימייל וסיסמה.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
        if (displayName.trim()) {
          await updateProfile(userCred.user, {
            displayName: displayName.trim(),
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }

      setEmail("");
      setPassword("");
      setDisplayName("");
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      const code = err?.code || "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("כתובת אימייל או סיסמה שגויות.");
      } else if (code === "auth/email-already-in-use") {
        setError("כתובת אימייל זו כבר רשומה במערכת. נסה להתחבר.");
      } else if (code === "auth/weak-password") {
        setError("הסיסמה קצרה מדי (נדרשים לפחות 6 תווים).");
      } else if (code === "auth/invalid-email") {
        setError("כתובת אימייל אינה תקינה.");
      } else if (code === "auth/too-many-requests") {
        setError("בוצעו ניסיונות התחברות רבים מדי. נסה שוב מאוחר יותר.");
      } else {
        setError("חלה שגיאה בהתחברות למערכת. בדוק את החיבור ונסה שוב.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    }
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
            {currentUser
              ? "פרטי משתמש מחובר"
              : isRegisterMode
              ? "יצירת חשבון מאובטח"
              : "התחברות למערכת"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentUser
              ? "אתה מחובר כעת באמצעות Firebase Auth"
              : isRegisterMode
              ? "הרשם עם כתובת האימייל שלך לגישה מאובטחת"
              : "התחבר באמצעות אימייל וסיסמה"}
          </p>
        </div>

        {/* Current User Logged In State */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                {currentUser.role === "admin" ? (
                  <Shield size={20} />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white text-sm truncate">
                    {currentUser.username}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      currentUser.role === "admin"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/30"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {currentUser.role === "admin"
                      ? "מנהל מערכת (Admin)"
                      : "משתמש"}
                  </span>
                </div>
                {currentUser.email && (
                  <p
                    className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono"
                    dir="ltr"
                  >
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
          /* Login / Register Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  שם מלא / כינוי
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="למשל: תומר זיסו"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                  <UserIcon
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                כתובת אימייל (Email)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none font-mono"
                  dir="ltr"
                  autoFocus
                />
                <Mail
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
                  placeholder="לפחות 6 תווים..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none font-mono"
                  dir="ltr"
                />
                <Lock
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>מעבד בקשה...</span>
                </>
              ) : isRegisterMode ? (
                <>
                  <UserPlus size={16} />
                  <span>צור חשבון והתחבר</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>התחבר למערכת</span>
                </>
              )}
            </button>

            <div className="pt-3 text-center border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsRegisterMode(!isRegisterMode);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {isRegisterMode
                  ? "כבר יש לך חשבון? לחץ כאן להתחברות"
                  : "משתמש חדש? לחץ כאן לפתיחת חשבון"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
