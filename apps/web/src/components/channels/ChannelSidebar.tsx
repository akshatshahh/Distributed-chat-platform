'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChatStore } from '@/stores/chat.store';
import { useSocket } from '@/providers/SocketProvider';
import { api } from '@/lib/api-client';
import type { ApiResponse, Channel } from '@chat/shared-types';

export function ChannelSidebar() {
  const { channels, setChannels } = useChatStore();
  const [newChannelName, setNewChannelName] = useState('');
  const [creating, setCreating] = useState(false);
  const socket = useSocket();
  const pathname = usePathname();

  useEffect(() => {
    api.get<ApiResponse<Channel[]>>('/channels').then((res) => {
      if (res.data) setChannels(res.data);
    });
  }, [setChannels]);

  useEffect(() => {
    if (!socket) return;
    channels.forEach((ch) => socket.emit('channel:join', ch.id));
  }, [socket, channels]);

  const handleCreate = async () => {
    if (!newChannelName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<ApiResponse<Channel>>('/channels', {
        name: newChannelName.trim(),
        type: 'public',
      });
      if (res.data) {
        setChannels([...channels, res.data]);
        setNewChannelName('');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-surface-lighter flex flex-col h-full">
      <div className="p-4 border-b border-surface-lighter">
        <h2 className="font-bold text-lg">Channels</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {channels.map((ch) => {
          const isActive = pathname === `/channels/${ch.id}`;
          return (
            <Link
              key={ch.id}
              href={`/channels/${ch.id}`}
              className={`block px-3 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-primary text-white' : 'hover:bg-surface-light text-text-muted'
              }`}
            >
              # {ch.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-surface-lighter">
        <div className="flex gap-2">
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="New channel"
            className="flex-1 px-3 py-2 bg-surface rounded text-sm border border-surface-lighter focus:border-primary outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newChannelName.trim()}
            className="px-3 py-2 bg-primary rounded text-sm hover:bg-primary-dark disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
    </aside>
  );
}
