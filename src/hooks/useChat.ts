import { useState } from 'react';
import { Message, N8NWebhookPayload } from '../types/chat';
import { N8NService } from '../services/n8nService';

export const useChat = (
  messages: Message[],
  updateMessages: (messages: Message[]) => void,
  currentSessionId: string | null,
  n8nService: N8NService
) => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    updateMessages(updatedMessages);
    setIsLoading(true);

    try {
      const payload: N8NWebhookPayload = {
        message: content,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      };

      const data = await n8nService.sendMessage(payload);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || data.message || 'Sorry, an error occurred during processing',
        sender: 'bot',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, botMessage];
      updateMessages(finalMessages);

    } catch (error) {
      console.error('Error sending message to n8n:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, unable to connect to AI system at the moment. Please check your n8n webhook URL configuration.',
        sender: 'bot',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      updateMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};