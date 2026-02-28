'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@chat/shared-types';
import { useAuthStore } from '../stores/auth.store';
import { useChatStore } from '../stores/chat.store';
import { getSocket, disconnectSocket } from '../lib/socket-client';

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SocketContext = createContext<ChatSocket | null>(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addMessage, updateMessage, removeMessage, setTyping } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    const sock = getSocket(accessToken);
    setSocket(sock);

    sock.on('message:new', (message) => {
      addMessage(message.channelId, message);
    });

    sock.on('message:updated', (message) => {
      updateMessage(message.channelId, message);
    });

    sock.on('message:deleted', ({ channelId, messageId }) => {
      removeMessage(channelId, messageId);
    });

    sock.on('typing:start', ({ channelId, username }) => {
      const current = useChatStore.getState().typingUsers[channelId] || [];
      if (!current.includes(username)) {
        setTyping(channelId, [...current, username]);
      }
    });

    sock.on('typing:stop', ({ channelId, username }) => {
      const current = useChatStore.getState().typingUsers[channelId] || [];
      setTyping(channelId, current.filter((u) => u !== username));
    });

    return () => {
      sock.off('message:new');
      sock.off('message:updated');
      sock.off('message:deleted');
      sock.off('typing:start');
      sock.off('typing:stop');
    };
  }, [isAuthenticated, accessToken, addMessage, updateMessage, removeMessage, setTyping]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
