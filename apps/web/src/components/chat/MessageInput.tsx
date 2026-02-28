'use client';

import { useState, useRef, useCallback } from 'react';
import { useSocket } from '@/providers/SocketProvider';

export function MessageInput({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('');
  const socket = useSocket();
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleTyping = useCallback(() => {
    if (!socket) return;
    socket.emit('typing:start', channelId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', channelId);
    }, 2000);
  }, [socket, channelId]);

  const handleSend = () => {
    if (!content.trim() || !socket) return;
    socket.emit('message:send', { channelId, content: content.trim() }, (ack) => {
      if (!ack.success) {
        console.error('Failed to send message:', ack.error);
      }
    });
    setContent('');
    socket.emit('typing:stop', channelId);
    clearTimeout(typingTimeout.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-surface-lighter">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-surface-light rounded-lg border border-surface-lighter focus:border-primary outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="px-6 py-3 bg-primary rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
