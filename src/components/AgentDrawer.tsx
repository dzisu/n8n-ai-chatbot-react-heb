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
  const [color, setColor] = useState("from-pink-500 to-rose-600");

  if (!isOpen) return null;

  const startCreate = () => {
    setName("");
    setRole("");
    setDescription("");
    setWebhookUrl("");
    setAvatarIcon("bot");
    setColor("from-pink-500 to-rose-600");
    setIsCreating(true);
    setEditingAgent(null);
  };

  const startEdit = (agent: Agent) => {
    setName(agent.name);
    setRole(agent.role);
    setDescription(agent.description);
    setWebhookUrl(agent.webhookUrl);
    setAvatarIcon(agent.avatarIcon || "bot");
    setColor(agent.color || "from-pink-500 to-rose-600");
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
      id: editingAgent ? editingAgent.id : `agent-${crypto.randomUUID()}`,
      name: name.trim(),
      role: role.trim() || "סוכן n8n",
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
    { label: "ורוד n8n", value: "from-pink-500 to-rose-600" },
    { label: "שחור-פחם", value: "from-neutral-800 to-neutral-950" },
    { label: "כחול-אינדיגו", value: "from-blue-600 to-indigo-600" },
    { label: "טורקיז-אזמרגד", value: "from-emerald-600 to-teal-500" },
    { label: "ענבר-זהב", value: "from-amber-500 to-orange-600" },
    { label: "סגול עמוק", value: "from-purple-600 to-indigo-700" },
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
    "shield",
  ];

  const isIconValid = isValidLucideIcon(avatarIcon);

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
                <Settings2 className="text-[#191919] dark:text-[#FAFAFA]" size={20} />
                <span>ניהול והחלפת סוכנים</span>
              </h2>
              <p className="text-xs text-[#676767] dark:text-[#A4A4A4] mt-0.5">
                בחר סוכן לשיחה או הגדר Webhook ייעודי
              </p>
            </div>
          </div>

          {!isCreating && !editingAgent && currentUser?.role === "admin" && (
            <button
              onClick={startCreate}
              className="bg-[#191919] hover:bg-[#333333] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:hover:bg-[#EAEAEA] dark:text-[#191919] text-xs font-bold py-2 px-3 rounded-2xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
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
              className="bg-[#FFFFFF] dark:bg-[#242424] border border-[#E0E0E0] dark:border-[#353535] rounded-2xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#353535] pb-2">
                <h3 className="text-sm font-semibold text-[#191919] dark:text-[#FAFAFA]">
                  {editingAgent ? `עריכת סוכן: ${editingAgent.name}` : "הגדרת סוכן חדש"}
                </h3>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-[#676767] hover:text-[#191919] dark:hover:text-[#FAFAFA]"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  שם הסוכן *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: שוקי / יועץ תוכן"
                  className="w-full bg-[#F1F1F1] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] text-xs p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#191919] dark:focus:border-[#FAFAFA] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  תפקיד קצר / כותרת
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="למשל: עוזר אישי, מומחה תוכן, מנתח נתונים"
                  className="w-full bg-[#F1F1F1] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] text-xs p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#191919] dark:focus:border-[#FAFAFA] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  תיאור הסוכן
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="כמה מילים על תחום ההתמחות של הסוכן..."
                  className="w-full bg-[#F1F1F1] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] text-xs p-2 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#191919] dark:focus:border-[#FAFAFA] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 flex items-center justify-between font-sans">
                  <span>כתובת n8n Webhook URL *</span>
                  <span className="text-[10px] text-[#676767] dark:text-[#A4A4A4] font-mono">ייחודי לסוכן זה</span>
                </label>
                <input
                  type="text"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/..."
                  className="w-full bg-[#F1F1F1] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] text-xs p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#191919] dark:focus:border-[#FAFAFA] focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>

              {/* Dynamic Lucide Icon Picker by Name */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#191919] dark:text-[#FAFAFA]">
                    שם אייקון מתוך חבילת Lucide
                  </label>
                  <a
                    href="https://lucide.dev/icons"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#676767] hover:text-[#191919] dark:text-[#A4A4A4] dark:hover:text-[#FAFAFA] flex items-center gap-1 font-mono"
                    title="פתח את מאגר האייקונים ב-lucide.dev"
                  >
                    <span>lucide.dev</span>
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
                      className="w-full bg-[#F1F1F1] dark:bg-[#191919] text-[#191919] dark:text-[#FAFAFA] text-xs p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#353535] focus:border-[#191919] dark:focus:border-[#FAFAFA] focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>

                  {/* Live preview badge */}
                  <div
                    className="w-10 h-10 rounded-2xl bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] flex items-center justify-center shadow-sm flex-shrink-0 border border-[#E0E0E0] dark:border-[#353535]"
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
                  <span className="text-[10px] text-[#868686] block mb-1">
                    הצעות מהירות:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {popularIcons.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setAvatarIcon(ic)}
                        className={`px-2 py-1 rounded-full text-[11px] font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                          avatarIcon.toLowerCase().trim() === ic
                            ? "bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] border-transparent font-bold"
                            : "bg-[#F1F1F1] dark:bg-[#191919] text-[#676767] dark:text-[#A4A4A4] border-[#E0E0E0] dark:border-[#353535] hover:bg-[#EAEAEA]"
                        }`}
                      >
                        <DynamicLucideIcon name={ic} size={11} />
                        <span>{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Palette Picker */}
              <div className="pt-1">
                <label className="block text-xs font-medium text-[#191919] dark:text-[#FAFAFA] mb-1 font-sans">
                  ערכת צבעים לאוואטר
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setColor(col.value)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-r ${col.value} border-2 transition-all cursor-pointer ${
                        color === col.value
                          ? "border-[#191919] dark:border-[#FAFAFA] scale-110 shadow-sm ring-2 ring-black/20 dark:ring-white/20"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                      title={col.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E0E0E0] dark:border-[#353535]">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3.5 py-1.5 text-xs text-[#676767] dark:text-[#A4A4A4] hover:text-[#191919] dark:hover:text-[#FAFAFA] rounded-xl hover:bg-[#F1F1F1] dark:hover:bg-[#191919] cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#191919] hover:bg-[#333333] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:hover:bg-[#EAEAEA] dark:text-[#191919] font-bold rounded-2xl shadow-sm active:scale-95 cursor-pointer"
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
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#EAEAEA] dark:bg-[#2E2E2E] border-[#191919] dark:border-[#FAFAFA] shadow-sm"
                      : "bg-[#FFFFFF] dark:bg-[#242424] border-[#E0E0E0] dark:border-[#353535] hover:border-[#BFBFBF] dark:hover:border-[#676767]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-11 h-11 rounded-2xl bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#E0E0E0] dark:border-[#353535]"
                    >
                      <DynamicLucideIcon name={agent.avatarIcon} size={22} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#191919] dark:text-[#FAFAFA] truncate font-sans">
                            {agent.name}
                          </h4>
                          {isActive && (
                            <span className="n8n-capsule bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] text-[9px] font-bold gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
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
                              className="p-1.5 text-[#868686] hover:text-[#191919] dark:hover:text-[#FAFAFA] rounded-lg transition-colors cursor-pointer"
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
                                className="p-1.5 text-[#868686] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="מחק סוכן"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#676767] dark:text-[#A4A4A4] font-medium mt-0.5 font-mono">
                        {agent.role}
                      </p>

                      {agent.description && (
                        <p className="text-[11px] text-[#676767] dark:text-[#A4A4A4] mt-1 line-clamp-2 leading-relaxed">
                          {agent.description}
                        </p>
                      )}

                      {/* Selection and Webhook indicator row */}
                      <div className="mt-2.5 pt-2 border-t border-[#E0E0E0] dark:border-[#353535] flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 truncate text-[#868686] dark:text-[#676767] max-w-[170px]">
                          <Globe size={12} className="flex-shrink-0" />
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
                              className="text-[#676767] hover:text-[#191919] dark:text-[#A4A4A4] dark:hover:text-[#FAFAFA] hover:underline text-[10px] mr-1 flex-shrink-0 cursor-pointer"
                              title="ערוך כתובת Webhook"
                            >
                              (ערוך)
                            </button>
                          )}
                        </div>

                        {isActive ? (
                          <span className="n8n-capsule bg-[#191919] text-[#FAFAFA] dark:bg-[#FAFAFA] dark:text-[#191919] text-[10px] font-bold gap-1">
                            <Check size={12} className="stroke-[3]" />
                            <span>נבחר</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAgent(agent.id);
                              onClose();
                            }}
                            className="bg-[#191919] dark:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#191919] hover:bg-[#333333] dark:hover:bg-[#EAEAEA] text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <Check size={12} />
                            <span>בחר</span>
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
          className="p-4 border-t border-[#E0E0E0] dark:border-[#353535] bg-[#F1F1F1]/70 dark:bg-[#191919]/70 space-y-2.5"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
        >
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-[#FFFFFF] hover:bg-red-50 dark:bg-[#242424] dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="התנתק מהמערכת"
            >
              <LogOut size={15} />
              <span>התנתק מהמערכת ({currentUser.username})</span>
            </button>
          )}

          <p className="text-[10px] text-[#868686] dark:text-[#676767] text-center font-mono uppercase tracking-wider">
            Powered by n8n Workflow Webhooks
          </p>
        </div>
      </div>
    </div>
  );
};
