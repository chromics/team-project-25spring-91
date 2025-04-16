'use client';

import React from 'react';
import ChatInterface from '../../components/ChatInterface';

export default function ChatPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Cohere AI Chatbot
        </h1>
        <ChatInterface />
      </div>
    </main>
  );
}