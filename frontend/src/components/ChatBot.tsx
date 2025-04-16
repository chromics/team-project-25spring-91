// frontend/src/components/ChatBot.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';

type Message = {
  id?: number;
  text: string;
  isBot: boolean;
  isLoading?: boolean;
};

type HistoryItem = {
  role: 'user' | 'model';
  parts: string;
};

export default function ChatBot() {
  // Add this to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! I'm your fitness assistant. I can help with workout plans, nutrition advice, and general fitness tips. How can I assist you today?",
      isBot: true
    }
  ]);
  const [userInput, setUserInput] = useState(''); // Initialize with empty string
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Run once on mount to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto scroll to bottom of messages - only runs on client
  useEffect(() => {
    if (messagesEndRef.current && isMounted) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    // Add user message immediately
    const userMessage = userInput;
    setMessages(prev => [...prev, {
      text: userMessage,
      isBot: false
    }]);

    // Add a loading indicator message
    const loadingId = Date.now();
    setMessages(prev => [...prev, {
      id: loadingId,
      text: "...",
      isBot: true,
      isLoading: true
    }]);

    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: history
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg =>
        msg.id === loadingId
          ? { text: data.response, isBot: true, isLoading: false }
          : msg
      ));

      // Update history
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error:', error);

      // Replace loading message with error
      setMessages(prev => prev.map(msg =>
        msg.id === loadingId
          ? { text: `Error: ${error.message || 'Unknown error'}. Please try again.`, isBot: true, isLoading: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Return a consistent UI structure regardless of mounted state
  // The key difference is we'll disable interactivity when not mounted
  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.messagesContainer}>
        {/* When not mounted, just show the initial welcome message */}
        {!isMounted ? (
          <div className={`${styles.message} ${styles.botMessage}`}>
            Loading chat...
          </div>
        ) : (
          // When mounted, show all messages
          messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage} ${message.isLoading ? styles.loading : ''}`}
            >
              {message.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={userInput} // Always provide a value (empty string initially)
          onChange={handleInputChange}
          placeholder="Type your message here..."
          disabled={isLoading || !isMounted}
          className={styles.inputField}
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim() || !isMounted}
          className={styles.submitButton}
        >
          Send
        </button>
      </form>
    </div>
  );
}