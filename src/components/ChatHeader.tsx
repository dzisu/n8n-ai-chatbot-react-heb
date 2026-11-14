import React from "react";
import {
  MessageSquare,
  Bot,
  Sparkles,
  Code,
  Film,
  BookOpen,
  User,
  ChevronDown,
  Users,
  AlertCircle,
} from "lucide-react";
import { Agent } from "../types/chat";

interface ChatHeaderProps {
  activeAgent?: Agent;
  onOpenHistory: () => void;
  onOpenAgents: () => void;
  sessionsCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeAgent,
  onOpenHistory,
  onOpenAgents,
  sessionsCount,
}) => {
  const renderAgentIcon = (iconName?: string, size = 18) => {
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

  const hasMissingWebhook =
    !activeAgent?.webhookUrl ||
    activeAgent.webhookUrl.includes("your-n8n-instance.com");

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/60 px-3 sm:px-6 py-3 flex-shrink-0 z-20">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Right side in RTL: History toggle button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-xl border border-slate-700/60 text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
            title="פתח היסטוריית שיחות"
          >
            <MessageSquare size={16} className="text-blue-400" />
            <span className="hidden xs:inline">שיחות</span>
            {sessionsCount > 0 && (
              <span className="bg-blue-600/30 text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {sessionsCount}
              </span>
            )}
          </button>
        </div>

        {/* Center: Active Agent Badge / Selector */}
        <button
          onClick={onOpenAgents}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/40 transition-all max-w-[55%] sm:max-w-none text-right group shadow-inner"
          title="לחץ להחלפה או הגדרת סוכנים"
        >
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${
              activeAgent?.color || "from-blue-600 to-indigo-600"
            } flex items-center justify-center text-white shadow-md flex-shrink-0`}
          >
            {renderAgentIcon(activeAgent?.avatarIcon, 17)}
          </div>

          <div className="min-w-0 text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                {activeAgent?.name || "סוכן ראשי"}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {activeAgent?.role || "סוכן n8n"}
            </p>
          </div>

          <ChevronDown
            size={14}
            className="text-slate-400 group-hover:text-white transition-transform flex-shrink-0 mr-1"
          />
        </button>

        {/* Left side in RTL: Agents Drawer button */}
        <div className="flex items-center gap-2">
          {hasMissingWebhook && (
            <button
              onClick={onOpenAgents}
              className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all"
              title="הגדר כתובת Webhook לסוכן זה"
            >
              <AlertCircle size={14} />
              <span>הגדר Webhook</span>
            </button>
          )}

          <button
            onClick={onOpenAgents}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-600 hover:to-indigo-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md active:scale-95"
            title="פתח ניהול סוכנים"
          >
            <Users size={16} />
            <span className="hidden sm:inline">סוכנים</span>
          </button>
        </div>
      </div>
    </header>
  );
};
