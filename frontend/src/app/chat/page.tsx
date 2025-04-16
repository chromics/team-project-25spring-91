// app/chat/page.tsx
import ChatBot from '@/components/ChatBot';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        SUSTracker Fitness Assistant
      </h1>
      <ChatBot />
    </div>
  );
}