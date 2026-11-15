import { N8NWebhookPayload, N8NWebhookResponse } from "../types/chat";
import { auth } from "./firebase";

export class N8NService {
  private defaultWebhookUrl: string;

  constructor(defaultWebhookUrl: string = "") {
    this.defaultWebhookUrl = defaultWebhookUrl;
  }

  async sendMessage(
    payload: N8NWebhookPayload,
    webhookUrl?: string
  ): Promise<N8NWebhookResponse> {
    const targetUrl = webhookUrl || this.defaultWebhookUrl;

    if (!targetUrl || targetUrl.includes("your-n8n-instance.com")) {
      throw new Error(
        "כתובת ה-Webhook של הסוכן טרם הוגדרה. יש לפתוח את תפריט הסוכנים ולהגדיר כתובת Webhook תקינה מ-n8n."
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

    try {
      // Obtain Firebase ID token for secure endpoint authorization if authenticated
      let idToken: string | null = null;
      if (auth?.currentUser) {
        try {
          idToken = await auth.currentUser.getIdToken();
        } catch (tokenErr) {
          console.warn("Could not retrieve Firebase ID token:", tokenErr);
        }
      }

      const headers: Record<string, string> = {};
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      let requestBody: BodyInit;

      // Direct binary multipart upload when a file is attached
      if (payload.rawFile) {
        const formData = new FormData();
        formData.append("file", payload.rawFile, payload.rawFile.name);
        formData.append("message", payload.message || "");
        if (payload.sessionId) formData.append("sessionId", payload.sessionId);
        formData.append("timestamp", payload.timestamp || new Date().toISOString());
        if (payload.agentId) formData.append("agentId", payload.agentId);
        if (payload.agentName) formData.append("agentName", payload.agentName);
        if (payload.userId) formData.append("userId", payload.userId);
        if (payload.userEmail) formData.append("userEmail", payload.userEmail);
        if (payload.file?.uploadId) formData.append("uploadId", payload.file.uploadId);

        requestBody = formData;
        // Notice: Do NOT set Content-Type header so browser automatically sets multipart/form-data with boundary
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify({
          message: payload.message,
          sessionId: payload.sessionId,
          timestamp: payload.timestamp,
          agentId: payload.agentId,
          agentName: payload.agentName,
          userId: payload.userId,
          userEmail: payload.userEmail,
          file: payload.file,
        });
      }

      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`שגיאת HTTP מהשרת: ${response.status} (${response.statusText})`);
      }

      const responseText = await response.text();

      if (!responseText.trim()) {
        return { response: "התקבלה תשובה ריקה מהסוכן ב-n8n." };
      }

      try {
        const parsed = JSON.parse(responseText);

        // Handle various n8n response payload structures
        if (typeof parsed === "string") {
          return { response: parsed };
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          return {
            response:
              first.response ||
              first.output ||
              first.text ||
              first.message ||
              first.content ||
              JSON.stringify(first),
          };
        }
        return {
          response:
            parsed.response ||
            parsed.output ||
            parsed.text ||
            parsed.message ||
            parsed.content ||
            (parsed.data ? JSON.stringify(parsed.data) : JSON.stringify(parsed)),
        };
      } catch {
        return { response: responseText };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("זמן ההמתנה עבר (Timeout) - הסוכן ב-n8n לא השיב בתוך 2 דקות.");
      }
      throw error;
    }
  }

  updateDefaultWebhookUrl(url: string): void {
    this.defaultWebhookUrl = url;
  }
}
