import { ChatSession, Agent } from "../types/chat";

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: "shuki",
    name: "שוקי",
    role: "עוזר אישי וחבר",
    description: "ליווי אישי, לימודים, רעיונות לטיקטוק ושיחה שוטפת בגובה העיניים",
    webhookUrl: "https://your-n8n-instance.com/webhook/shuki",
    avatarIcon: "sparkles",
    color: "from-blue-600 to-cyan-500",
    isDefault: true,
  },
  {
    id: "sophie",
    name: "סופי",
    role: "פיתוח, קוד ו-Ren'Py",
    description: "מומחית לכתיבת קוד, פתרון באגים, סקריפטים ופיתוח משחקים",
    webhookUrl: "https://your-n8n-instance.com/webhook/sophie",
    avatarIcon: "code",
    color: "from-purple-600 to-pink-500",
    isDefault: true,
  },
  {
    id: "cinema",
    name: "מנטור קולנוע",
    role: "מגמת קולנוע ועריכה",
    description: "ניתוח סרטים, תסריטאות, טכניקות עריכה והכנה למבחנים",
    webhookUrl: "https://your-n8n-instance.com/webhook/cinema",
    avatarIcon: "film",
    color: "from-amber-500 to-orange-600",
    isDefault: true,
  },
  {
    id: "edna",
    name: "עדנה",
    role: "אפיון וניתוח מערכות",
    description: "כתיבת מסמכי אפיון (Specs), הגדרת דרישות וארכיטקטורה",
    webhookUrl: "https://your-n8n-instance.com/webhook/edna",
    avatarIcon: "book-open",
    color: "from-emerald-600 to-teal-500",
    isDefault: true,
  },
];

export class StorageService {
  private static readonly SESSIONS_KEY = "chatSessions";
  private static readonly AGENTS_KEY = "chatAgents";
  private static readonly ACTIVE_AGENT_KEY = "activeAgentId";

  // AGENTS
  static loadAgents(): Agent[] {
    try {
      const stored = localStorage.getItem(this.AGENTS_KEY);
      if (!stored) {
        this.saveAgents(DEFAULT_AGENTS);
        return DEFAULT_AGENTS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_AGENTS;
    } catch (error) {
      console.warn("Failed to load agents from storage:", error);
      return DEFAULT_AGENTS;
    }
  }

  static saveAgents(agents: Agent[]): void {
    try {
      localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents));
    } catch (error) {
      console.warn("Failed to save agents to storage:", error);
    }
  }

  static loadActiveAgentId(fallbackId: string): string {
    try {
      return localStorage.getItem(this.ACTIVE_AGENT_KEY) || fallbackId;
    } catch {
      return fallbackId;
    }
  }

  static saveActiveAgentId(agentId: string): void {
    try {
      localStorage.setItem(this.ACTIVE_AGENT_KEY, agentId);
    } catch (error) {
      console.warn("Failed to save active agent ID:", error);
    }
  }

  // SESSIONS
  static saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.warn("Failed to save sessions to storage:", error);
    }
  }

  static loadSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      if (!stored) return [];

      return JSON.parse(stored).map((session: any) => ({
        id: session.id,
        title: session.title,
        agentId:
          session.agentId ||
          (Array.isArray(session.messages) &&
            session.messages.find((m: any) => m?.agentId)?.agentId) ||
          "shuki",
        createdAt: new Date(session.createdAt),
        lastUpdated: new Date(session.lastUpdated),
        messages: (session.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.warn("Failed to load sessions from storage:", error);
      return [];
    }
  }

  static exportSession(session: ChatSession, agent?: Agent): void {
    const exportData = {
      sessionTitle: session.title,
      agent: agent ? { id: agent.id, name: agent.name, role: agent.role } : session.agentId,
      exportDate: new Date().toISOString(),
      messages: session.messages.map((msg) => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        agentName: msg.agentName,
        attachment: msg.attachment ? { name: msg.attachment.name, size: msg.attachment.size, type: msg.attachment.type } : undefined,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${session.title.replace(/[\/\\?%*:|"<>]/g, "_")}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
