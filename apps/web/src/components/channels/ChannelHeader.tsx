import type { Channel } from '@chat/shared-types';

export function ChannelHeader({ channel }: { channel: Channel }) {
  return (
    <header className="h-14 px-4 flex items-center border-b border-surface-lighter bg-surface-light">
      <h2 className="font-bold">
        <span className="text-text-muted">#</span> {channel.name}
      </h2>
      {channel.description && (
        <span className="ml-4 text-sm text-text-muted">{channel.description}</span>
      )}
    </header>
  );
}
