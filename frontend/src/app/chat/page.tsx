// frontend/src/app/chat/page.tsx
import ClientChatWrapper from '@/components/ClientChatWrapper';

export default function ChatPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Fitness Assistant</h1>
      <div className="w-full max-w-3xl mx-auto">
        <ClientChatWrapper />
      </div>
    </main>
  );
}