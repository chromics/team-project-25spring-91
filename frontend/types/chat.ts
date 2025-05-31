// frontend/types/chat.ts

export interface ChatMessage {
    text: string;
isBot: boolean;
}

export interface WitEntity {
body: string;
confidence: number;
entities?: Record<string, WitEntity[]>;
id: string;
name: string;
role?: string;
start: number;
end: number;
type?: string;
value?: string;
}

export interface WitIntent {
id: string;
name: string;
confidence: number;
}

export interface WitResponse {
text: string;
intents: WitIntent[];
entities: Record<string, WitEntity[]>;
traits?: Record<string, Array<{
id: string;
value: string;
confidence: number;
}>>;
}

export interface ChatResponse {
response: string;
error?: string;
}