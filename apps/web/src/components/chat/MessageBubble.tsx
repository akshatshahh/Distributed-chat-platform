import type { Message } from '@chat/shared-types';

export function MessageBubble({ message }: { message: Message }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group flex items-start gap-3 hover:bg-surface-light/50 px-2 py-1 rounded">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold shrink-0">
        {message.senderId.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{message.senderId.slice(0, 8)}</span>
          <span className="text-xs text-text-muted">{time}</span>
          {message.isEdited && <span className="text-xs text-text-muted">(edited)</span>}
        </div>
        <p className="text-sm break-words">{message.content}</p>
      </div>
    </div>
  );
}
