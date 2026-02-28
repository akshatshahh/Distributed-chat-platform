'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function MessageList({ channelId }: { channelId: string }) {
  const messages = useChatStore((s) => s.messages[channelId] || []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <TypingIndicator channelId={channelId} />
      <div ref={bottomRef} />
    </div>
  );
}
