import { useChatStore } from '@/stores/chat.store';

export function TypingIndicator({ channelId }: { channelId: string }) {
  const typingUsers = useChatStore((s) => s.typingUsers[channelId] || []);

  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : typingUsers.length === 2
        ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
        : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;

  return <p className="text-xs text-text-muted px-2 py-1 italic">{text}</p>;
}
