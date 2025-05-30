"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from '@/components/auth/sign-up-form';
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { useChat } from "@/hooks/useChat";
import { Message } from "@/types/chat";

export default function ChatPage() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER]
  });

  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    loadConversation,
    loadUserConversations,
    clearChat,
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isAuthorized) {
      loadConversationHistory();
    }
  }, [isAuthorized]);

  const loadConversationHistory = async () => {
    const history = await loadUserConversations();
    if (history?.data) {
      setConversations(history.data);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageToSend = inputValue;
    setInputValue("");
    await sendMessage(messageToSend);
    
    setTimeout(loadConversationHistory, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadConversation = async (id: string) => {
    await loadConversation(id);
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <div
      className={`flex gap-3 mb-4 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role === "assistant" && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback>
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <span className="text-xs opacity-70 mt-2 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      {message.role === "user" && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-3">
            <Bot className="w-6 h-6" />
            AI Assistant
            {user && (
              <span className="text-sm font-normal text-muted-foreground">
                - Welcome, {user.displayName || user.email}
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {conversations.length > 0 ? (
                  conversations.slice(0, 10).map((conv) => (
                    <DropdownMenuItem
                      key={conv.id}
                      onClick={() => handleLoadConversation(conv.id.toString())}
                      className="cursor-pointer p-3"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <span className="text-sm font-medium truncate">
                          {conv.prompt.substring(0, 50)}...
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    No conversation history
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <Bot className="w-16 h-16 mx-auto mb-6 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Welcome to AI Assistant
              </h3>
              <p className="text-sm">
                Start a conversation by typing a message below.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                <Button
                  variant="outline"
                  className="text-left justify-start h-auto p-3"
                  onClick={() => setInputValue("What can you help me with?")}
                >
                  <div className="text-sm">
                    <div className="font-medium">Getting Started</div>
                    <div className="text-muted-foreground text-xs">
                      What can you help me with?
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="text-left justify-start h-auto p-3"
                  onClick={() => setInputValue("Explain quantum computing")}
                >
                  <div className="text-sm">
                    <div className="font-medium">Learn Something</div>
                    <div className="text-muted-foreground text-xs">
                      Explain quantum computing
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1 min-h-[44px]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="lg"
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {conversationId && (
              <div className="mt-3 text-center">
                <span className="text-xs text-muted-foreground">
                  Conversation ID: {conversationId}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
