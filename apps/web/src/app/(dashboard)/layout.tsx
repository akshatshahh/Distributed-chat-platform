'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ChannelSidebar } from '@/components/channels/ChannelSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="flex h-screen">
          <ChannelSidebar />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}
