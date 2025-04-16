import React from 'react';

type ChatMessageProps = {
  content: string;
  role: 'user' | 'assistant';
};

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role }) => {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`p-3 rounded-lg max-w-[80%] ${
          role === 'user'
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;