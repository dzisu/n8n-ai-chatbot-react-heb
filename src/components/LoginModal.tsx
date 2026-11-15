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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[#FFFFFF] dark:bg-[#191919] border border-[#E0E0E0] dark:border-[#353535] rounded-3xl shadow-2xl p-5 sm:p-6 z-10 text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-xl text-[#676767] hover:text-[#191919] dark:hover:text-[#FAFAFA] hover:bg-[#F1F1F1] dark:hover:bg-[#242424] transition-colors cursor-pointer"
          title="סגור"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF91AC] text-[#191919] flex items-center justify-center shadow-n8n-pink mb-3 font-bold border border-[#FFBCCA]">
            <Lock size={22} />
          </div>
          <h2 className="text-lg font-bold text-[#191919] dark:text-[#FAFAFA] font-sans">
            {currentUser
              ? "פרטי משתמש מחובר"
              : isRegisterMode
              ? "יצירת חשבון מאובטח"
              : "התחברות למערכת"}
          </h2>
          <p className="text-xs text-[#676767] dark:text-[#A4A4A4] mt-1 font-sans">
            {currentUser
              ? "מחובר באמצעות Firebase Authentication"
              : isRegisterMode
              ? "הרשם עם כתובת האימייל שלך לגישה מאובטחת"
              : "התחבר באמצעות אימייל וסיסמה"}
          </p>
        </div>

        {/* Current User Logged In State */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F1F1F1] dark:bg-[#242424] rounded-2xl border border-[#E0E0E0] dark:border-[#353535] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE8EC] dark:bg-[#5A0026] text-[#87003C] dark:text-[#FFBCCA] flex items-center justify-center font-bold">
                {currentUser.role === "admin" ? (
                  <Shield size={20} />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#191919] dark:text-[#FAFAFA] text-sm truncate">
                    {currentUser.username}
                  </span>
                  <span
                    className={`n8n-capsule text-[9px] ${
                      currentUser.role === "admin"
                        ? "bg-[#FF91AC] text-[#191919] font-bold"
                        : "bg-[#EAEAEA] text-[#191919] dark:bg-[#353535] dark:text-[#FAFAFA]"
                    }`}
                  >
                    {currentUser.role === "admin"
                      ? "ADMIN"
                      : "USER"}
                  </span>
                </div>
                {currentUser.email && (
                  <p
                    className="text-xs text-[#676767] dark:text-[#A4A4A4] truncate mt-0.5 font-mono"
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
                className="flex-1 bg-[#FFE8EC] hover:bg-[#FFD0D9] dark:bg-[#44001B] dark:hover:bg-[#5A0026] text-[#87003C] dark:text-[#FFBCCA] border border-[#FF91AC]/30 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <LogOut size={16} />
                <span>התנתק מהמערכת</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-[#E0E0E0] dark:border-[#353535] text-[#191919] dark:text-[#FAFAFA] hover:bg-[#F1F1F1] dark:hover:bg-[#242424] text-xs sm:text-sm font-medium transition-all cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 bg-[#FFE8EC] dark:bg-[#5A0026] border border-[#FF91AC]/40 rounded-xl flex items-center gap-2 text-[#87003C] dark:text-[#FFBCCA] text-xs font-sans">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  שם מלא / כינוי
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="למשל: תומר זיסו"
                    className="w-full bg-[#F1F1F1] dark:bg-[#242424] text-[#191919] dark:text-[#FAFAFA] text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#FF91AC] focus:outline-none focus:ring-1 focus:ring-[#FF91AC]"
                  />
                  <UserIcon
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#868686] pointer-events-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                כתובת אימייל (Email)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F1F1F1] dark:bg-[#242424] text-[#191919] dark:text-[#FAFAFA] text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#FF91AC] focus:outline-none focus:ring-1 focus:ring-[#FF91AC] font-mono"
                  dir="ltr"
                  autoFocus
                />
                <Mail
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#868686] pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="לפחות 6 תווים..."
                  className="w-full bg-[#F1F1F1] dark:bg-[#242424] text-[#191919] dark:text-[#FAFAFA] text-xs sm:text-sm p-2.5 pr-9 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#FF91AC] focus:outline-none focus:ring-1 focus:ring-[#FF91AC] font-mono"
                  dir="ltr"
                />
                <Lock
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#868686] pointer-events-none"
                />
              </div>
            </div>

            {/* Official n8n Pink Submit Button with Black Text */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF91AC] hover:bg-[#FFD0D9] active:bg-[#FFBCCA] text-[#191919] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-n8n-pink active:scale-95 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#191919]" />
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

            <div className="pt-3 text-center border-t border-[#E0E0E0] dark:border-[#353535]">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsRegisterMode(!isRegisterMode);
                }}
                className="text-xs text-[#87003C] dark:text-[#FF91AC] hover:underline font-bold cursor-pointer"
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
