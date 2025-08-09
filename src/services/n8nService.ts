import { N8NWebhookPayload, N8NWebhookResponse } from "../types/chat";

export class N8NService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendMessage(payload: N8NWebhookPayload): Promise<N8NWebhookResponse> {
    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  updateWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }
}
