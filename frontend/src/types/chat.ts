export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt?: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
}

export interface ApiConversation {
  id: number;
  prompt: string;
  response?: string;
  interactionType: string;
  createdAt: string;
}
