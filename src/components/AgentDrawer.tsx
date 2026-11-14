import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Code,
  Film,
  BookOpen,
  User,
  Plus,
  X,
  Check,
  Edit2,
  Trash2,
  Globe,
  Settings2,
  AlertTriangle,
} from "lucide-react";
import { Agent } from "../types/chat";

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  activeAgentId: string;
  onSelectAgent: (agentId: string) => void;
  onSaveAgent: (agent: Agent) => void;
  onDeleteAgent: (agentId: string) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  isOpen,
  onClose,
  agents,
  activeAgentId,
  onSelectAgent,
  onSaveAgent,
  onDeleteAgent,
}) => {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [avatarIcon, setAvatarIcon] = useState("sparkles");
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
      avatarIcon,
      color,
      isDefault: editingAgent?.isDefault || false,
    };

    onSaveAgent(newAgent);
    cancelForm();
  };

  const renderIcon = (iconName?: string, size = 20) => {
    switch (iconName) {
      case "sparkles":
        return <Sparkles size={size} />;
      case "code":
        return <Code size={size} />;
      case "film":
        return <Film size={size} />;
      case "book-open":
        return <BookOpen size={size} />;
      case "user":
        return <User size={size} />;
      default:
        return <Bot size={size} />;
    }
  };

  const colorOptions = [
    { label: "כחול-אינדיגו", value: "from-blue-600 to-indigo-600" },
    { label: "סגול-ורוד", value: "from-purple-600 to-pink-500" },
    { label: "טורקיז-אזמרגד", value: "from-emerald-600 to-teal-500" },
    { label: "כתום-ענבר", value: "from-amber-500 to-orange-600" },
    { label: "אדום-רובי", value: "from-rose-600 to-red-500" },
    { label: "ציאן-כחול", value: "from-cyan-600 to-blue-600" },
  ];

  const iconOptions = [
    { id: "sparkles", label: "ניצוץ", icon: <Sparkles size={18} /> },
    { id: "bot", label: "רובוט", icon: <Bot size={18} /> },
    { id: "code", label: "קוד", icon: <Code size={18} /> },
    { id: "film", label: "קולנוע", icon: <Film size={18} /> },
    { id: "book-open", label: "ספר/אפיון", icon: <BookOpen size={18} /> },
    { id: "user", label: "אישי", icon: <User size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-md border-l border-slate-700/60 shadow-2xl h-full flex flex-col z-10 text-right">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="סגור"
            >
              <X size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings2 className="text-blue-400" size={20} />
                ניהול והחלפת סוכנים
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                בחר סוכן לשיחה או הגדר Webhook ייעודי
              </p>
            </div>
          </div>

          {!isCreating && !editingAgent && (
            <button
              onClick={startCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-md"
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
              className="bg-slate-800/90 border border-blue-500/40 rounded-xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h3 className="text-sm font-semibold text-white">
                  {editingAgent ? `עריכת סוכן: ${editingAgent.name}` : "הגדרת סוכן חדש"}
                </h3>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  שם הסוכן *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: שוקי / יועץ מתמטיקה"
                  className="w-full bg-slate-700/60 text-white text-xs p-2.5 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  תפקיד קצר / כותרת
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="למשל: עוזר אישי, מומחה תוכן, מתכנת"
                  className="w-full bg-slate-700/60 text-white text-xs p-2.5 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  תיאור הסוכן
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="כמה מילים על תחום ההתמחות של הסוכן..."
                  className="w-full bg-slate-700/60 text-white text-xs p-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>כתובת n8n Webhook URL *</span>
                  <span className="text-[10px] text-blue-400">ייחודי לסוכן זה</span>
                </label>
                <input
                  type="text"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/..."
                  className="w-full bg-slate-700/60 text-white text-xs p-2.5 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    אייקון
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAvatarIcon(opt.id)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-all ${
                          avatarIcon === opt.id
                            ? "bg-blue-600 text-white border-blue-400"
                            : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                        }`}
                        title={opt.label}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    צבע
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {colorOptions.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setColor(col.value)}
                        className={`w-6 h-6 rounded-full bg-gradient-to-r ${col.value} border-2 transition-all ${
                          color === col.value
                            ? "border-white scale-110"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md"
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
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? "bg-blue-600/15 border-blue-500/50 shadow-md ring-1 ring-blue-500/30"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                        agent.color || "from-blue-600 to-indigo-600"
                      } flex items-center justify-center flex-shrink-0 text-white shadow-md`}
                    >
                      {renderIcon(agent.avatarIcon, 22)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">
                            {agent.name}
                          </h4>
                          {isActive && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-medium border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              פעיל
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(agent)}
                            className="p-1 text-slate-400 hover:text-blue-300 hover:bg-slate-700/60 rounded transition-colors"
                            title="ערוך פרטים ו-Webhook"
                          >
                            <Edit2 size={14} />
                          </button>
                          {!agent.isDefault && (
                            <button
                              onClick={() => onDeleteAgent(agent.id)}
                              className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded transition-colors"
                              title="מחק סוכן"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-blue-300 font-medium mt-0.5">
                        {agent.role}
                      </p>

                      {agent.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {agent.description}
                        </p>
                      )}

                      {/* Webhook indicator */}
                      <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 truncate text-slate-400 max-w-[180px]">
                          <Globe size={12} className="flex-shrink-0 text-slate-500" />
                          <span
                            className="font-mono text-[10px] truncate"
                            dir="ltr"
                            title={agent.webhookUrl}
                          >
                            {hasPlaceholderWebhook
                              ? "טרם הוגדר Webhook"
                              : agent.webhookUrl.replace(/^https?:\/\//, "")}
                          </span>
                        </div>

                        {hasPlaceholderWebhook ? (
                          <button
                            onClick={() => startEdit(agent)}
                            className="text-amber-400 text-[10px] flex items-center gap-1 hover:underline"
                          >
                            <AlertTriangle size={11} />
                            הגדר כתובת
                          </button>
                        ) : !isActive ? (
                          <button
                            onClick={() => {
                              onSelectAgent(agent.id);
                              onClose();
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1"
                          >
                            <span>בחר סוכן</span>
                            <Check size={13} />
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[10px]">נבחר לשיחה</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-slate-900/60 text-center">
          <p className="text-[11px] text-slate-400">
            כל הודעה נשלחת ישירות ל-Webhook של הסוכן הפעיל ב-n8n
          </p>
        </div>
      </div>
    </div>
  );
};
