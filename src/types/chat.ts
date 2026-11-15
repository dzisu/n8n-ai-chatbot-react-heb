export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: "admin" | "user";
  allowedAgentIds: string[];
  createdAt: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  isImage?: boolean;
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
  createdAt: Date;
  lastUpdated: Date;
  isArchived?: boolean;
}

export interface N8NWebhookPayload {
  message: string;
  sessionId: string | null;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  file?: FileAttachment;
}

export interface N8NWebhookResponse {
  response?: string;
  message?: string;
  output?: string;
  text?: string;
  content?: string;
  data?: any;
}
