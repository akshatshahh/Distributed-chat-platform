'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';

const PUBLIC_PATHS = ['/', '/login', '/register'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
