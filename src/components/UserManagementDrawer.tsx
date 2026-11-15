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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-[#FAFAFA] dark:bg-[#191919] border-l border-[#E0E0E0] dark:border-[#353535] shadow-2xl h-full flex flex-col z-10 text-right">
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b border-[#E0E0E0] dark:border-[#353535] flex items-center justify-between"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top, 1rem))" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#676767] hover:text-[#191919] dark:text-[#A4A4A4] dark:hover:text-[#FAFAFA] hover:bg-[#F1F1F1] dark:hover:bg-[#242424] transition-colors cursor-pointer"
              title="סגור"
            >
              <X size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#191919] dark:text-[#FAFAFA] flex items-center gap-2 font-sans">
                <Wrench className="text-[#FF91AC]" size={20} />
                <span>ניהול משתמשים והרשאות</span>
              </h2>
              <p className="text-xs text-[#676767] dark:text-[#A4A4A4] mt-0.5 font-sans">
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
              className="bg-[#FFFFFF] dark:bg-[#242424] border border-[#FF91AC]/50 rounded-2xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#353535] pb-2">
                <h3 className="text-sm font-semibold text-[#191919] dark:text-[#FAFAFA]">
                  עריכת משתמש: {editingUser.username}
                </h3>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-[#676767] hover:text-[#191919] dark:hover:text-[#FAFAFA]"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="p-2 bg-[#FFE8EC] dark:bg-[#5A0026] border border-[#FF91AC]/40 text-[#87003C] dark:text-[#FFBCCA] text-xs rounded-xl flex items-center gap-1.5 font-sans">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  שם משתמש / כינוי
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="למשל: תומר זיסו"
                    className="w-full bg-[#F1F1F1] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] text-xs p-2.5 pr-8 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#FF91AC] focus:outline-none"
                  />
                  <UserIcon
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#868686]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  כתובת מייל (Email)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#F1F1F1] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] text-xs p-2.5 pr-8 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#FF91AC] focus:outline-none font-mono"
                    dir="ltr"
                  />
                  <Mail
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#868686]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  תפקיד והרשאה (Role)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                      role === "user"
                        ? "bg-[#191919] dark:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#191919] border-transparent shadow-sm"
                        : "bg-[#F1F1F1] dark:bg-[#191919] text-[#676767] dark:text-[#A4A4A4] border-[#E0E0E0] dark:border-[#353535] hover:bg-[#EAEAEA]"
                    }`}
                  >
                    <UserIcon size={14} />
                    <span>משתמש רגיל</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                      role === "admin"
                        ? "bg-[#FF91AC] text-[#191919] border-[#FFBCCA] shadow-n8n-pink"
                        : "bg-[#F1F1F1] dark:bg-[#191919] text-[#676767] dark:text-[#A4A4A4] border-[#E0E0E0] dark:border-[#353535] hover:bg-[#EAEAEA]"
                    }`}
                  >
                    <Shield size={14} />
                    <span>מנהל מערכת</span>
                  </button>
                </div>
              </div>

              {/* Allowed Agents */}
              {role === "user" && (
                <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#353535] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#191919] dark:text-[#FAFAFA]">
                      סוכנים מורשים לגישה
                    </label>
                    <div className="flex gap-2 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={selectAllAgents}
                        className="text-[#87003C] dark:text-[#FF91AC] hover:underline cursor-pointer"
                      >
                        בחר הכל
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={clearAllAgents}
                        className="text-[#868686] hover:underline cursor-pointer"
                      >
                        נקה הכל
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-1.5 bg-[#F1F1F1] dark:bg-[#191919] rounded-xl border border-[#E0E0E0] dark:border-[#353535]">
                    {agents.map((agent) => {
                      const isChecked = allowedAgentIds.includes(agent.id);
                      return (
                        <div
                          key={agent.id}
                          onClick={() => toggleAgent(agent.id)}
                          className="flex items-center gap-2 p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer select-none text-xs"
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-[#FF91AC]" />
                          ) : (
                            <Square size={16} className="text-[#868686]" />
                          )}
                          <div className="flex items-center gap-1.5">
                            <DynamicLucideIcon
                              name={agent.avatarIcon || "bot"}
                              size={14}
                              className="text-[#676767]"
                            />
                            <span className="font-medium text-[#191919] dark:text-[#FAFAFA]">
                              {agent.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E0E0E0] dark:border-[#353535]">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3.5 py-1.5 text-xs text-[#676767] dark:text-[#A4A4A4] hover:text-[#191919] dark:hover:text-[#FAFAFA] rounded-xl hover:bg-[#F1F1F1] cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#FF91AC] hover:bg-[#FFD0D9] text-[#191919] font-bold rounded-2xl shadow-n8n-pink active:scale-95 cursor-pointer"
                >
                  שמור שינויים
                </button>
              </div>
            </form>
          )}

          {/* User List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#676767] dark:text-[#A4A4A4] px-1 font-mono uppercase tracking-wider">
              <span>משתמשים רשומים ({users.length})</span>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#868686]">
                אין משתמשים רשומים כרגע. משתמשים יופיעו כאן אוטומטית לאחר התחברות
                ראשונה.
              </div>
            ) : (
              users.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className="p-3 bg-[#FFFFFF] dark:bg-[#242424] rounded-2xl border border-[#E0E0E0] dark:border-[#353535] shadow-sm flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                          user.role === "admin"
                            ? "bg-[#FF91AC] text-[#191919] border border-[#FFBCCA]"
                            : "bg-[#F1F1F1] dark:bg-[#191919] text-[#676767] dark:text-[#A4A4A4] border border-[#E0E0E0] dark:border-[#353535]"
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
                          <span className="font-bold text-xs sm:text-sm text-[#191919] dark:text-[#FAFAFA] truncate">
                            {user.username}
                          </span>
                          {isCurrent && (
                            <span className="n8n-capsule text-[8px] bg-[#F1F1F1] dark:bg-[#191919] text-[#676767]">
                              אתה
                            </span>
                          )}
                        </div>
                        {user.email && (
                          <p
                            className="text-[11px] text-[#868686] dark:text-[#676767] truncate font-mono"
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
                        className="p-1.5 text-[#868686] hover:text-[#FF91AC] rounded-lg transition-colors cursor-pointer"
                        title="ערוך הרשאות וסוכנים"
                      >
                        <Edit2 size={15} />
                      </button>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1.5 text-[#868686] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
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
