'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useChatStore } from '@/stores/chat.store';
import { ChannelHeader } from '@/components/channels/ChannelHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import type { ApiResponse, Channel, MessagePage } from '@chat/shared-types';

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const [channel, setChannel] = useState<Channel | null>(null);
  const { setMessages, setActiveChannel } = useChatStore();

  useEffect(() => {
    setActiveChannel(channelId);

    api.get<ApiResponse<Channel>>(`/channels/${channelId}`).then((res) => {
      if (res.data) setChannel(res.data);
    });

    api
      .get<ApiResponse<MessagePage>>(`/channels/${channelId}/messages?limit=50`)
      .then((res) => {
        if (res.data) {
          setMessages(channelId, res.data.messages.reverse());
        }
      });
  }, [channelId, setMessages, setActiveChannel]);

  if (!channel) {
    return <div className="flex-1 flex items-center justify-center text-text-muted">Loading...</div>;
  }

  return (
    <>
      <ChannelHeader channel={channel} />
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </>
  );
}
