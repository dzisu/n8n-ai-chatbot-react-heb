export interface User {
  id: string; // Firebase Auth UID
  username: string;
  email: string;
  role: "admin" | "user";
  allowedAgentIds: string[];
  createdAt: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl?: string; // Kept in client memory for upload/preview, stripped before saving to Firestore
  isImage?: boolean;
  rawFile?: File; // Browser File object for binary multipart upload to n8n
  uploadId?: string;
  status?: "pending" | "uploaded" | "error";
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  attachment?: FileAttachment;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  webhookUrl: string;
  avatarIcon?: string; // "sparkles" | "code" | "film" | "book-open" | "bot" | "user" | "brain"
  color?: string; // Tailwind gradient or color key
  isDefault?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  agentId: string;
  messages: Message[];
  messageCount?: number;
  lastMessage?: string;
  createdAt: Date;
  lastUpdated: Date;
  isArchived?: boolean;
  userId?: string;
  ownerUid?: string; // Firebase Auth UID for session isolation
}

export interface N8NWebhookPayload {
  message: string;
  sessionId: string | null;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  userId?: string;
  userEmail?: string;
  file?: FileAttachment;
  rawFile?: File;
}

export interface N8NWebhookResponse {
  response?: string;
  message?: string;
  output?: string;
  text?: string;
  content?: string;
  data?: any;
}
