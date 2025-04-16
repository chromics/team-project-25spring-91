// frontend/src/components/ClientChatWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

// Fallback to show during loading
function ChatbotFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-4">Loading chat interface...</h2>
        <div className="h-6 w-6 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

// Dynamically import ChatBot with SSR disabled
const ChatBot = dynamic(() => import('./ChatBot'), {
  ssr: false,
  loading: () => <ChatbotFallback />
});

export default function ClientChatWrapper() {
  return <ChatBot />;
}