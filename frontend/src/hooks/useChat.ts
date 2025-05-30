// frontend/hooks/useChat.ts
import { useState, useCallback, useEffect } from "react";
import { Message } from "@/types/chat";
import api from "@/lib/api";

export interface ApiConversation {
  id: number;
  prompt: string;
  response: string;
  interactionType: string;
  createdAt: string;
}

interface PaginatedInteractionsResponse {
  pagination: { page: number; limit: number; totalPages: number; totalItems: number; };
  data: ApiConversation[];
}

interface GenerateChatBackendResponse {
  status: string;
  message: string;
  data: {
    aiResponse: string;
    interactionId: number;
    createdAt: string;
  };
}

const INITIAL_HISTORY_COUNT = 10;

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialHistoryLoaded, setInitialHistoryLoaded] = useState(false);

  const loadInitialHistory = useCallback(async () => {
    if (initialHistoryLoaded) return;

    console.log("useChat: Loading initial history...");
    setIsLoading(true);
    try {
      const response = await api.get<PaginatedInteractionsResponse & { status: string, results: number }>(
        `/ai/interactions?limit=${INITIAL_HISTORY_COUNT}&page=1&sortBy=createdAt:desc`
      );

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const historyInteractions = response.data.data.reverse(); 
        const initialMessages: Message[] = [];
        historyInteractions.forEach(interaction => {
          initialMessages.push({
            id: `user-hist-${interaction.id}-${Date.now()}`,
            role: "user",
            content: interaction.prompt,
            timestamp: new Date(interaction.createdAt),
          });
          if (interaction.response) {
            
            const isBackendErrorResponse = interaction.response.toLowerCase().includes("sorry, i encountered an error") ||
                                           interaction.response.toLowerCase().includes("you have reached your daily limit");
            initialMessages.push({
              id: `assistant-hist-${interaction.id}-${Date.now()}`,
              role: "assistant",
              content: isBackendErrorResponse ? `Error: ${interaction.response}` : interaction.response,
              timestamp: new Date(interaction.createdAt), 
            });
          }
        });
        setMessages(initialMessages);
        console.log(`useChat: Loaded ${initialMessages.length / 2} initial interaction pairs.`);
      } else {
        console.log("useChat: No initial history data found or invalid format.");
      }
      setInitialHistoryLoaded(true);
    } catch (error: any) {
      console.error("useChat: Error loading initial history:", error.response?.data || error.message);
      setMessages([{
        id: `error-initial-load-${Date.now()}`, role: "assistant",
        content: "Error: Could not load recent chat history.", timestamp: new Date()
      }]);
      setInitialHistoryLoaded(true); 
    } finally {
      setIsLoading(false);
    }
  }, [initialHistoryLoaded, api]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!content.trim()) return false;
      if (!initialHistoryLoaded && messages.length === 0) {
        
        setMessages([]);
      }

      const userMessage: Message = {
        id: `user-live-${Date.now()}`, role: "user",
        content, timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await api.post<GenerateChatBackendResponse>("/ai/chat", {
          prompt: content,
        });

        if (response.data && response.data.data && typeof response.data.data.aiResponse === 'string') {
          const { aiResponse, interactionId, createdAt } = response.data.data;
          const assistantMessage: Message = {
            id: `assistant-live-${interactionId || Date.now()}`, role: "assistant",
            content: aiResponse, timestamp: new Date(createdAt || Date.now()),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          return true;
        } else {
          throw new Error("Invalid response structure from backend /ai/chat");
        }
      } catch (error: any) {
        console.error("useChat: Error in sendMessage (calling /ai/chat):", error.response?.data || error.message);
        let errorMessageContent = "Sorry, an unexpected error occurred.";
        if (error.response?.data?.message) {
          errorMessageContent = error.response.data.message;
        } else if (error.message) {
          errorMessageContent = error.message;
        }
        const errorMessage: Message = {
          id: `error-live-${Date.now()}`, role: "assistant",
          content: `Error: ${errorMessageContent}`, timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [api, initialHistoryLoaded, messages.length] 
  );

  const loadConversation = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setInitialHistoryLoaded(true);
      try {
        const response = await api.get<{ status: string, data: ApiConversation }>(`/ai/interactions/${id}`);
        if (!response.data || !response.data.data) {
          throw new Error("Unexpected format for single conversation data");
        }
        const conversationData = response.data.data;
        const loadedMessages: Message[] = [];
        loadedMessages.push({
          id: `user-load-${conversationData.id}`, role: "user",
          content: conversationData.prompt, timestamp: new Date(conversationData.createdAt),
        });
        if (conversationData.response) {
          const isBackendErrorResponse = conversationData.response.toLowerCase().includes("sorry, i encountered an error") ||
                                         conversationData.response.toLowerCase().includes("you have reached your daily limit");
          loadedMessages.push({
            id: `assistant-load-${conversationData.id}`, role: "assistant",
            content: isBackendErrorResponse ? `Error: ${conversationData.response}` : conversationData.response,
            timestamp: new Date(conversationData.createdAt),
          });
        }
        setMessages(loadedMessages);
        setConversationId(id);
        return true;
      } catch (error: any) {
        console.error("useChat: Error loading conversation:", error.response?.data || error.message);
        const errorMessageContent = error.response?.data?.message || error.message || "Failed to load conversation.";
        setMessages([{
          id: `error-load-specific-${Date.now()}`, role: "assistant",
          content: `Error: ${errorMessageContent}`, timestamp: new Date()
        }]);
        setConversationId(null); 
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const loadUserConversations = useCallback(async () => { 
    try {
      const response = await api.get<PaginatedInteractionsResponse & { status: string, results: number }>(
        "/ai/interactions?limit=20&page=1&sortBy=createdAt:desc" 
      );
      return { data: response.data.data || [] };
    } catch (error: any) {
      console.error("useChat: Error loading user conversations for dropdown:", error.response?.data || error.message);
      return { data: [] };
    }
  }, [api]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setInitialHistoryLoaded(true); 
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    initialHistoryLoaded,
    sendMessage,
    loadConversation,
    loadUserConversations,
    clearChat,
    loadInitialHistory,
  };
};
