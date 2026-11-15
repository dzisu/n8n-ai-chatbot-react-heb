import { ChatSession, Agent, User, Message } from "../types/chat";
import { db, auth } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";

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
  private static readonly CURRENT_USER_KEY = "chatbotCurrentUser";

  // ================= USERS & AUTH PROFILE =================
  static async syncUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const firestoreDb = db;
    const defaultProfile: User = {
      id: firebaseUser.uid,
      username:
        firebaseUser.displayName ||
        (firebaseUser.email ? firebaseUser.email.split("@")[0] : "user"),
      email: firebaseUser.email || "",
      role: "user",
      allowedAgentIds: ["shuki", "sophie", "cinema", "edna"],
      createdAt: new Date().toISOString(),
    };

    if (!firestoreDb) {
      this.saveCurrentUser(defaultProfile);
      return defaultProfile;
    }

    try {
      const userDocRef = doc(firestoreDb, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as User;
        const profile: User = {
          ...defaultProfile,
          ...data,
          id: firebaseUser.uid,
          email: firebaseUser.email || data.email || "",
        };
        this.saveCurrentUser(profile);
        return profile;
      }

      // Check if this is the first user or an admin email
      let role: "admin" | "user" = "user";
      const normalizedEmail = (firebaseUser.email || "").toLowerCase();
      if (
        normalizedEmail.includes("davidzisu") ||
        normalizedEmail.includes("dzisu") ||
        normalizedEmail.startsWith("admin@")
      ) {
        role = "admin";
      } else {
        const allUsersSnap = await getDocs(collection(firestoreDb, "users"));
        if (allUsersSnap.empty) {
          role = "admin"; // First registered user is automatically admin
        }
      }

      const newProfile: User = {
        ...defaultProfile,
        role,
        allowedAgentIds: role === "admin" ? [] : ["shuki", "sophie", "cinema", "edna"],
      };

      await setDoc(userDocRef, newProfile);
      this.saveCurrentUser(newProfile);
      return newProfile;
    } catch (error) {
      console.warn("Error syncing user profile with Firestore:", error);
      this.saveCurrentUser(defaultProfile);
      return defaultProfile;
    }
  }

  static subscribeToUsers(callback: (users: User[]) => void): () => void {
    const firestoreDb = db;
    if (!firestoreDb) {
      callback([]);
      return () => {};
    }

    const usersCol = collection(firestoreDb, "users");
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const firestoreUsers: User[] = [];
        snapshot.forEach((d) => {
          firestoreUsers.push(d.data() as User);
        });
        callback(firestoreUsers);
      },
      (error) => {
        console.warn("Firestore users listener error:", error);
        callback([]);
      }
    );

    return unsubscribe;
  }

  static async saveUser(user: User): Promise<void> {
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
    const firestoreDb = db;
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "users", userId));
      } catch (err) {
        console.error("Failed to delete user from Firestore:", err);
      }
    }
  }

  // Device-cached profile
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
      console.warn("Failed to save current user cache:", error);
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
          // If Firestore is empty and auth user exists, seed default agents
          if (auth?.currentUser) {
            try {
              for (const a of DEFAULT_AGENTS) {
                await setDoc(doc(firestoreDb, "agents", a.id), a);
              }
            } catch (seedErr) {
              console.warn("Could not seed default agents in Firestore:", seedErr);
            }
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

  // ================= SESSIONS & ISOLATION (SUBCOLLECTION ARCHITECTURE) =================
  static serializeMessage(msg: Message): any {
    return {
      id: msg.id,
      content: msg.content || "",
      sender: msg.sender,
      agentId: msg.agentId || null,
      agentName: msg.agentName || null,
      timestamp:
        msg.timestamp instanceof Date
          ? msg.timestamp.toISOString()
          : msg.timestamp,
      // Metadata only - no binary or dataUrl stored in Firestore to prevent 1MB limit overflow
      attachment: msg.attachment
        ? {
            name: msg.attachment.name,
            type: msg.attachment.type,
            size: msg.attachment.size,
            isImage: Boolean(msg.attachment.isImage),
            uploadId: msg.attachment.uploadId || null,
            status: msg.attachment.status || "uploaded",
          }
        : null,
    };
  }

  static deserializeMessage(raw: any): Message {
    return {
      id: raw.id || crypto.randomUUID(),
      content: raw.content || "",
      sender: raw.sender || "user",
      timestamp: parseDate(raw.timestamp),
      agentId: raw.agentId || undefined,
      agentName: raw.agentName || undefined,
      attachment: raw.attachment
        ? {
            name: raw.attachment.name,
            type: raw.attachment.type,
            size: raw.attachment.size,
            isImage: Boolean(raw.attachment.isImage),
            uploadId: raw.attachment.uploadId || undefined,
            status: raw.attachment.status || "uploaded",
          }
        : undefined,
    };
  }

  private static serializeSession(session: ChatSession): any {
    const msgCount = session.messages ? session.messages.length : (session.messageCount || 0);
    const lastMsg =
      session.messages && session.messages.length > 0
        ? (session.messages[session.messages.length - 1].content || "").slice(0, 100)
        : (session.lastMessage || null);

    return {
      id: session.id,
      title: session.title,
      agentId: session.agentId,
      isArchived: Boolean(session.isArchived),
      userId: session.ownerUid || session.userId || null,
      ownerUid: session.ownerUid || session.userId || null,
      messageCount: msgCount,
      lastMessage: lastMsg,
      createdAt:
        session.createdAt instanceof Date
          ? session.createdAt.toISOString()
          : session.createdAt,
      lastUpdated:
        session.lastUpdated instanceof Date
          ? session.lastUpdated.toISOString()
          : session.lastUpdated,
      // Note: We do NOT store full messages array here. Messages live in the subcollection.
    };
  }

  private static deserializeSession(raw: any): ChatSession {
    const legacyMessages = Array.isArray(raw.messages)
      ? raw.messages.map((m: any) => this.deserializeMessage(m))
      : [];

    return {
      id: raw.id,
      title: raw.title || "שיחה ללא כותרת",
      agentId:
        raw.agentId ||
        (legacyMessages.find((m: any) => m?.agentId)?.agentId) ||
        "shuki",
      isArchived: Boolean(raw.isArchived),
      userId: raw.ownerUid || raw.userId || undefined,
      ownerUid: raw.ownerUid || raw.userId || undefined,
      messageCount: raw.messageCount ?? legacyMessages.length,
      lastMessage: raw.lastMessage || (legacyMessages.length > 0 ? legacyMessages[legacyMessages.length - 1].content : undefined),
      createdAt: parseDate(raw.createdAt),
      lastUpdated: parseDate(raw.lastUpdated),
      messages: legacyMessages,
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
      const serialized = sessions.map((s) => ({
        ...this.serializeSession(s),
        messages: (s.messages || []).map((m) => this.serializeMessage(m)),
      }));
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.warn("Failed to save sessions locally:", error);
    }
  }

  /**
   * Subscribes to real-time chat sessions filtered strictly by ownerUid for security isolation
   */
  static subscribeToSessions(
    ownerUid: string | null | undefined,
    callback: (sessions: ChatSession[]) => void
  ): () => void {
    const firestoreDb = db;
    if (!firestoreDb || !ownerUid) {
      callback([]);
      return () => {};
    }

    const sessionsCol = collection(firestoreDb, "chat_sessions");
    // Strictly isolate sessions by authenticated ownerUid
    const q = query(sessionsCol, where("ownerUid", "==", ownerUid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreSessions: ChatSession[] = [];
        snapshot.forEach((d) => {
          firestoreSessions.push(this.deserializeSession(d.data()));
        });

        // Sort descending by lastUpdated
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

  /**
   * Subscribes to real-time messages of a specific session via subcollection:
   * chat_sessions/{sessionId}/messages/{messageId}
   */
  static subscribeToMessages(
    sessionId: string | null | undefined,
    callback: (messages: Message[]) => void
  ): () => void {
    const firestoreDb = db;
    if (!firestoreDb || !sessionId) {
      callback([]);
      return () => {};
    }

    const messagesCol = collection(firestoreDb, "chat_sessions", sessionId, "messages");
    const q = query(messagesCol, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (!snapshot.empty) {
          const msgs: Message[] = [];
          snapshot.forEach((d) => {
            msgs.push(this.deserializeMessage(d.data()));
          });
          callback(msgs);
        } else {
          // If subcollection is empty, check for legacy messages array in parent document
          try {
            const sessionDocRef = doc(firestoreDb, "chat_sessions", sessionId);
            const sessionSnap = await getDoc(sessionDocRef);
            if (sessionSnap.exists()) {
              const data = sessionSnap.data();
              if (Array.isArray(data.messages) && data.messages.length > 0) {
                const legacyMsgs = data.messages.map((m: any) => this.deserializeMessage(m));
                callback(legacyMsgs);
                // Migrate to subcollection automatically
                this.migrateLegacyMessages(sessionId, legacyMsgs);
                return;
              }
            }
          } catch (e) {
            console.warn("Could not check legacy session messages:", e);
          }
          callback([]);
        }
      },
      (error) => {
        console.warn(`Firestore messages listener error for session ${sessionId}:`, error);
        // Fallback to local session messages
        const local = this.loadSessions().find((s) => s.id === sessionId);
        callback(local?.messages || []);
      }
    );

    return unsubscribe;
  }

  private static async migrateLegacyMessages(sessionId: string, messages: Message[]): Promise<void> {
    const firestoreDb = db;
    if (!firestoreDb) return;
    try {
      for (const msg of messages) {
        const msgRef = doc(firestoreDb, "chat_sessions", sessionId, "messages", msg.id);
        await setDoc(msgRef, this.serializeMessage(msg), { merge: true });
      }
    } catch (err) {
      console.warn(`Failed migrating legacy messages for session ${sessionId}:`, err);
    }
  }

  /**
   * Saves a single message directly into the subcollection
   */
  static async saveMessage(sessionId: string, message: Message, ownerUid?: string): Promise<void> {
    const firestoreDb = db;
    if (!firestoreDb || !sessionId) return;

    try {
      const msgRef = doc(firestoreDb, "chat_sessions", sessionId, "messages", message.id);
      await setDoc(msgRef, this.serializeMessage(message));

      // Update parent session metadata
      const sessionRef = doc(firestoreDb, "chat_sessions", sessionId);
      await setDoc(
        sessionRef,
        {
          lastUpdated: new Date().toISOString(),
          lastMessage: (message.content || "").slice(0, 100),
          ownerUid: ownerUid || auth?.currentUser?.uid || null,
          userId: ownerUid || auth?.currentUser?.uid || null,
        },
        { merge: true }
      );
    } catch (err) {
      console.error(`Failed to save message ${message.id} to Firestore subcollection:`, err);
    }
  }

  static async saveSession(session: ChatSession, ownerUid?: string): Promise<void> {
    const uid = ownerUid || session.ownerUid || session.userId || auth?.currentUser?.uid;
    const sessionWithUid: ChatSession = {
      ...session,
      ownerUid: uid,
      userId: uid,
    };

    const current = this.loadSessions();
    const idx = current.findIndex((s) => s.id === sessionWithUid.id);
    const updated = idx >= 0 ? [...current] : [sessionWithUid, ...current];
    if (idx >= 0) updated[idx] = sessionWithUid;
    this.saveLocalSessions(updated);

    const firestoreDb = db;
    if (firestoreDb && uid) {
      try {
        const serialized = this.serializeSession(sessionWithUid);
        await setDoc(doc(firestoreDb, "chat_sessions", sessionWithUid.id), serialized, { merge: true });

        // Ensure messages in this session are persisted in subcollection
        if (Array.isArray(sessionWithUid.messages) && sessionWithUid.messages.length > 0) {
          for (const msg of sessionWithUid.messages) {
            const msgRef = doc(firestoreDb, "chat_sessions", sessionWithUid.id, "messages", msg.id);
            await setDoc(msgRef, this.serializeMessage(msg), { merge: true });
          }
        }
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
        // Delete all messages in subcollection first
        const messagesCol = collection(firestoreDb, "chat_sessions", sessionId, "messages");
        const msgsSnap = await getDocs(messagesCol);
        for (const msgDoc of msgsSnap.docs) {
          await deleteDoc(msgDoc.ref);
        }
        // Then delete parent session document
        await deleteDoc(doc(firestoreDb, "chat_sessions", sessionId));
      } catch (err) {
        console.error("Failed to delete session from Firestore:", err);
      }
    }
  }

  // ================= EXPORT =================
  static exportSession(session: ChatSession, agent?: Agent): void {
    const exportData = {
      sessionTitle: session.title,
      agent: agent
        ? { id: agent.id, name: agent.name, role: agent.role }
        : session.agentId,
      exportDate: new Date().toISOString(),
      messages: session.messages.map((msg) => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        agentName: msg.agentName,
        attachment: msg.attachment
          ? {
              name: msg.attachment.name,
              size: msg.attachment.size,
              type: msg.attachment.type,
            }
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
