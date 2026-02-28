import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chat Platform',
  description: 'Distributed real-time chat platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
