import React, { useState } from "react";
import {
  Plus,
  X,
  Check,
  Edit2,
  Trash2,
  Globe,
  Settings2,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Agent, User } from "../types/chat";
import {
  DynamicLucideIcon,
  isValidLucideIcon,
  normalizeIconName,
} from "./DynamicLucideIcon";

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  activeAgentId: string;
  currentUser: User | null;
  onSelectAgent: (agentId: string) => void;
  onSaveAgent: (agent: Agent) => void;
  onDeleteAgent: (agentId: string) => void;
  onLogout: () => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  isOpen,
  onClose,
  agents,
  activeAgentId,
  currentUser,
  onSelectAgent,
  onSaveAgent,
  onDeleteAgent,
  onLogout,
}) => {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [avatarIcon, setAvatarIcon] = useState("bot");
  const [color, setColor] = useState("from-blue-600 to-indigo-600");

  if (!isOpen) return null;

  const startCreate = () => {
    setName("");
    setRole("");
    setDescription("");
    setWebhookUrl("");
    setAvatarIcon("bot");
    setColor("from-blue-600 to-indigo-600");
    setIsCreating(true);
    setEditingAgent(null);
  };

  const startEdit = (agent: Agent) => {
    setName(agent.name);
    setRole(agent.role);
    setDescription(agent.description);
    setWebhookUrl(agent.webhookUrl);
    setAvatarIcon(agent.avatarIcon || "bot");
    setColor(agent.color || "from-blue-600 to-indigo-600");
    setEditingAgent(agent);
    setIsCreating(false);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingAgent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAgent: Agent = {
      id: editingAgent ? editingAgent.id : `agent-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || "סוכן AI",
      description: description.trim(),
      webhookUrl: webhookUrl.trim(),
      avatarIcon: avatarIcon.trim() || "bot",
      color,
      isDefault: editingAgent?.isDefault || false,
    };

    onSaveAgent(newAgent);
    cancelForm();
  };

  const colorOptions = [
    { label: "כחול-אינדיגו", value: "from-blue-600 to-indigo-600" },
    { label: "סגול-ורוד", value: "from-purple-600 to-pink-500" },
    { label: "טורקיז-אזמרגד", value: "from-emerald-600 to-teal-500" },
    { label: "כתום-ענבר", value: "from-amber-500 to-orange-600" },
    { label: "אדום-רובי", value: "from-rose-600 to-red-500" },
    { label: "ציאן-כחול", value: "from-cyan-600 to-blue-600" },
  ];

  // Quick suggestions for icons
  const popularIcons = [
    "bot",
    "sparkles",
    "code",
    "film",
    "graduation-cap",
    "brain",
    "camera",
    "music",
    "zap",
    "message-square",
    "smile",
    "heart",
    "shield",
  ];

  const isIconValid = isValidLucideIcon(avatarIcon);

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
                <Settings2 className="text-blue-500 dark:text-blue-400" size={20} />
                ניהול והחלפת סוכנים
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                בחר סוכן לשיחה או הגדר Webhook ייעודי
              </p>
            </div>
          </div>

          {!isCreating && !editingAgent && currentUser?.role === "admin" && (
            <button
              onClick={startCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus size={16} />
              <span>סוכן חדש</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Create or Edit Form */}
          {(isCreating || editingAgent) && (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-50 dark:bg-slate-800/90 border border-blue-400/50 dark:border-blue-500/40 rounded-xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {editingAgent ? `עריכת סוכן: ${editingAgent.name}` : "הגדרת סוכן חדש"}
                </h3>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  שם הסוכן *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: שוקי / יועץ מתמטיקה"
                  className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  תפקיד קצר / כותרת
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="למשל: עוזר אישי, מומחה תוכן, מתכנת"
                  className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  תיאור הסוכן
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="כמה מילים על תחום ההתמחות של הסוכן..."
                  className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>כתובת n8n Webhook URL *</span>
                  <span className="text-[10px] text-blue-500 dark:text-blue-400">ייחודי לסוכן זה</span>
                </label>
                <input
                  type="text"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/..."
                  className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>

              {/* Dynamic Lucide Icon Picker by Name */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    שם אייקון מתוך חבילת Lucide
                  </label>
                  <a
                    href="https://lucide.dev/icons"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:underline flex items-center gap-1"
                    title="פתח את מאגר האייקונים ב-lucide.dev"
                  >
                    <span>קטלוג lucide.dev</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={avatarIcon}
                      onChange={(e) => setAvatarIcon(e.target.value)}
                      placeholder="bot, sparkles, brain, camera, film, code..."
                      className="w-full bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>

                  {/* Live preview badge */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md flex-shrink-0 transition-transform`}
                    title={`תצוגה מקדימה: ${normalizeIconName(avatarIcon)}`}
                  >
                    <DynamicLucideIcon name={avatarIcon} size={20} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className={isIconValid ? "text-emerald-500 font-medium flex items-center gap-1" : "text-amber-500 flex items-center gap-1"}>
                    {isIconValid ? (
                      <>
                        <Check size={12} />
                        אייקון Lucide זוהה: {normalizeIconName(avatarIcon)}
                      </>
                    ) : (
                      "שם חופשי (יוצג Bot אם לא קיים ב-Lucide)"
                    )}
                  </span>
                </div>

                {/* Popular chips */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    הצעות מהירות לבחירה:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {popularIcons.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setAvatarIcon(ic)}
                        className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 border transition-all ${
                          avatarIcon.toLowerCase().trim() === ic
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : "bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <DynamicLucideIcon name={ic} size={12} />
                        <span>{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Picker */}
              <div className="pt-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ערכת צבעים לאוואטר
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setColor(col.value)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-r ${col.value} border-2 transition-all ${
                        color === col.value
                          ? "border-blue-500 scale-110 shadow-md ring-2 ring-blue-400/40"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                      title={col.label}
                    />
                  ))}
                </div>
              </div>

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
                  שמור סוכן
                </button>
              </div>
            </form>
          )}

          {/* List of Agents */}
          <div className="space-y-2.5">
            {agents.map((agent) => {
              const isActive = agent.id === activeAgentId;
              const hasPlaceholderWebhook =
                !agent.webhookUrl || agent.webhookUrl.includes("your-n8n-instance.com");

              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    onSelectAgent(agent.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-600/15 border-blue-500 dark:border-blue-500/60 shadow-md ring-2 ring-blue-500/30"
                      : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:border-blue-300 dark:hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                        agent.color || "from-blue-600 to-indigo-600"
                      } flex items-center justify-center flex-shrink-0 text-white shadow-md`}
                    >
                      <DynamicLucideIcon name={agent.avatarIcon} size={22} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {agent.name}
                          </h4>
                          {isActive && (
                            <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-medium border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                              פעיל
                            </span>
                          )}
                        </div>

                        {/* Actions (Admin only) */}
                        {currentUser?.role === "admin" && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(agent);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                              title="ערוך פרטים, אייקון ו-Webhook"
                            >
                              <Edit2 size={15} />
                            </button>
                            {!agent.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteAgent(agent.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                                title="מחק סוכן"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mt-0.5">
                        {agent.role}
                      </p>

                      {agent.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {agent.description}
                        </p>
                      )}

                      {/* Selection and Webhook indicator row */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/40 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 truncate text-slate-500 dark:text-slate-400 max-w-[170px]">
                          <Globe size={12} className="flex-shrink-0 text-slate-400" />
                          <span
                            className="font-mono text-[10px] truncate"
                            dir="ltr"
                            title={agent.webhookUrl}
                          >
                            {hasPlaceholderWebhook
                              ? "ברירת מחדל"
                              : agent.webhookUrl.replace(/^https?:\/\//, "")}
                          </span>
                          {currentUser?.role === "admin" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(agent);
                              }}
                              className="text-blue-500 hover:underline text-[10px] mr-1 flex-shrink-0"
                              title="ערוך כתובת Webhook"
                            >
                              (ערוך)
                            </button>
                          )}
                        </div>

                        {isActive ? (
                          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                            <Check size={13} className="stroke-[2.5]" />
                            <span>פעיל כעת</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAgent(agent.id);
                              onClose();
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1 px-3 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                          >
                            <Check size={13} />
                            <span>בחר סוכן</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Logout */}
        <div
          className="p-4 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/60 space-y-2.5"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
        >
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
              title="התנתק מהמערכת"
            >
              <LogOut size={15} />
              <span>התנתק מהמערכת ({currentUser.username})</span>
            </button>
          )}

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            כל הודעה נשלחת ישירות ל-Webhook של הסוכן הפעיל ב-n8n
          </p>
        </div>
      </div>
    </div>
  );
};
