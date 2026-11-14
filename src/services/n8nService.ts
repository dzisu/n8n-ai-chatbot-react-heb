import { N8NWebhookPayload, N8NWebhookResponse } from "../types/chat";

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
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
