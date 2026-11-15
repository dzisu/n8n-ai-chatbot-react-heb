import React, { useState } from "react";
import {
  X,
  Wrench,
  UserPlus,
  Trash2,
  Edit2,
  Shield,
  User as UserIcon,
  Mail,
  Key,
  CheckSquare,
  Square,
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
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [allowedAgentIds, setAllowedAgentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const startCreate = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setRole("user");
    // By default, select all agents for convenience or empty
    setAllowedAgentIds(agents.map((a) => a.id));
    setFormError(null);
    setIsCreating(true);
    setEditingUser(null);
  };

  const startEdit = (user: User) => {
    setUsername(user.username);
    setPassword(user.password);
    setEmail(user.email || "");
    setRole(user.role);
    setAllowedAgentIds(user.allowedAgentIds || []);
    setFormError(null);
    setEditingUser(user);
    setIsCreating(false);
  };

  const cancelForm = () => {
    setIsCreating(false);
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

    if (!password.trim()) {
      setFormError("נא להזין סיסמה");
      return;
    }

    // Check username uniqueness
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === cleanUsername.toLowerCase() &&
        u.id !== editingUser?.id
    );

    if (exists) {
      setFormError("שם משתמש זה כבר תפוס, בחר שם אחר");
      return;
    }

    const updatedUser: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      username: cleanUsername,
      password: password.trim(),
      email: email.trim(),
      role,
      allowedAgentIds: role === "admin" ? [] : allowedAgentIds,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
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
                הגדרת משתמשים והקצאת סוכנים מורשים
              </p>
            </div>
          </div>

          {!isCreating && !editingUser && (
            <button
              onClick={startCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <UserPlus size={16} />
              <span>משתמש חדש</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Create or Edit Form */}
          {(isCreating || editingUser) && (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-50 dark:bg-slate-800/90 border border-blue-400/50 dark:border-blue-500/40 rounded-xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {editingUser ? `עריכת משתמש: ${editingUser.username}` : "הגדרת משתמש חדש"}
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
                <div className="p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  שם משתמש (Username) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="למשל: tomer או esthi"
                    className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <UserIcon size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  סיסמה (Password) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הזן סיסמה..."
                    className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                  />
                  <Key size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                    placeholder="user@example.com"
                    className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                  <Mail size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  תפקיד והרשאה
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      role === "user"
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    <UserIcon size={14} />
                    <span>משתמש רגיל</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      role === "admin"
                        ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                        : "bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    <Shield size={14} />
                    <span>מנהל (Admin)</span>
                  </button>
                </div>
              </div>

              {/* Allowed Agents - Only relevant for standard user */}
              {role === "user" ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      סוכנים מורשים למשתמש זה
                    </label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={selectAllAgents}
                        className="text-blue-500 hover:underline"
                      >
                        בחר הכל
                      </button>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={clearAllAgents}
                        className="text-slate-400 hover:underline"
                      >
                        נקה הכל
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {agents.map((agent) => {
                      const isAllowed = allowedAgentIds.includes(agent.id);
                      return (
                        <div
                          key={agent.id}
                          onClick={() => toggleAgent(agent.id)}
                          className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            isAllowed
                              ? "bg-blue-50/80 dark:bg-blue-900/30 border-blue-400/60 text-slate-900 dark:text-white"
                              : "bg-white dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/60 text-slate-500 dark:text-slate-400 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${
                                agent.color || "from-blue-600 to-indigo-600"
                              } flex items-center justify-center text-white shrink-0`}
                            >
                              <DynamicLucideIcon name={agent.avatarIcon} size={15} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{agent.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{agent.role}</p>
                            </div>
                          </div>

                          <div className="text-blue-600 dark:text-blue-400">
                            {isAllowed ? (
                              <CheckSquare size={17} />
                            ) : (
                              <Square size={17} className="text-slate-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 rounded-lg text-[11px] text-amber-700 dark:text-amber-300">
                  מנהל מערכת (Admin) מורשה לכל הסוכנים באופן אוטומטי.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md active:scale-95"
                >
                  שמור משתמש
                </button>
              </div>
            </form>
          )}

          {/* List of Users */}
          <div className="space-y-2.5">
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const isCurrentUser = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl border bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/50 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                          isAdmin
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : "bg-gradient-to-br from-blue-600 to-indigo-600"
                        }`}
                      >
                        {isAdmin ? <Shield size={18} /> : <UserIcon size={18} />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {user.username}
                          </h4>
                          {isCurrentUser && (
                            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-medium border border-emerald-500/30">
                              (אתה)
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-medium ${
                              isAdmin
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/30"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {isAdmin ? "Admin" : "משתמש"}
                          </span>
                        </div>

                        {user.email && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" dir="ltr">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                        title="ערוך משתמש והרשאות"
                      >
                        <Edit2 size={14} />
                      </button>
                      {/* Prevent deleting default admin or current user */}
                      {user.username !== "admin" && !isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`האם למחוק את המשתמש ${user.username}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                          title="מחק משתמש"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Allowed Agents Badges */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/40">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      סוכנים מורשים:
                    </span>
                    {isAdmin ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        מורשה לכל הסוכנים במערכת
                      </span>
                    ) : (user.allowedAgentIds || []).length === 0 ? (
                      <span className="text-[11px] text-amber-500">
                        לא הוגדרו סוכנים מורשים (אין גישה)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.allowedAgentIds.map((agentId) => {
                          const ag = agents.find((a) => a.id === agentId);
                          if (!ag) return null;
                          return (
                            <span
                              key={agentId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                            >
                              <DynamicLucideIcon name={ag.avatarIcon} size={10} />
                              <span>{ag.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/60 text-center"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
        >
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            הגדרות המשתמשים נשמרות מקומית ומאפשרות כניסה מותאמת אישית
          </p>
        </div>
      </div>
    </div>
  );
};
