import React, { useState } from "react";
import {
  X,
  Wrench,
  Trash2,
  Edit2,
  Shield,
  User as UserIcon,
  Mail,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import { User, Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface UserManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  agents: Agent[];
  currentUser: User | null;
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementDrawer: React.FC<UserManagementDrawerProps> = ({
  isOpen,
  onClose,
  users,
  agents,
  currentUser,
  onSaveUser,
  onDeleteUser,
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [allowedAgentIds, setAllowedAgentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const startEdit = (user: User) => {
    setUsername(user.username);
    setEmail(user.email || "");
    setRole(user.role);
    setAllowedAgentIds(user.allowedAgentIds || []);
    setFormError(null);
    setEditingUser(user);
  };

  const cancelForm = () => {
    setEditingUser(null);
    setFormError(null);
  };

  const toggleAgent = (agentId: string) => {
    setAllowedAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const selectAllAgents = () => {
    setAllowedAgentIds(agents.map((a) => a.id));
  };

  const clearAllAgents = () => {
    setAllowedAgentIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setFormError("נא להזין שם משתמש");
      return;
    }

    if (!editingUser) return;

    const updatedUser: User = {
      ...editingUser,
      username: cleanUsername,
      email: email.trim(),
      role,
      allowedAgentIds: role === "admin" ? [] : allowedAgentIds,
    };

    onSaveUser(updatedUser);
    cancelForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-700/60 shadow-2xl h-full flex flex-col z-10 text-right">
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top, 1rem))" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="סגור"
            >
              <X size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Wrench className="text-blue-500 dark:text-blue-400" size={20} />
                ניהול משתמשים והרשאות
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ניהול תפקידים וסוכנים מורשים עבור משתמשי Firebase
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Edit Form */}
          {editingUser && (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-50 dark:bg-slate-800/90 border border-blue-400/50 dark:border-blue-500/40 rounded-xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  עריכת משתמש: {editingUser.username}
                </h3>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  שם משתמש / כינוי
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="למשל: תומר זיסו"
                    className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <UserIcon
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  כתובת מייל (Email)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                  <Mail
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  תפקיד והרשאה (Role)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 font-medium transition-all ${
                      role === "user"
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <UserIcon size={14} />
                    <span>משתמש רגיל</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 font-medium transition-all ${
                      role === "admin"
                        ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                        : "bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Shield size={14} />
                    <span>מנהל מערכת</span>
                  </button>
                </div>
              </div>

              {/* Allowed Agents */}
              {role === "user" && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      סוכנים מורשים לגישה
                    </label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={selectAllAgents}
                        className="text-blue-500 hover:underline"
                      >
                        בחר הכל
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={clearAllAgents}
                        className="text-slate-400 hover:underline"
                      >
                        נקה הכל
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-1 bg-white dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-600">
                    {agents.map((agent) => {
                      const isChecked = allowedAgentIds.includes(agent.id);
                      return (
                        <div
                          key={agent.id}
                          onClick={() => toggleAgent(agent.id)}
                          className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600/50 rounded cursor-pointer select-none text-xs"
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-blue-500" />
                          ) : (
                            <Square size={16} className="text-slate-400" />
                          )}
                          <div className="flex items-center gap-1.5">
                            <DynamicLucideIcon
                              name={agent.avatarIcon || "bot"}
                              size={14}
                              className="text-slate-500"
                            />
                            <span className="font-medium text-slate-800 dark:text-white">
                              {agent.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 shadow-md active:scale-95"
                >
                  שמור שינויים
                </button>
              </div>
            </form>
          )}

          {/* User List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>משתמשים רשומים ({users.length})</span>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                אין משתמשים רשומים כרגע. משתמשים יופיעו כאן אוטומטית לאחר התחברות
                ראשונה.
              </div>
            ) : (
              users.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                          user.role === "admin"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield size={18} />
                        ) : (
                          <UserIcon size={18} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                            {user.username}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded">
                              (אתה)
                            </span>
                          )}
                        </div>
                        {user.email && (
                          <p
                            className="text-[11px] text-slate-400 truncate font-mono"
                            dir="ltr"
                          >
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="ערוך הרשאות וסוכנים"
                      >
                        <Edit2 size={15} />
                      </button>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="מחק משתמש"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
