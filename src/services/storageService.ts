import { ChatSession, Agent, User } from "../types/chat";
import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

export const DEFAULT_USERS: User[] = [
  {
    id: "admin-1",
    username: "admin",
    password: "admin",
    email: "admin@example.com",
    role: "admin",
    allowedAgentIds: [],
    createdAt: new Date().toISOString(),
  },
];

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

const parseDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val?.toDate === "function") return val.toDate();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

export class StorageService {
  private static readonly SESSIONS_KEY = "chatSessions";
  private static readonly AGENTS_KEY = "chatAgents";
  private static readonly ACTIVE_AGENT_KEY = "activeAgentId";
  private static readonly USERS_KEY = "chatbotUsers";
  private static readonly CURRENT_USER_KEY = "chatbotCurrentUser";

  // ================= USERS =================
  static loadUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      if (!stored) {
        this.saveLocalUsers(DEFAULT_USERS);
        return DEFAULT_USERS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_USERS;
    } catch (error) {
      console.warn("Failed to load users from local storage:", error);
      return DEFAULT_USERS;
    }
  }

  private static saveLocalUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.warn("Failed to save users locally:", error);
    }
  }

  static subscribeToUsers(callback: (users: User[]) => void): () => void {
    const firestoreDb = db;
    if (!firestoreDb) {
      callback(this.loadUsers());
      return () => {};
    }

    const usersCol = collection(firestoreDb, "users");
    const unsubscribe = onSnapshot(
      usersCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed default users in Firestore
          for (const u of DEFAULT_USERS) {
            await setDoc(doc(firestoreDb, "users", u.id), u);
          }
          this.saveLocalUsers(DEFAULT_USERS);
          callback(DEFAULT_USERS);
          return;
        }

        const firestoreUsers: User[] = [];
        snapshot.forEach((d) => {
          firestoreUsers.push(d.data() as User);
        });

        this.saveLocalUsers(firestoreUsers);
        callback(firestoreUsers);
      },
      (error) => {
        console.warn("Firestore users listener error, falling back to local:", error);
        callback(this.loadUsers());
      }
    );

    return unsubscribe;
  }

  static async saveUser(user: User): Promise<void> {
    const current = this.loadUsers();
    const idx = current.findIndex((u) => u.id === user.id);
    const updated = idx >= 0 ? [...current] : [user, ...current];
    if (idx >= 0) updated[idx] = user;
    this.saveLocalUsers(updated);

    const firestoreDb = db;
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, "users", user.id), user);
      } catch (err) {
        console.error("Failed to save user to Firestore:", err);
      }
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    const current = this.loadUsers();
    const updated = current.filter((u) => u.id !== userId);
    this.saveLocalUsers(updated);

    const firestoreDb = db;
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "users", userId));
      } catch (err) {
        console.error("Failed to delete user from Firestore:", err);
      }
    }
  }

  static async saveUsers(users: User[]): Promise<void> {
    this.saveLocalUsers(users);
    const firestoreDb = db;
    if (firestoreDb) {
      try {
        for (const u of users) {
          await setDoc(doc(firestoreDb, "users", u.id), u);
        }
      } catch (err) {
        console.error("Failed to save users batch to Firestore:", err);
      }
    }
  }

  // ================= CURRENT USER (Device-bound) =================
  static loadCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static saveCurrentUser(user: User | null): void {
    try {
      if (!user) {
        localStorage.removeItem(this.CURRENT_USER_KEY);
      } else {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.warn("Failed to save current user:", error);
    }
  }

  // ================= AGENTS =================
  static loadAgents(): Agent[] {
    try {
      const stored = localStorage.getItem(this.AGENTS_KEY);
      if (!stored) {
        this.saveLocalAgents(DEFAULT_AGENTS);
        return DEFAULT_AGENTS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_AGENTS;
    } catch (error) {
      console.warn("Failed to load agents from local storage:", error);
      return DEFAULT_AGENTS;
    }
  }

  private static saveLocalAgents(agents: Agent[]): void {
    try {
      localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents));
    } catch (error) {
      console.warn("Failed to save agents locally:", error);
    }
  }

  static subscribeToAgents(callback: (agents: Agent[]) => void): () => void {
    const firestoreDb = db;
    if (!firestoreDb) {
      callback(this.loadAgents());
      return () => {};
    }

    const agentsCol = collection(firestoreDb, "agents");
    const unsubscribe = onSnapshot(
      agentsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const a of DEFAULT_AGENTS) {
            await setDoc(doc(firestoreDb, "agents", a.id), a);
          }
          this.saveLocalAgents(DEFAULT_AGENTS);
          callback(DEFAULT_AGENTS);
          return;
        }

        const firestoreAgents: Agent[] = [];
        snapshot.forEach((d) => {
          firestoreAgents.push(d.data() as Agent);
        });

        this.saveLocalAgents(firestoreAgents);
        callback(firestoreAgents);
      },
      (error) => {
        console.warn("Firestore agents listener error:", error);
        callback(this.loadAgents());
      }
    );

    return unsubscribe;
  }

  static async saveAgent(agent: Agent): Promise<void> {
    const current = this.loadAgents();
    const idx = current.findIndex((a) => a.id === agent.id);
    const updated = idx >= 0 ? [...current] : [...current, agent];
    if (idx >= 0) updated[idx] = agent;
    this.saveLocalAgents(updated);

    const firestoreDb = db;
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, "agents", agent.id), agent);
      } catch (err) {
        console.error("Failed to save agent to Firestore:", err);
      }
    }
  }

  static async deleteAgent(agentId: string): Promise<void> {
    const current = this.loadAgents();
    const updated = current.filter((a) => a.id !== agentId);
    this.saveLocalAgents(updated);

    const firestoreDb = db;
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "agents", agentId));
      } catch (err) {
        console.error("Failed to delete agent from Firestore:", err);
      }
    }
  }

  static async saveAgents(agents: Agent[]): Promise<void> {
    this.saveLocalAgents(agents);
    const firestoreDb = db;
    if (firestoreDb) {
      try {
        for (const a of agents) {
          await setDoc(doc(firestoreDb, "agents", a.id), a);
        }
      } catch (err) {
        console.error("Failed to batch save agents to Firestore:", err);
      }
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

  // ================= SESSIONS =================
  private static serializeSession(session: ChatSession): any {
    return {
      id: session.id,
      title: session.title,
      agentId: session.agentId,
      isArchived: Boolean(session.isArchived),
      userId: session.userId || null,
      createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
      lastUpdated: session.lastUpdated instanceof Date ? session.lastUpdated.toISOString() : session.lastUpdated,
      messages: (session.messages || []).map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      })),
    };
  }

  private static deserializeSession(raw: any): ChatSession {
    return {
      id: raw.id,
      title: raw.title || "שיחה ללא כותרת",
      agentId:
        raw.agentId ||
        (Array.isArray(raw.messages) &&
          raw.messages.find((m: any) => m?.agentId)?.agentId) ||
        "shuki",
      isArchived: Boolean(raw.isArchived),
      userId: raw.userId || undefined,
      createdAt: parseDate(raw.createdAt),
      lastUpdated: parseDate(raw.lastUpdated),
      messages: (raw.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: parseDate(msg.timestamp),
      })),
    };
  }

  static loadSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      if (!stored) return [];

      return JSON.parse(stored).map((session: any) =>
        this.deserializeSession(session)
      );
    } catch (error) {
      console.warn("Failed to load sessions from local storage:", error);
      return [];
    }
  }

  private static saveLocalSessions(sessions: ChatSession[]): void {
    try {
      const serialized = sessions.map((s) => this.serializeSession(s));
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.warn("Failed to save sessions locally:", error);
    }
  }

  static subscribeToSessions(callback: (sessions: ChatSession[]) => void): () => void {
    const firestoreDb = db;
    if (!firestoreDb) {
      callback(this.loadSessions());
      return () => {};
    }

    const sessionsCol = collection(firestoreDb, "chat_sessions");
    const unsubscribe = onSnapshot(
      sessionsCol,
      (snapshot) => {
        if (snapshot.empty) {
          const local = this.loadSessions();
          callback(local);
          return;
        }

        const firestoreSessions: ChatSession[] = [];
        snapshot.forEach((d) => {
          firestoreSessions.push(this.deserializeSession(d.data()));
        });

        // Sort by lastUpdated descending
        firestoreSessions.sort(
          (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
        );

        this.saveLocalSessions(firestoreSessions);
        callback(firestoreSessions);
      },
      (error) => {
        console.warn("Firestore sessions listener error:", error);
        callback(this.loadSessions());
      }
    );

    return unsubscribe;
  }

  static async saveSession(session: ChatSession): Promise<void> {
    const current = this.loadSessions();
    const idx = current.findIndex((s) => s.id === session.id);
    const updated = idx >= 0 ? [...current] : [session, ...current];
    if (idx >= 0) updated[idx] = session;
    this.saveLocalSessions(updated);

    const firestoreDb = db;
    if (firestoreDb) {
      try {
        const serialized = this.serializeSession(session);
        await setDoc(doc(firestoreDb, "chat_sessions", session.id), serialized);
      } catch (err) {
        console.error("Failed to save session to Firestore:", err);
      }
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const current = this.loadSessions();
    const updated = current.filter((s) => s.id !== sessionId);
    this.saveLocalSessions(updated);

    const firestoreDb = db;
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "chat_sessions", sessionId));
      } catch (err) {
        console.error("Failed to delete session from Firestore:", err);
      }
    }
  }

  static async saveSessions(sessions: ChatSession[]): Promise<void> {
    this.saveLocalSessions(sessions);
    const firestoreDb = db;
    if (firestoreDb) {
      try {
        for (const s of sessions) {
          await setDoc(doc(firestoreDb, "chat_sessions", s.id), this.serializeSession(s));
        }
      } catch (err) {
        console.error("Failed to batch save sessions to Firestore:", err);
      }
    }
  }

  // ================= EXPORT =================
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
        attachment: msg.attachment
          ? { name: msg.attachment.name, size: msg.attachment.size, type: msg.attachment.type }
          : undefined,
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
