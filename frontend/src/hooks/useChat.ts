// hooks/useChat.ts
import { useState, useCallback } from "react";
import { Message, Conversation, ApiConversation } from "@/types/chat";
import api from "@/lib/api";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

const sendMessage = useCallback(
  async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("Sending message:", content); // Debug log
      
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
          conversationId,
          interactionType: "CHAT",
        }),
      });

      console.log("Response status:", response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", errorData); // Debug log
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log("Response data:", data); // Debug log
      
      const aiResponse = data.response;
      const newConversationId = data.conversationId;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (newConversationId) {
        setConversationId(newConversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error); // This will show the actual error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  },
  [messages, conversationId]
);


  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/ai/interactions/${id}`);
      const conversationData = response.data;
      
      // Transform your backend data to match Message interface
      const transformedMessages: Message[] = [];
      
      if (conversationData.data && Array.isArray(conversationData.data)) {
        conversationData.data.forEach((interaction: ApiConversation) => {
          // Add user message
          transformedMessages.push({
            id: `user-${interaction.id}`,
            role: "user",
            content: interaction.prompt,
            timestamp: new Date(interaction.createdAt),
          });
          
          // Add assistant response if exists
          if (interaction.response) {
            transformedMessages.push({
              id: `assistant-${interaction.id}`,
              role: "assistant",
              content: interaction.response,
              timestamp: new Date(interaction.createdAt),
            });
          }
        });
      }
      
      setMessages(transformedMessages);
      setConversationId(id);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }, []);

  const loadUserConversations = useCallback(async () => {
    try {
      const response = await api.get("/ai/interactions");
      return response.data;
    } catch (error) {
      console.error("Error loading conversations:", error);
      return null;
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    loadConversation,
    loadUserConversations,
    clearChat,
  };
};
