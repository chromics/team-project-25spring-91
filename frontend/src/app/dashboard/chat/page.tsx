// src/app/chat/page.tsx
'use client';

import { UserRole } from '@/components/auth/sign-up-form';
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection';
import dynamic from 'next/dynamic';

const ChatInterface = dynamic(
  () => import('@/components/ChatInterface'),
  { ssr: false }
);

export default function ChatPage() {
  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER]
  });

  if (isLoading) {
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">SUSTracker Health Assistant</h1>
      <ChatInterface />
    </div>
  );
}