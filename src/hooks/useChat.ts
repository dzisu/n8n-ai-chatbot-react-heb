import { useState } from "react";
import { Message, N8NWebhookPayload, Agent, FileAttachment } from "../types/chat";
import { N8NService } from "../services/n8nService";

export const useChat = (
  messages: Message[],
  updateMessages: (messages: Message[]) => void,
  currentSessionId: string | null,
  n8nService: N8NService,
  activeAgent?: Agent
) => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    content: string,
    attachment?: FileAttachment
  ): Promise<void> => {
    if ((!content.trim() && !attachment) || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
      attachment,
    };

    const updatedMessages = [...messages, userMessage];
    updateMessages(updatedMessages);
    setIsLoading(true);

    try {
      const payload: N8NWebhookPayload = {
        message: content.trim(),
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        agentId: activeAgent?.id,
        agentName: activeAgent?.name,
        file: attachment,
      };

      const webhookUrl = activeAgent?.webhookUrl;
      const data = await n8nService.sendMessage(payload, webhookUrl);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        content:
          data.response ||
          data.message ||
          data.output ||
          data.text ||
          "התקבלה תשובה ריקה מהסוכן.",
        sender: "bot",
        timestamp: new Date(),
        agentId: activeAgent?.id,
        agentName: activeAgent?.name,
      };

      const finalMessages = [...updatedMessages, botMessage];
      updateMessages(finalMessages);
    } catch (error) {
      console.error("Error sending message to n8n:", error);

      // Clean, user-friendly error message without leaking technical internals or stack traces
      let errorContent =
        "חלה תקלה זמנית בעיבוד הבקשה מול הסוכן. אנא נסה שוב בעוד רגע.";

      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message.includes("Timeout") || error.message.includes("2 דקות")) {
          errorContent = "זמן ההמתנה עבר (Timeout) - הסוכן לא השיב בתוך 2 דקות. נסה שוב.";
        } else if (error.message.includes("Webhook של הסוכן טרם הוגדרה")) {
          errorContent = error.message;
        }
      }

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: errorContent,
        sender: "bot",
        timestamp: new Date(),
        agentId: activeAgent?.id,
        agentName: activeAgent?.name,
      };

      const finalMessages = [...updatedMessages, errorMessage];
      updateMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};
