export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface N8NWebhookPayload {
  message: string;
  sessionId: string | null;
  timestamp: string;
}

export interface N8NWebhookResponse {
  response?: string;
  message?: string;
}
