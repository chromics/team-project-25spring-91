// src/app/chat/page.tsx
'use client';

import dynamic from 'next/dynamic';

const ChatInterface = dynamic(
  () => import('@/components/ChatInterface'),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">SUSTracker Health Assistant</h1>
      <ChatInterface />
    </div>
  );
}