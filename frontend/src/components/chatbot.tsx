// components/chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/chat';

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hi! I'm your fitness assistant. How can I help you today?", isBot: true }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { text: inputText, isBot: false }]);
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();

      // Add bot response to chat
      setMessages(prev => [...prev, {
        text: data.response || "Sorry, I couldn't process your request right now.",
        isBot: true
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't process your request right now.",
        isBot: true
      }]);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <div className="flex flex-col h-80 overflow-y-auto mb-4 p-2 bg-gray-50 rounded">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`my-1 p-2 rounded-lg max-w-xs ${
              message.isBot
                ? 'bg-blue-100 self-start'
                : 'bg-green-100 self-end'
            }`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="bg-blue-100 self-start my-1 p-2 rounded-lg">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about workouts, exercises, etc."
          className="flex-grow px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-blue-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}